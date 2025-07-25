"""
AI-Powered Sales Pitch Generator with CLI Interface
Generates personalized sales pitches using IBM Granite LLM and case study metrics
"""

import os
import yaml
import json
import argparse
from datetime import datetime
from typing import Dict, Any, List, Optional
from retrieve import MetricsRetriever
from rugged import callx

class PitchGenerator:
    def __init__(self, config_path: str = None):
        if config_path is None:
            config_path = "scope/config.yaml" if os.path.exists("scope/config.yaml") else "config.yaml"
        """Initialize pitch generator with existing configuration"""
        self.config = self._load_config(config_path)
        self.processed_data_path = self.config["case_study_loaders"]["processed_data_path"]
        
        # Pitch templates and prompts
        self.pitch_templates = {
            'email': self._get_email_template(),
            'presentation': self._get_presentation_template(),
            'executive_summary': self._get_executive_template(),
            'cold_outreach': self._get_cold_outreach_template()
        }
        
    def _load_config(self, config_path: str) -> Dict:
        """Load configuration from YAML file"""
        with open(config_path, "r", encoding="utf-8") as file:
            return yaml.safe_load(file)
    
    def generate_pitch(self, 
                  case_study_results: List[Dict[str, Any]], 
                  pitch_type: str = "email",
                  target_info: Dict[str, str] = None,
                  custom_context: str = "",
                  bookmarked_case_studies: List[Dict[str, Any]] = None,  # NEW
                  bookmarked_use_cases: List[str] = None,                # NEW
                  pitch_scenario: str = "generic") -> str:               # NEW
        """
        Generate AI-powered sales pitch using case study data
        
        Args:
            case_study_results: List of similar case studies from retrieve.py
            pitch_type: Type of pitch ('email', 'presentation', 'executive_summary', 'cold_outreach')
            target_info: Target company/contact information
            custom_context: Additional context for personalization
            bookmarked_case_studies: List of bookmarked case studies for reference
            bookmarked_use_cases: List of use cases extracted from bookmarks
            pitch_scenario: Type of pitch scenario ('enhanced_with_bookmarks', 'generic', etc.)
        """
    
        if not case_study_results:
            return "No relevant case studies found to generate pitch."
        
        # Set defaults for new parameters
        if bookmarked_case_studies is None:
            bookmarked_case_studies = []
        if bookmarked_use_cases is None:
            bookmarked_use_cases = []
        
        # Determine if we should anonymize company names
        has_bookmarks = len(bookmarked_case_studies) > 0
        should_anonymize = not has_bookmarks
        
        print(f"🎯 Generating pitch - Has bookmarks: {has_bookmarks}, Should anonymize: {should_anonymize}")
        
        # Extract key metrics and outcomes from case studies
        pitch_data = self._extract_pitch_data(
            case_study_results,
            bookmarked_case_studies,
            bookmarked_use_cases,
            should_anonymize
        )
        
        # Build context-aware prompt with SPECIFIC case study details
        pitch_prompt = self._build_pitch_prompt(
            pitch_data, 
            pitch_type, 
            target_info, 
            custom_context,
            pitch_scenario,
            has_bookmarks
        )
        
        # Generate pitch using IBM Granite LLM via rugged.py
        try:
            print(f"🤖 Generating {pitch_type} pitch using IBM Granite LLM...")
            
            # Create detailed instruction with specific case study data
            detailed_context = self._create_detailed_context(pitch_data, should_anonymize)
            
            generated_pitch = callx(
                text=detailed_context,
                instruction=pitch_prompt
            )
            
            # Return clean, directly copyable pitch (no extra formatting)
            clean_pitch = self._clean_pitch_output(generated_pitch)
            
            # Save pitch for reference (with metadata)
            self._save_pitch(clean_pitch, pitch_type, target_info)
            
            return clean_pitch
            
        except Exception as e:
            return f"Error generating pitch: {str(e)}"
    
    def _extract_pitch_data(self, 
                       case_studies: List[Dict[str, Any]], 
                       bookmarked_case_studies: List[Dict[str, Any]] = None,
                       bookmarked_use_cases: List[str] = None,
                       should_anonymize: bool = False) -> Dict[str, Any]:
        """Extract relevant data from case studies for pitch generation"""
        
        # Set defaults
        bookmarked_case_studies = bookmarked_case_studies or []
        bookmarked_use_cases = bookmarked_use_cases or []
        
        pitch_data = {
            'total_cases': len(case_studies),
            'industries': set(),
            'regions': set(),
            'technologies': set(),
            'detailed_case_studies': [],
            'quantified_results': [],
            'use_cases': [],
            'company_sizes': set(),
            'case_studies_summary': "",
            'bookmarked_use_cases': bookmarked_use_cases,           # NEW
            'has_bookmarks': bool(bookmarked_case_studies),         # NEW
            'bookmark_count': len(bookmarked_case_studies),         # NEW
            'should_anonymize': should_anonymize                    # NEW
        }
        
        summary_parts = []
        
        for i, result in enumerate(case_studies, 1):
            # Handle both formats: direct metrics or nested structure
            if 'metrics' in result:
                metrics = result['metrics']
            else:
                # This handles the format from app.py where data might be directly in result
                metrics = result
            
            # Extract company name with fallbacks
            original_company_name = (
                metrics.get('company_name') or 
                metrics.get('company') or 
                result.get('filename', f'Company_{i}').replace('.pdf', '').replace('_', ' ')
            )
            
            # Get other key data
            industry = metrics.get('industry', 'Technology')
            region = metrics.get('region', 'Global')
            use_case = metrics.get('use_case', 'Business transformation')
            company_size = metrics.get('company_size', 'Enterprise')
            
            # Anonymize company name if needed
            if should_anonymize:
                company_name = self._anonymize_company_name(original_company_name, industry, region, company_size)
            else:
                company_name = original_company_name
            
            # Handle technologies (can be list or string)
            technologies = metrics.get('technologies', metrics.get('product', []))
            if isinstance(technologies, str):
                tech_list = [technologies]
            elif isinstance(technologies, list):
                tech_list = technologies
            else:
                tech_list = ['IBM Technology']
            
            # Get business outcomes
            key_results = metrics.get('key_results', 'Significant business improvement')
            business_outcomes_combined = metrics.get('business_outcomes_combined', key_results)
            
            # Create detailed case study entry
            detailed_case = {
                'company_name': company_name,
                'original_company_name': original_company_name,
                'industry': industry,
                'region': region,
                'use_case': use_case,
                'company_size': company_size,
                'technologies': tech_list,
                'key_results': key_results,
                'business_outcomes': business_outcomes_combined,
                'similarity_score': result.get('similarity', 0.8),
                'source_url': metrics.get('source_url', ''),
                'is_anonymized': should_anonymize
            }
            
            pitch_data['detailed_case_studies'].append(detailed_case)
            
            # Collect metadata for aggregation
            pitch_data['industries'].add(industry)
            pitch_data['regions'].add(region)
            pitch_data['company_sizes'].add(company_size)
            
            # Add technologies
            for tech in tech_list:
                if tech and str(tech).strip():
                    pitch_data['technologies'].add(str(tech).strip())
            
            # Add quantified results with company names (anonymized if needed)
            if business_outcomes_combined and str(business_outcomes_combined).strip():
                pitch_data['quantified_results'].append({
                    'company': company_name,
                    'industry': industry,
                    'result': str(business_outcomes_combined).strip()
                })
            
            # Add use cases with company context
            pitch_data['use_cases'].append({
                'company': company_name,
                'industry': industry,
                'description': use_case
            })
            
            # Build summary with company names (anonymized if needed)
            similarity_val = result.get('similarity', 0.8)
            if isinstance(similarity_val, str):
                try:
                    similarity_val = float(similarity_val)
                except:
                    similarity_val = 0.8
            
            summary_parts.append(f"{company_name} ({industry}) achieved: {business_outcomes_combined}")
        
        pitch_data['case_studies_summary'] = "; ".join(summary_parts)
        
        # Convert sets to lists
        pitch_data['industries'] = list(pitch_data['industries'])
        pitch_data['regions'] = list(pitch_data['regions'])
        pitch_data['technologies'] = list(pitch_data['technologies'])
        pitch_data['company_sizes'] = list(pitch_data['company_sizes'])
        
        return pitch_data
    
    def _anonymize_company_name(self, company_name: str, industry: str, region: str, company_size: str) -> str:
        """Generate anonymous company descriptor"""
        # Create size descriptor
        if 'large' in company_size.lower() or 'enterprise' in company_size.lower():
            size_descriptor = "a major"
        elif 'medium' in company_size.lower() or 'mid' in company_size.lower():
            size_descriptor = "a mid-sized"
        elif 'small' in company_size.lower():
            size_descriptor = "a growing"
        else:
            size_descriptor = "an established"
        
        # Clean industry name
        clean_industry = industry.lower().replace(' industry', '').replace(' services', '')
        
        # Generate anonymous company name
        return f"{size_descriptor} {clean_industry} company in {region}"
    
    def _create_detailed_context(self, pitch_data: Dict[str, Any], should_anonymize: bool = False) -> str:
        """Create detailed context with specific company names and results"""
        
        context_parts = []
        context_parts.append("=== CASE STUDY PROOF POINTS ===")
        
        if should_anonymize:
            context_parts.append("\nNOTE: Company names have been anonymized for confidentiality.")
        
        for i, case in enumerate(pitch_data['detailed_case_studies'], 1):
            context_parts.append(f"\nCASE STUDY {i}:")
            context_parts.append(f"Company: {case['company_name']}")
            context_parts.append(f"Industry: {case['industry']}")
            context_parts.append(f"Use Case: {case['use_case']}")
            context_parts.append(f"Technologies: {', '.join(case['technologies'])}")
            context_parts.append(f"Results: {case['business_outcomes']}")
            context_parts.append(f"Company Size: {case['company_size']}")
            if case['source_url'] and not should_anonymize:
                context_parts.append(f"Source: {case['source_url']}")
            context_parts.append("-" * 40)
        
        context_parts.append(f"\n=== SUMMARY STATISTICS ===")
        context_parts.append(f"Total Case Studies: {pitch_data['total_cases']}")
        context_parts.append(f"Industries: {', '.join(pitch_data['industries'])}")
        context_parts.append(f"Technologies: {', '.join(pitch_data['technologies'])}")
        context_parts.append(f"Regions: {', '.join(pitch_data['regions'])}")
        
        return "\n".join(context_parts)
    
    def _build_pitch_prompt(self, 
                       pitch_data: Dict[str, Any], 
                       pitch_type: str,
                       target_info: Dict[str, str] = None,
                       custom_context: str = "",
                       pitch_scenario: str = "generic",
                       has_bookmarks: bool = False) -> str:
        """Build context-aware prompt for pitch generation"""
        
        base_prompt = f"""You are an expert IBM sales consultant creating a compelling {pitch_type} pitch.

PITCH SCENARIO: {pitch_scenario}
"""

        # Add bookmark context if available
        if has_bookmarks:
            base_prompt += f"""
BOOKMARK CONTEXT:
- This pitch is based on {pitch_data['bookmark_count']} bookmarked reference cases
- Key use cases of interest: {', '.join(pitch_data['bookmarked_use_cases'])}
- Focus on these specific use cases and similar outcomes
"""

        # Add anonymization instructions
        if pitch_data.get('should_anonymize'):
            base_prompt += """
CONFIDENTIALITY NOTE:
- Company names have been anonymized for confidentiality
- Use the anonymized company descriptors provided (e.g., "a major financial services company")
- Do NOT create or mention specific company names
- Focus on the results and technologies used
"""
        else:
            base_prompt += """
COMPANY REFERENCES:
- Use the EXACT company names provided in the case studies
- Do NOT use generic terms like "Company 1" or "a client"
- Reference specific companies with their actual names for credibility
"""

        base_prompt += """
TARGET INFORMATION:
"""
        
        if target_info:
            base_prompt += f"""- Company: {target_info.get('company', 'Prospect')}
- Industry: {target_info.get('industry', 'Technology')}
- Key Challenges: {target_info.get('challenges', 'Digital transformation')}
- Decision Maker: {target_info.get('contact_name', 'Executive')}
"""
        else:
            base_prompt += "- General prospect in technology sector\n"
        
        if custom_context:
            base_prompt += f"\nADDITIONAL CONTEXT:\n{custom_context}\n"
        
        # Modify instructions based on scenario and anonymization
        if has_bookmarks:
            base_prompt += f"""
CRITICAL REQUIREMENTS:
1. {'Use the anonymized company descriptors provided' if pitch_data.get('should_anonymize') else 'Use ACTUAL company names from the case studies'}
2. Quote SPECIFIC quantified results with the company that achieved them
3. Reference EXACT technologies used (e.g., {', '.join(list(pitch_data['technologies'])[:3])})
4. EMPHASIZE the bookmarked use cases: {', '.join(pitch_data['bookmarked_use_cases'])}
5. Make the pitch highly targeted based on the reference examples
6. Output ONLY the pitch content - no headers, footers, or metadata
"""
        else:
            base_prompt += f"""
CRITICAL REQUIREMENTS:
1. {'Use the anonymized company descriptors provided' if pitch_data.get('should_anonymize') else 'Use ACTUAL company names from the case studies'}
2. Quote SPECIFIC quantified results with the company that achieved them
3. Reference EXACT technologies used (e.g., {', '.join(list(pitch_data['technologies'])[:3])})
4. Create a broader pitch covering multiple use cases
5. {'Reference case study patterns and results without mentioning specific company names' if pitch_data.get('should_anonymize') else 'Make the pitch credible by using real company names and specific outcomes'}
6. Output ONLY the pitch content - no headers, footers, or metadata
"""
        
        # Add pitch-specific instructions
        base_prompt += self.pitch_templates[pitch_type]
        
        return base_prompt
    
    def _get_email_template(self) -> str:
        """Email pitch template with specific naming requirements"""
        return """
TASK: Create a professional email pitch that:

1. SUBJECT LINE: Compelling, specific, mentions quantified results
2. OPENING: Personal connection, demonstrate research
3. VALUE PROPOSITION: Lead with strongest quantified outcome
4. PROOF POINTS: 2-3 specific examples with metrics and company references
5. CALL TO ACTION: Clear next step, time-bound

STYLE: Professional, concise, consultative
LENGTH: 150-200 words maximum
FORMAT: Ready-to-send email with subject line

OUTPUT FORMAT:
Subject: [Subject Line]

[Email Body]

CRITICAL: 
- Use the company references as provided in the case studies
- Include specific quantified results with the company that achieved them
- Reference exact technologies mentioned in case studies
- Make it credible with appropriate company references
- Output ONLY the subject line and email body - no additional text
"""
    
    def _get_presentation_template(self) -> str:
        """Presentation pitch template"""
        return """
TASK: Create a structured presentation pitch outline with:

1. EXECUTIVE SUMMARY (30 seconds)
   - Problem statement
   - Our solution approach
   - Expected outcomes based on real cases

2. PROOF OF SUCCESS (60 seconds)
   - 3 most relevant case studies with appropriate company references
   - Quantified business outcomes with company attribution
   - Similar industry/size companies

3. TECHNOLOGY APPROACH (45 seconds)
   - Key IBM technologies used in the case studies
   - Implementation methodology
   - Timeline expectations

4. BUSINESS IMPACT (30 seconds)
   - Projected ROI based on specific case studies
   - Risk mitigation
   - Competitive advantages

5. NEXT STEPS (15 seconds)
   - Clear action items
   - Timeline for decisions

OUTPUT FORMAT: Clean slide-by-slide outline with key talking points
STYLE: Executive-level, data-driven, compelling
CRITICAL: Use appropriate company references and specific results from case studies
Output ONLY the presentation outline - no additional formatting or metadata
"""
    
    def _get_executive_template(self) -> str:
        """Executive summary template"""
        return """
TASK: Create an executive summary that:

1. BUSINESS CHALLENGE: Clearly state the problem
2. SOLUTION OVERVIEW: High-level IBM approach with technology specifics
3. PROVEN RESULTS: Top 3-4 quantified outcomes from case studies
4. IMPLEMENTATION: Brief methodology overview
5. BUSINESS CASE: ROI projection based on similar cases
6. RECOMMENDATION: Clear next steps

STYLE: C-suite appropriate, strategic focus
LENGTH: 250-300 words
FORMAT: Clean, professional document

OUTPUT FORMAT: Executive summary document with clear sections
FOCUS ON:
- Business outcomes over technical features
- Specific company examples with appropriate references
- Quantified ROI and timeline from actual cases
- Risk mitigation based on proven implementations
Output ONLY the executive summary content - no headers or footers
"""
    
    def _get_cold_outreach_template(self) -> str:
        """Cold outreach template"""
        return """
TASK: Create a brief cold outreach message that:

1. IMMEDIATE VALUE: Lead with strongest case study result
2. RELEVANCE: Connect to their likely challenges
3. SOCIAL PROOF: Quick industry credibility with case reference
4. SOFT ASK: Low-commitment next step

STYLE: Conversational, confident, not salesy
LENGTH: 75-100 words maximum
FORMAT: LinkedIn message or brief email

OUTPUT FORMAT: Ready-to-send message

REQUIREMENTS:
- Hook with quantified result and appropriate company reference in first sentence
- Show understanding of their industry using case examples
- End with question or soft meeting request
- Use credible company references as provided
- Output ONLY the message content - no additional text
"""
    
    def _clean_pitch_output(self, generated_pitch: str) -> str:
        """Clean the generated pitch to remove any extra formatting"""
        # Remove common unwanted patterns that might be added by the LLM
        cleaned = generated_pitch.strip()
        
        # Remove any leading/trailing metadata lines
        lines = cleaned.split('\n')
        cleaned_lines = []
        
        for line in lines:
            # Skip lines that look like metadata or system messages
            if any(marker in line.lower() for marker in [
                'generated by', 'powered by', 'created by', 'ibm granite',
                'target:', 'company:', 'industry:', 'contact:', 'timestamp:',
                '====', '----', 'pitch type:', 'format:'
            ]):
                continue
            cleaned_lines.append(line)
        
        return '\n'.join(cleaned_lines).strip()
    
    def _save_pitch(self, 
                   pitch: str, 
                   pitch_type: str, 
                   target_info: Dict[str, str] = None):
        """Save generated pitch for reference with metadata"""
        
        # Create pitches directory
        pitches_dir = "generated_pitches"
        os.makedirs(pitches_dir, exist_ok=True)
        
        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        target_name = target_info.get('company', 'prospect') if target_info else 'general'
        target_name = target_name.replace(' ', '_').lower()
        filename = f"{timestamp}_{pitch_type}_{target_name}.txt"
        
        filepath = os.path.join(pitches_dir, filename)
        
        # Create saved version with metadata (for reference)
        saved_content = f"""{'='*60}
IBM SALES PITCH - {pitch_type.upper()}
Generated: {datetime.now().strftime("%Y-%m-%d %H:%M")}
{'='*60}

"""
        
        if target_info:
            saved_content += f"""TARGET: {target_info.get('company', 'Prospect')}
INDUSTRY: {target_info.get('industry', 'Technology')}
CONTACT: {target_info.get('contact_name', 'Executive')}

"""
        
        saved_content += pitch
        
        saved_content += f"""

{'='*60}
Generated using IBM Case Study Intelligence
Powered by IBM Granite LLM
{'='*60}
"""
        
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(saved_content)
            print(f"✅ Pitch saved: {filepath}")
        except Exception as e:
            print(f"⚠️ Could not save pitch: {e}")
    
    def generate_multi_format_pitch(self, 
                                  case_study_results: List[Dict[str, Any]],
                                  target_info: Dict[str, str] = None,
                                  custom_context: str = "") -> Dict[str, str]:
        """Generate pitches in multiple formats"""
        
        pitches = {}
        formats = ['email', 'executive_summary', 'cold_outreach']
        
        for format_type in formats:
            print(f"🎯 Generating {format_type} pitch...")
            try:
                pitch = self.generate_pitch(
                    case_study_results=case_study_results,
                    pitch_type=format_type,
                    target_info=target_info,
                    custom_context=custom_context
                )
                pitches[format_type] = pitch
                print(f"✅ {format_type} pitch generated successfully")
            except Exception as e:
                print(f"❌ Error generating {format_type} pitch: {e}")
                pitches[format_type] = f"Error: {str(e)}"
        
        return pitches

