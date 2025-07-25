"""
Optimized Enhanced Metrics Extraction with Batch Processing
Processes multiple files per API request to maximize efficiency with limited API calls
"""

import os
import yaml
import json
import glob
import requests
from typing import Dict, Any, List, Optional
from langchain_community.document_loaders.pdf import PyPDFLoader

class OptimizedBatchMetricsExtractor:
    def __init__(self, config_path: str = None):
        if config_path is None:
            config_path = "scope/config.yaml" if os.path.exists("scope/config.yaml") else "config.yaml"
        """Initialize the optimized batch metrics extractor with configuration"""
        self.config = self._load_config(config_path)
        self.case_study_dir = self.config["case_study_loaders"]["pdf_directory"]
        self.processed_data_path = self.config["case_study_loaders"]["processed_data_path"]
        self.processed_case_studies = {}
        
        # Watsonx API configuration
        self.watsonx_config = self.config["watsonx"]
        self.llm_params = self.config["llm_params"]
        
        # Batch processing configuration from config file
        batch_config = self.config.get("batch_processing", {})
        self.files_per_request = batch_config.get("files_per_request", 16)
        self.max_chars_per_file = batch_config.get("max_chars_per_file", 10000)
        self.timeout_seconds = batch_config.get("timeout_seconds", 180)
        
        self._setup_directories()
        self.load_existing_data()

    def _load_config(self, config_path: str) -> Dict:
        """Load configuration from YAML file"""
        with open(config_path, "r", encoding="utf-8") as file:
            return yaml.safe_load(file)

    def _setup_directories(self):
        """Create necessary directories"""
        os.makedirs(self.case_study_dir, exist_ok=True)
        processed_dir = os.path.dirname(self.processed_data_path)
        if processed_dir:
            os.makedirs(processed_dir, exist_ok=True)

    def load_existing_data(self):
        """Load previously processed case studies"""
        if os.path.exists(self.processed_data_path):
            print("Loading cached processed case studies...")
            with open(self.processed_data_path, 'r') as f:
                self.processed_case_studies = json.load(f)

    def load_pdf_content(self, pdf_path: str) -> str:
        """Load and clean PDF content"""
        try:
            filename = os.path.basename(pdf_path)
            print(f"Loading PDF: {filename}")
            loader = PyPDFLoader(pdf_path)
            docs = loader.load()
            text = " ".join([doc.page_content for doc in docs])
            
            # Clean and truncate text for batch processing
            text = self._clean_text(text)
            return text[:self.max_chars_per_file]  # Limit text size
            
        except Exception as e:
            print(f"Error loading {pdf_path}: {str(e)}")
            return f"ERROR_LOADING_FILE: {str(e)}"

    def _clean_text(self, text: str) -> str:
        """Clean and prepare text for processing"""
        import re
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'[^\w\s\-\.\,\(\)\%\$]', ' ', text)
        return text.strip()

    def call_watsonx_batch_api(self, batch_data: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        """Call Watsonx API for batch processing multiple case studies"""
        
        # Enhanced system prompt for batch processing
        batch_system_prompt = """You are an expert business analyst specializing in extracting meaningful business metrics from IBM case studies. You will process MULTIPLE case studies in one request.

CRITICAL INSTRUCTIONS:
1. Process each case study separately and return results as a JSON array
2. Only extract metrics that make logical business sense
3. Always include the CONTEXT of what each metric represents
4. Ignore nonsensical numbers (like "20 years time savings" or isolated percentages)
5. Focus on realistic business improvements (efficiency gains, cost reductions, revenue increases, etc.)
6. If a percentage is mentioned, extract what it specifically improved

FOR EACH CASE STUDY, EXTRACT THESE FIELDS:
- filename: The filename provided
- company_name: The actual client company name
- industry: Specific industry sector (be precise, not generic)
- region: Geographic region or country
- use_case: Detailed description of the business problem solved
- technologies: List of specific IBM technologies/products used
- business_outcomes: Object with categorized meaningful metrics
- company_size: Enterprise, Mid-market, or SMB

BUSINESS OUTCOMES FORMAT:
{
  "cost_savings": "Description with amount/percentage if available",
  "time_efficiency": "Description of time improvements with context",
  "productivity_gains": "Description of productivity improvements",
  "revenue_impact": "Description of revenue/business growth impact",
  "operational_efficiency": "Description of operational improvements",
  "customer_satisfaction": "Description of customer experience improvements",
  "other_benefits": "Any other quantified benefits"
}

VALIDATION RULES:
- If a metric doesn't make sense, don't include it
- Time savings should be reasonable (hours, days, weeks - not years unless it's process lifecycle)
- Percentages should have clear context
- Only include metrics explicitly stated in the case study
- If no meaningful metrics found, use empty strings/objects
- If file content has loading errors, mark accordingly

Return ONLY a valid JSON array with one object per case study, no additional text."""

        # Create batch content for the prompt
        batch_content = "BATCH PROCESSING REQUEST - Process the following case studies:\n\n"
        for i, item in enumerate(batch_data, 1):
            batch_content += f"=== CASE STUDY {i}: {item['filename']} ===\n"
            if item['content'].startswith("ERROR_LOADING_FILE"):
                batch_content += f"FILE_LOADING_ERROR: {item['content']}\n\n"
            else:
                batch_content += f"{item['content']}\n\n"

        user_prompt = f"""{batch_content}

Extract meaningful business metrics for each case study following the specified format. Return a JSON array with one object per case study in the same order as provided."""

        # Prepare the API request
        messages = [
            {
                "role": "system",
                "content": batch_system_prompt
            },
            {
                "role": "user", 
                "content": user_prompt
            }
        ]

        request_body = {
            "messages": messages,
            "project_id": self.watsonx_config["project_id"],
            "model_id": self.watsonx_config["model_id"],
            "max_tokens": 4000,  # Increased for batch processing
            "temperature": self.llm_params["temperature"],
            "top_p": self.llm_params["top_p"],
            "frequency_penalty": self.llm_params["frequency_penalty"],
            "presence_penalty": self.llm_params["presence_penalty"]
        }

        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.watsonx_config['access_token']}"
        }

        try:
            print(f"Calling Watsonx API for batch of {len(batch_data)} files...")
            response = requests.post(
                self.watsonx_config["url"],
                headers=headers,
                json=request_body,
                timeout=self.timeout_seconds  # Use config timeout
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                
                # Try to parse JSON response
                try:
                    metrics_batch = json.loads(content)
                    if isinstance(metrics_batch, list):
                        return metrics_batch
                    else:
                        # If single object returned, wrap in array
                        return [metrics_batch]
                except json.JSONDecodeError:
                    # If JSON parsing fails, try to extract JSON from the response
                    import re
                    json_match = re.search(r'\[.*\]', content, re.DOTALL)
                    if json_match:
                        metrics_batch = json.loads(json_match.group())
                        return metrics_batch
                    else:
                        # Try to find single object
                        json_match = re.search(r'\{.*\}', content, re.DOTALL)
                        if json_match:
                            metrics = json.loads(json_match.group())
                            return [metrics]  # Wrap single result in array
                        else:
                            raise ValueError("No valid JSON found in response")
                        
            else:
                raise Exception(f"API request failed: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"Watsonx batch API call failed: {str(e)}")
            # Return error objects for each file in the batch
            return [self._create_error_metrics(item['filename'], str(e)) for item in batch_data]

    def process_batch(self, pdf_files: List[str]) -> Dict[str, Dict[str, Any]]:
        """Process a batch of PDF files"""
        batch_data = []
        
        # Load all PDFs in the batch
        for pdf_file in pdf_files:
            filename = os.path.basename(pdf_file)
            content = self.load_pdf_content(pdf_file)
            batch_data.append({
                'filename': filename,
                'content': content
            })
        
        # Call API for the entire batch
        try:
            metrics_batch = self.call_watsonx_batch_api(batch_data)
            
            # Process results
            results = {}
            for i, metrics in enumerate(metrics_batch):
                if i < len(batch_data):
                    filename = batch_data[i]['filename']
                    validated_metrics = self._validate_metrics(metrics, filename)
                    results[filename] = validated_metrics
                    self._print_extraction_summary(filename, validated_metrics)
            
            # Handle case where fewer results than expected
            for i in range(len(metrics_batch), len(batch_data)):
                filename = batch_data[i]['filename']
                results[filename] = self._create_error_metrics(filename, "No result returned from API")
            
            return results
            
        except Exception as e:
            print(f"Batch processing failed: {str(e)}")
            # Return error metrics for all files in batch
            results = {}
            for item in batch_data:
                results[item['filename']] = self._create_error_metrics(item['filename'], str(e))
            return results

    def extract_all_metrics_batch(self, force_reprocess: bool = False, force_files: Optional[List[str]] = None):
        """Extract metrics from all case study PDFs using batch processing"""
        pdf_files = glob.glob(os.path.join(self.case_study_dir, "**/*.pdf"), recursive=True)
        
        # Filter files that need processing
        files_to_process = []
        for pdf_file in pdf_files:
            filename = os.path.basename(pdf_file)
            if self._should_process_file(filename, force_reprocess, force_files):
                files_to_process.append(pdf_file)
        
        print(f"Found {len(files_to_process)} PDF files to process...")
        print(f"Processing in batches of {self.files_per_request} files per API request")
        
        # Split into batches
        batches = [files_to_process[i:i + self.files_per_request] 
                  for i in range(0, len(files_to_process), self.files_per_request)]
        
        print(f"Total batches to process: {len(batches)}")
        
        total_processed = 0
        for batch_num, batch_files in enumerate(batches, 1):
            print(f"\n{'='*60}")
            print(f"PROCESSING BATCH {batch_num}/{len(batches)}")
            print(f"Files in this batch: {len(batch_files)}")
            print(f"{'='*60}")
            
            # Process the batch
            batch_results = self.process_batch(batch_files)
            
            # Update processed case studies
            self.processed_case_studies.update(batch_results)
            total_processed += len(batch_results)
            
            # Save progress after each batch
            self.save_processed_data()
            print(f"\n*** Batch {batch_num} completed - {total_processed} files processed total ***")
        
        print(f"\n{'='*60}")
        print(f"BATCH EXTRACTION COMPLETED")
        print(f"Total processed: {total_processed} files")
        print(f"Total case studies in database: {len(self.processed_case_studies)}")
        print(f"{'='*60}")

    def _validate_metrics(self, metrics: Dict[str, Any], filename: str) -> Dict[str, Any]:
        """Validate and clean extracted metrics"""
        validated = {
            'source_file': filename,
            'processing_method': 'Enhanced_Batch_LLM'
        }
        
        # Basic field validation
        validated['company_name'] = str(metrics.get('company_name', '')).strip()
        validated['industry'] = str(metrics.get('industry', '')).strip()
        validated['region'] = str(metrics.get('region', '')).strip()
        validated['use_case'] = str(metrics.get('use_case', '')).strip()
        validated['company_size'] = str(metrics.get('company_size', '')).strip()
        
        # Technologies validation
        technologies = metrics.get('technologies', [])
        if isinstance(technologies, list):
            validated['technologies'] = [str(tech).strip() for tech in technologies if tech]
        elif isinstance(technologies, str):
            validated['technologies'] = [tech.strip() for tech in technologies.split(',') if tech.strip()]
        else:
            validated['technologies'] = []

        # Business outcomes validation
        business_outcomes = metrics.get('business_outcomes', {})
        if isinstance(business_outcomes, dict):
            validated['business_outcomes'] = {}
            for key, value in business_outcomes.items():
                if value and str(value).strip():
                    validated['business_outcomes'][key] = str(value).strip()
        else:
            validated['business_outcomes'] = {}
            
        return validated

    def _create_error_metrics(self, filename: str, error: str) -> Dict[str, Any]:
        """Create error metrics dictionary"""
        return {
            "source_file": filename,
            "error": error,
            "processing_method": "batch_error",
            "company_name": "",
            "industry": "",
            "region": "",
            "use_case": "",
            "technologies": [],
            "business_outcomes": {},
            "company_size": ""
        }

    def _print_extraction_summary(self, filename: str, metrics: Dict[str, Any]):
        """Print a summary of extracted metrics"""
        print(f"\nEXTRACTED: {filename}")
        print(f"Company: {metrics.get('company_name', 'N/A')}")
        print(f"Industry: {metrics.get('industry', 'N/A')}")
        business_outcomes = metrics.get('business_outcomes', {})
        print(f"Outcomes: {len(business_outcomes)} categories")

    def _should_process_file(self, filename: str, force_reprocess: bool, force_files: Optional[List[str]]) -> bool:
        """Determine if a file should be processed"""
        return (
            filename not in self.processed_case_studies or
            force_reprocess or
            (force_files and filename in force_files)
        )

    def save_processed_data(self):
        """Save processed data to JSON file"""
        processed_dir = os.path.dirname(self.processed_data_path)
        if processed_dir:
            os.makedirs(processed_dir, exist_ok=True)
        
        with open(self.processed_data_path, 'w') as f:
            json.dump(self.processed_case_studies, f, indent=2)

    def export_to_csv(self, output_file: str = "batch_extracted_metrics.csv"):
        """Export processed metrics to CSV"""
        import csv
        
        with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = [
                'filename', 'company_name', 'industry', 'region', 'use_case', 
                'technologies', 'company_size', 'processing_method', 'has_error',
                'cost_savings', 'time_efficiency', 'productivity_gains', 
                'revenue_impact', 'operational_efficiency', 'customer_satisfaction', 
                'other_benefits'
            ]
            
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for filename, metrics in self.processed_case_studies.items():
                business_outcomes = metrics.get("business_outcomes", {})
                
                row = {
                    "filename": filename,
                    "company_name": metrics.get("company_name", ""),
                    "industry": metrics.get("industry", ""),
                    "region": metrics.get("region", ""),
                    "use_case": metrics.get("use_case", "")[:200] + "..." if len(metrics.get("use_case", "")) > 200 else metrics.get("use_case", ""),
                    "technologies": "; ".join(metrics.get("technologies", [])),
                    "company_size": metrics.get("company_size", ""),
                    "processing_method": metrics.get("processing_method", ""),
                    "has_error": "error" in metrics,
                    "cost_savings": business_outcomes.get("cost_savings", ""),
                    "time_efficiency": business_outcomes.get("time_efficiency", ""),
                    "productivity_gains": business_outcomes.get("productivity_gains", ""),
                    "revenue_impact": business_outcomes.get("revenue_impact", ""),
                    "operational_efficiency": business_outcomes.get("operational_efficiency", ""),
                    "customer_satisfaction": business_outcomes.get("customer_satisfaction", ""),
                    "other_benefits": business_outcomes.get("other_benefits", "")
                }
                writer.writerow(row)
        
        print(f"\nBatch metrics exported to: {output_file}")

    def get_api_usage_estimate(self) -> Dict[str, int]:
        """Estimate API usage for processing"""
        pdf_files = glob.glob(os.path.join(self.case_study_dir, "**/*.pdf"), recursive=True)
        files_to_process = []
        
        for pdf_file in pdf_files:
            filename = os.path.basename(pdf_file)
            if filename not in self.processed_case_studies:
                files_to_process.append(pdf_file)
        
        batches_needed = (len(files_to_process) + self.files_per_request - 1) // self.files_per_request
        
        return {
            "total_pdf_files": len(pdf_files),
            "files_to_process": len(files_to_process),
            "files_already_processed": len(self.processed_case_studies),
            "batches_needed": batches_needed,
            "files_per_batch": self.files_per_request,
            "api_requests_needed": batches_needed
        }


# Example usage
if __name__ == "__main__":
    # Initialize the optimized batch extractor
    extractor = OptimizedBatchMetricsExtractor()
    
    # Check API usage estimate
    usage_estimate = extractor.get_api_usage_estimate()
    print("=== API USAGE ESTIMATE ===")
    for key, value in usage_estimate.items():
        print(f"{key}: {value}")
    
    if usage_estimate["api_requests_needed"] <= 7:
        print(f"\n✅ Processing can be completed with {usage_estimate['api_requests_needed']} API requests")
        
        # Process all files using batch method
        print("\n=== STARTING BATCH PROCESSING ===")
        extractor.extract_all_metrics_batch(force_reprocess=True)
        
        # Export results
        extractor.export_to_csv()
        
    else:
        print(f"\n❌ Need {usage_estimate['api_requests_needed']} API requests but only have 7")
        print("Consider increasing files_per_request or processing in stages")