"""
Metrics-Based Case Study Retrieval
Search for case studies with similar business outcomes using metrics embeddings
"""

import os
import json
import pickle
import yaml
from typing import List, Dict, Any, Tuple
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

class MetricsRetriever:
    def __init__(self, config_path: str = None):
        if config_path is None:
            config_path = "scope/config.yaml" if os.path.exists("scope/config.yaml") else "config.yaml"
        """Initialize metrics retriever"""
        self.config = self._load_config(config_path)
        self._setup_paths()
        self.model = SentenceTransformer(self.model_name)
        self.embeddings_db = self._load_embeddings()

    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """Load configuration from YAML"""
        with open(config_path, "r", encoding="utf-8") as file:
            return yaml.safe_load(file)

    def _setup_paths(self):
        """Setup paths from config"""
        loaders = self.config.get("case_study_loaders", {})
        vectorstore = self.config.get("vectorstore_params", {})
        
        default_path = "data/metricext_embeddings.pkl"
        docker_path = "metricext_embeddings.pkl"
        self.embeddings_path = loaders.get("embeddings_path",
            docker_path if os.path.exists(docker_path) else default_path)
        self.model_name = vectorstore.get("embedding_model_name", "all-MiniLM-L6-v2")

    def _load_embeddings(self) -> Dict[str, Any]:
        """Load metrics embeddings from pickle file"""
        if not os.path.exists(self.embeddings_path):
            print(f"❌ Embeddings file not found: {self.embeddings_path}")
            return {}
        
        try:
            with open(self.embeddings_path, 'rb') as f:
                embeddings_db = pickle.load(f)
            print(f"✅ Loaded {len(embeddings_db)} metrics embeddings")
            return embeddings_db
        except Exception as e:
            print(f"❌ Error loading embeddings: {e}")
            return {}

    def search_similar_cases(self, query: str, top_k: int = 5, threshold: float = 0.3) -> List[Dict[str, Any]]:
        """Search for cases with similar business outcomes"""
        if not self.embeddings_db:
            print("❌ No embeddings loaded")
            return []

        print(f"🔍 Searching for: '{query}'")
        
        # Create query embedding
        try:
            query_embedding = self.model.encode([query])[0]
        except Exception as e:
            print(f"❌ Error creating query embedding: {e}")
            return []

        # Search through metrics embeddings
        results = []
        for filename, data in self.embeddings_db.items():
            try:
                # Calculate similarity with metrics embedding
                similarity = cosine_similarity(
                    [query_embedding], 
                    [data['embedding']]
                )[0][0]
                
                if similarity >= threshold:
                    results.append({
                        'filename': filename,
                        'similarity': similarity,
                        'metrics': data['metrics'],
                        'searchable_text': data['searchable_text']
                    })
                    
            except Exception as e:
                print(f"⚠️ Error processing {filename}: {e}")
                continue

        # Sort by similarity and return top_k
        results.sort(key=lambda x: x['similarity'], reverse=True)
        return results[:top_k]

    def _format_business_outcomes_combined(self, business_outcomes_combined) -> str:
        
        if not business_outcomes_combined:
            return "N/A"
        
        # Handle different data types
        if isinstance(business_outcomes_combined, str):
            if business_outcomes_combined.strip():
                return business_outcomes_combined
            else:
                return "N/A"
        
        if isinstance(business_outcomes_combined, list):
            # If it's a list, try to join non-empty items
            if business_outcomes_combined:
                # Filter out empty strings and None values
                filtered_stats = [str(stat) for stat in business_outcomes_combined if stat and str(stat).strip()]
                if filtered_stats:
                    return "; ".join(filtered_stats)
                else:
                    return "Results data available but empty"
            else:
                return "N/A"
        
        if isinstance(business_outcomes_combined, dict):
            sentences = []
            
            # Handle percentages
            percentages = business_outcomes_combined.get('percentages', [])
            if percentages:
                for pct in percentages:
                    sentences.append(f"achieved {pct} improvement")
            
            # Handle time savings
            time_savings = business_outcomes_combined.get('time_savings', [])
            if time_savings:
                if len(time_savings) == 1:
                    sentences.append(f"reduced time by {time_savings[0]}")
                else:
                    sentences.append(f"time savings of {', '.join(time_savings)}")
            
            # Handle dollar amounts
            dollar_amounts = business_outcomes_combined.get('dollar_amounts', [])
            if dollar_amounts:
                for amount in dollar_amounts:
                    sentences.append(f"saved {amount}")
            
            # Handle efficiency gains
            efficiency_gains = business_outcomes_combined.get('efficiency_gains', [])
            if efficiency_gains:
                for gain in efficiency_gains:
                    sentences.append(f"efficiency increased by {gain}")
            
            # If we have sentences, join them
            if sentences:
                return "; ".join(sentences)
            else:
                # If dict has values but we couldn't parse them, show non-empty ones
                non_empty = {k: v for k, v in business_outcomes_combined.items() if v}
                if non_empty:
                    return f"Results: {str(non_empty)}"
                else:
                    return "Results available but not detailed"
        
        # Handle numbers
        if isinstance(business_outcomes_combined, (int, float)):
            return str(business_outcomes_combined)
        
        # Fallback for other types
        return str(business_outcomes_combined) if str(business_outcomes_combined).strip() else "N/A"

    def display_results(self, results: List[Dict[str, Any]]):
        if not results:
            print("❌ No similar case studies found")
            return
        print(f"\n🎯 Found {len(results)} similar case studies:\n")
        print("=" * 80)
        for i, result in enumerate(results, 1):
            try:
                metrics = result.get('metrics', {})
                print(f"\n{i}. 📄 {result.get('filename', 'Unknown file')}")
                print(f"   🔗 Source: {metrics.get('source_url', 'N/A')}")
                print(f"   🎯 Similarity Score: {result.get('similarity', 0):.3f}")
                print(f"   🏢 Company: {metrics.get('company_name', 'N/A')}")
                print(f"   🏭 Industry: {metrics.get('industry', 'N/A')}")
                print(f"   📍 Region: {metrics.get('region', 'N/A')}")
                print(f"   💼 Use Case: {metrics.get('use_case', 'N/A')}")
                print(f"   📊 Company Size: {metrics.get('company_size', 'N/A')}")
                business_outcomes_combined = metrics.get('business_outcomes_combined')
                formatted_stats = self._format_business_outcomes_combined(business_outcomes_combined)
                print(f"   📈 Key Results: {formatted_stats}")
                technologies = metrics.get('technologies', [])
                if technologies:
                    if isinstance(technologies, (list, tuple)):
                        tech_to_show = technologies[:3] if len(technologies) > 3 else technologies
                        tech_str = ', '.join(str(tech) for tech in tech_to_show if tech)
                        if len(technologies) > 3:
                            tech_str += f" (and {len(technologies) - 3} more)"
                        print(f"   💻 Technologies: {tech_str}")
                    else:
                        print(f"   💻 Technologies: {str(technologies)}")
                else:
                    print(f"   💻 Technologies: N/A")
                
                additional_fields = ['solution_type', 'deployment_model', 'business_value', 'key_benefits']
                for field in additional_fields:
                    if field in metrics and metrics[field]:
                        field_name = field.replace('_', ' ').title()
                        print(f"   📋 {field_name}: {metrics[field]}")
                print("-" * 80)
            except Exception as e:
                print(f"   ⚠️ Error displaying result {i}: {e}")
                print(f"   📄 Filename: {result.get('filename', 'Unknown')}")
                print("-" * 80)
                continue

    def get_business_outcomes_summary(self, results: List[Dict[str, Any]]) -> str:
        """Create summary of business outcomes for similar cases"""
        if not results:
            return "No similar cases found."

        summary_parts = []
        summary_parts.append(f"Found {len(results)} similar case studies:\n")
        
        for i, result in enumerate(results, 1):
            metrics = result['metrics']
            company = metrics.get('company_name', 'Company')
            industry = metrics.get('industry', 'Industry')
            use_case = metrics.get('use_case', 'Use case')
            business_outcomes_combined = metrics.get('business_outcomes_combined', [])
            
            outcome = f"{i}. {company} ({industry})"
            if use_case:
                outcome += f" - {use_case}"
            
            # Use the same formatting function for consistency
            formatted_stats = self._format_business_outcomes_combined(business_outcomes_combined)
            if formatted_stats and formatted_stats != "N/A":
                outcome += f" - {formatted_stats}"
            
            summary_parts.append(outcome)
        
        return "\n".join(summary_parts)

    def debug_embeddings_data(self):
        """Debug function to inspect embeddings data structure"""
        print("\n🔍 DEBUG: Inspecting embeddings data structure")
        print("=" * 60)
        
        if not self.embeddings_db:
            print("❌ No embeddings data loaded")
            return
        
        # Show first few entries
        for i, (filename, data) in enumerate(list(self.embeddings_db.items())[:3]):
            print(f"\n{i+1}. File: {filename}")
            metrics = data.get('metrics', {})
            print(f"   Metrics keys: {list(metrics.keys())}")
            
            business_outcomes_combined = metrics.get('business_outcomes_combined')
            print(f"   business_outcomes_combined type: {type(business_outcomes_combined)}")
            print(f"   business_outcomes_combined value: {repr(business_outcomes_combined)}")
            
            if isinstance(business_outcomes_combined, dict):
                print(f"   business_outcomes_combined keys: {list(business_outcomes_combined.keys())}")
            elif isinstance(business_outcomes_combined, list):
                print(f"   business_outcomes_combined length: {len(business_outcomes_combined)}")
                if business_outcomes_combined:
                    print(f"   first item type: {type(business_outcomes_combined[0])}")
                    print(f"   first item: {repr(business_outcomes_combined[0])}")
            
            print("-" * 40)

    def interactive_search(self):
        """Interactive CLI for searching case studies"""
        print("\n" + "=" * 60)
        print("🔍 METRICS-BASED CASE STUDY SEARCH")
        print("=" * 60)
        print("Search for case studies with similar business outcomes")
        print("Type 'debug' to inspect data, 'quit' or 'exit' to stop")
        print("-" * 60)

        while True:
            try:
                query = input("\n💬 Enter your search query: ").strip()
                
                if query.lower() in ['quit', 'exit', 'q']:
                    print("Bye bro!")
                    break
                
                if query.lower() == 'debug':
                    self.debug_embeddings_data()
                    continue
                
                if not query:
                    print("❌ Please enter a valid query")
                    continue

                # Search for similar cases
                results = self.search_similar_cases(query, top_k=5)
                
                # Display results
                self.display_results(results)
                
                # Show business outcomes summary
                if results:
                    print(f"\n📋 Business Outcomes Summary:")
                    print("-" * 50)
                    summary = self.get_business_outcomes_summary(results)
                    print(summary)

            except KeyboardInterrupt:
                print("\n👋 Goodbye!")
                break
            except Exception as e:
                print(f"❌ Error during search: {e}")

    def search_once(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Single search function for programmatic use"""
        results = self.search_similar_cases(query, top_k)
        self.display_results(results)
        return results


def main():
    """Main execution function"""
    print("🚀 Metrics-Based Case Study Retrieval")
    print("=" * 50)
    
    try:
        # Initialize retriever
        retriever = MetricsRetriever()
        
        if not retriever.embeddings_db:
            print("❌ No embeddings available. Please run embed.py first.")
            return
        
        # Start interactive search
        retriever.interactive_search()
        
    except FileNotFoundError as e:
        print(f"❌ Configuration file not found: {e}")
        print("💡 Make sure config.yaml exists")
    except Exception as e:
        print(f"❌ Error starting retrieval system: {e}")


if __name__ == "__main__":
    main()