def create_pitch_from_search_query(search_query: str,
                                 target_company: str = None,
                                 target_industry: str = None,
                                 contact_name: str = None,
                                 challenges: str = None,
                                 pitch_format: str = "email",
                                 custom_context: str = "",
                                 top_k: int = 5) -> str:
    """
    Main function to search for case studies and generate pitch
    """
    print(f"🔍 Searching for case studies: '{search_query}'")
    
    # Initialize retriever (uses your existing config.yaml and embeddings)
    try:
        retriever = MetricsRetriever()
        
        if not retriever.embeddings_db:
            return "❌ No embeddings available. Please run embed.py first to create embeddings."
        
        # Get actual search results from your retrieve.py
        search_results = retriever.search_similar_cases(
            query=search_query, 
            top_k=top_k,
            threshold=0.3
        )
        
        if not search_results:
            return f"❌ No similar case studies found for query: '{search_query}'"
        
        print(f"🎯 Found {len(search_results)} relevant case studies")
        
        # Debug: Print what we're passing to pitch generator
        print("\n📊 DEBUG: Case study data being passed to pitch generator:")
        for i, result in enumerate(search_results[:2], 1):  # Show first 2 for debugging
            print(f"Case {i}:")
            if 'metrics' in result:
                metrics = result['metrics']
                print(f"  Company: {metrics.get('company_name', 'N/A')}")
                print(f"  Industry: {metrics.get('industry', 'N/A')}")
                print(f"  Results: {metrics.get('business_outcomes_combined', 'N/A')}")
            else:
                print(f"  Company: {result.get('company', 'N/A')}")
                print(f"  Industry: {result.get('industry', 'N/A')}")
            print(f"  Available keys: {list(result.keys())}")
            print("-" * 30)
        
        # Initialize pitch generator
        generator = PitchGenerator()
        
        # Prepare target info
        target_info = {}
        if target_company:
            target_info['company'] = target_company
        if target_industry:
            target_info['industry'] = target_industry
        if contact_name:
            target_info['contact_name'] = contact_name
        if challenges:
            target_info['challenges'] = challenges
        
        # Generate pitch using actual search results
        return generator.generate_pitch(
            case_study_results=search_results,
            pitch_type=pitch_format,
            target_info=target_info,
            custom_context=custom_context
        )
        
    except Exception as e:
        return f"❌ Error during pitch generation: {str(e)}"

