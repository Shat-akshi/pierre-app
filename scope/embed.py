"""
Modular Metrics Embeddings Generator
Converts structured business metrics to embeddings and saves to pickle file
"""

import os
import json
import pickle
import yaml
from typing import Dict, Any, Union, List
from sentence_transformers import SentenceTransformer

class MetricsEmbedder:
    def __init__(self, config_path: str = None):
        if config_path is None:
            config_path = "scope/config.yaml" if os.path.exists("scope/config.yaml") else "config.yaml"
        """Initialize with configuration"""
        self.config = self._load_config(config_path)
        self._setup_paths()
        self.model = SentenceTransformer(self.model_name)

    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """Load configuration from YAML"""
        with open(config_path, "r", encoding="utf-8") as file:
            return yaml.safe_load(file)

    def _setup_paths(self):
        """Setup file paths from config"""
        loaders = self.config.get("case_study_loaders", {})
        vectorstore = self.config.get("vectorstore_params", {})
        
        default_processed = "data/clean_case_studies.json"
        docker_processed = "clean_case_studies.json"
        default_embed = "data/metricsextracted_embeddings.pkl"
        docker_embed = "metricsextracted_embeddings.pkl"
        self.processed_data_path = loaders.get("processed_data_path",
            docker_processed if os.path.exists(docker_processed) else default_processed)
        self.embeddings_path = loaders.get("embeddings_path",
            docker_embed if os.path.exists(docker_embed) else default_embed)

        self.model_name = vectorstore.get("embedding_model_name", "all-MiniLM-L6-v2")

    def _metrics_to_text(self, metrics: Dict[str, Any]) -> str:
        """Convert structured metrics to searchable text"""
        parts = [
            f"Company: {metrics.get('company_name', '')}",
            f"Industry: {metrics.get('industry', '')}",
            f"Region: {metrics.get('region', '')}",
            f"Use case: {metrics.get('use_case', '')}",
            f"Size: {metrics.get('company_size', '')}",
            f"Technologies: {' '.join(metrics.get('technologies', []))}",
            f"Results: {' '.join(metrics.get('key_stats', []))}"
        ]
        return ". ".join([p for p in parts if p.strip() and not p.endswith(': ')])

    def _process_case_studies_data(self, case_studies: Union[Dict, List]) -> Dict[str, Any]:
        """Process case studies data regardless of whether it's a dict or list"""
        if isinstance(case_studies, dict):
            # Already in the expected format
            return case_studies
        elif isinstance(case_studies, list):
            # Convert list to dict using index or a unique identifier
            processed = {}
            for i, metrics in enumerate(case_studies):
                # Use filename if available, otherwise use index
                key = metrics.get('filename', f"case_study_{i}")
                processed[key] = metrics
            return processed
        else:
            raise ValueError(f"Unexpected data type: {type(case_studies)}")

    def create_embeddings(self) -> bool:
        """Create embeddings from metrics and save to pickle"""
        try:
            # Load processed metrics
            with open(self.processed_data_path, 'r', encoding='utf-8') as f:
                raw_case_studies = json.load(f)

            # Process data to ensure it's in dict format
            case_studies = self._process_case_studies_data(raw_case_studies)

            # Filter valid metrics (no errors, has meaningful data)
            valid_metrics = {
                filename: metrics for filename, metrics in case_studies.items()
                if not metrics.get('error') and (
                    metrics.get('company_name') or 
                    metrics.get('industry') or 
                    metrics.get('key_stats')
                )
            }

            if not valid_metrics:
                print("No valid metrics found")
                return False

            # Create embeddings database
            embeddings_db = {}
            
            for filename, metrics in valid_metrics.items():
                # Convert metrics to searchable text
                searchable_text = self._metrics_to_text(metrics)
                
                if not searchable_text.strip():
                    continue
                    
                # Create embedding
                embedding = self.model.encode([searchable_text])[0]
                
                # Store in database
                embeddings_db[filename] = {
                    'embedding': embedding,
                    'metrics': metrics,
                    'searchable_text': searchable_text
                }

            # Save to pickle file
            embeddings_dir = os.path.dirname(self.embeddings_path)
            if embeddings_dir:  # Only create directory if path is not empty
                os.makedirs(embeddings_dir, exist_ok=True)
            
            with open(self.embeddings_path, 'wb') as f:
                pickle.dump(embeddings_db, f)

            print(f"✅ Created {len(embeddings_db)} metrics embeddings")
            return True

        except FileNotFoundError:
            print(f"❌ Error: Could not find file {self.processed_data_path}")
            return False
        except json.JSONDecodeError:
            print(f"❌ Error: Invalid JSON in {self.processed_data_path}")
            return False
        except Exception as e:
            print(f"❌ Error creating embeddings: {str(e)}")
            return False

def main():
    """Main execution"""
    embedder = MetricsEmbedder()
    
    if embedder.create_embeddings():
        print(f"Saved to: {embedder.embeddings_path}")
    else:
        print("Failed to create embeddings")

if __name__ == "__main__":
    main()