def interactive_cli():
    """Interactive CLI for pitch generation"""
    print("\n" + "=" * 80)
    print("🚀 IBM AI-POWERED SALES PITCH GENERATOR")
    print("=" * 80)
    print("Generate personalized sales pitches using IBM case study intelligence")
    print("Type 'quit' or 'exit' to stop")
    print("-" * 80)
    
    while True:
        try:
            # Get search query
            query = input("\n💬 Enter your search query (e.g., 'AI banking fraud detection'): ").strip()
            
            if query.lower() in ['quit', 'exit', 'q']:
                print("👋 Goodbye!")
                break
            
            if not query:
                print("❌ Please enter a valid search query")
                continue
            
            # Get optional target information
            print("\n📋 Optional target information (press Enter to skip):")
            target_company = input("🏢 Target company: ").strip() or None
            target_industry = input("🏭 Target industry: ").strip() or None
            contact_name = input("👤 Contact name: ").strip() or None
            challenges = input("💼 Key challenges: ").strip() or None
            
            # Get pitch format
            print("\n📝 Select pitch format:")
            print("1. Email (default)")
            print("2. Executive Summary") 
            print("3. Cold Outreach")
            print("4. Presentation Outline")
            print("5. All formats")
            
            format_choice = input("Choose format (1-5) [1]: ").strip() or "1"
            
            format_map = {
                "1": "email",
                "2": "executive_summary", 
                "3": "cold_outreach",
                "4": "presentation",
                "5": "all"
            }
            
            pitch_format = format_map.get(format_choice, "email")
            
            # Get custom context
            custom_context = input("\n📝 Additional context (optional): ").strip() or ""
            
            print(f"\n{'='*60}")
            print("🤖 GENERATING PITCH...")
            print(f"{'='*60}")
            
            if pitch_format == "all":
                # Generate all formats
                retriever = MetricsRetriever()
                search_results = retriever.search_similar_cases(query, top_k=5)
                
                if search_results:
                    generator = PitchGenerator()
                    target_info = {
                        'company': target_company,
                        'industry': target_industry,
                        'contact_name': contact_name,
                        'challenges': challenges
                    }
                    target_info = {k: v for k, v in target_info.items() if v}  # Remove None values
                    
                    all_pitches = generator.generate_multi_format_pitch(
                        case_study_results=search_results,
                        target_info=target_info,
                        custom_context=custom_context
                    )
                    
                    for format_name, pitch_content in all_pitches.items():
                        print(f"\n📧 {format_name.upper()} PITCH:")
                        print("=" * 50)
                        print(pitch_content)
                        print("\n" + "=" * 50)
                else:
                    print("❌ No similar case studies found")
            else:
                # Generate single format
                pitch = create_pitch_from_search_query(
                    search_query=query,
                    target_company=target_company,
                    target_industry=target_industry,
                    contact_name=contact_name,
                    challenges=challenges,
                    pitch_format=pitch_format,
                    custom_context=custom_context
                )
                
                print(f"\n📧 GENERATED {pitch_format.upper()} PITCH:")
                print("=" * 60)
                print(pitch)
                
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

def main():
    """Main function with command line argument parsing"""
    parser = argparse.ArgumentParser(
        description='Generate AI-powered sales pitches from IBM case studies',
        epilog='Example: python pitch_generator.py "AI banking fraud detection" --company "JPMorgan" --industry "Financial Services" --format email'
    )
    
    # Required argument
    parser.add_argument('query', nargs='?', help='Search query for finding similar case studies')
    
    # Optional arguments
    parser.add_argument('--company', help='Target company name')
    parser.add_argument('--industry', help='Target industry')
    parser.add_argument('--contact', help='Contact person name')
    parser.add_argument('--challenges', help='Key business challenges')
    parser.add_argument('--format', 
                       choices=['email', 'executive_summary', 'cold_outreach', 'presentation', 'all'],
                       default='email', 
                       help='Pitch format to generate (default: email)')
    parser.add_argument('--context', help='Additional context for personalization')
    parser.add_argument('--top-k', type=int, default=5, help='Number of similar cases to find (default: 5)')
    parser.add_argument('--interactive', '-i', action='store_true', help='Run in interactive mode')
    
    args = parser.parse_args()
    
    # Run interactive mode if requested or no query provided
    if args.interactive or not args.query:
        interactive_cli()
        return
    
    print(f"🔍 Searching for case studies: '{args.query}'")
    
    if args.format == 'all':
        # Generate all formats
        try:
            retriever = MetricsRetriever()
            search_results = retriever.search_similar_cases(args.query, top_k=args.top_k)
            
            if search_results:
                generator = PitchGenerator()
                target_info = {
                    'company': args.company,
                    'industry': args.industry,
                    'contact_name': args.contact,
                    'challenges': args.challenges
                }
                target_info = {k: v for k, v in target_info.items() if v}  # Remove None values
                
                all_pitches = generator.generate_multi_format_pitch(
                    case_study_results=search_results,
                    target_info=target_info,
                    custom_context=args.context or ""
                )
                
                for format_name, pitch_content in all_pitches.items():
                    print(f"\n📧 {format_name.upper()} PITCH:")
                    print("=" * 60)
                    print(pitch_content)
                    print("\n" + "=" * 60)
            else:
                print("❌ No similar case studies found")
        except Exception as e:
            print(f"❌ Error: {e}")
    else:
        # Generate single format
        pitch = create_pitch_from_search_query(
            search_query=args.query,
            target_company=args.company,
            target_industry=args.industry,
            contact_name=args.contact,
            challenges=args.challenges,
            pitch_format=args.format,
            custom_context=args.context or "",
            top_k=args.top_k
        )
        
        print(f"\n📝 Generated {args.format} pitch:")
        print("=" * 60)
        print(pitch)

if __name__ == "__main__":
    main()