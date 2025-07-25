from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from pitch import PitchGenerator
from retrieve import MetricsRetriever
import re
import sys
import os
import random
import json
import hashlib
try:
    from link_collector import NewsAPICollector
    from summarizer import smart_summarize_article, generate_aggregate_insights, process_articles_optimized
    TRENDS_AVAILABLE = True
    print("✅ Market trends module loaded successfully")
except ImportError as e:
    print(f"⚠️ Market trends module not available: {e}")
    TRENDS_AVAILABLE = False

# Import company news intelligence module
try:
    from companynews import CompanyNewsIntelligence
    COMPANY_NEWS_AVAILABLE = True
    print("✅ Company news intelligence module loaded successfully")
except ImportError as e:
    print(f"⚠️ Company news intelligence module not available: {e}")
    COMPANY_NEWS_AVAILABLE = False

app = Flask(__name__)
CORS(app)

# Initialize components
pitch_generator = PitchGenerator()
metrics_retriever = MetricsRetriever()

# Initialize company news intelligence if available
if COMPANY_NEWS_AVAILABLE:
    # API Keys - Replace with your actual keys or environment variables

    NEWS_API_KEY = "16e215735be943eea3dbf8d8c0bf3977"
    GRANITE_API_KEY = "gtUEfNtO2hpt9zxy7r-WF1P4Zk9rArQeIhlenEvfxKSQ"
    PROJECT_ID = "8ddd7558-5a5c-4ae2-b4e1-1434085a8e94"
    
    company_intelligence = CompanyNewsIntelligence(NEWS_API_KEY, GRANITE_API_KEY, PROJECT_ID)
    print("✅ Company news intelligence initialized")

def extract_executive_summary(insights_text):
    """Extract executive summary from structured insights text"""
    if not insights_text:
        return None
    
    # Try to find executive summary section
    patterns = [
        r'(?i)executive\s+summary\s*:?\s*\n(.*?)(?:\n\n|\n(?:[A-Z][A-Z\s]*:)|\n---|\Z)',
        r'(?i)executive\s+summary\s*(.*?)(?:\n\n|\n(?:[A-Z][A-Z\s]*:)|\n---|\Z)'
    ]
    
    executive_summary = None
    for pattern in patterns:
        match = re.search(pattern, insights_text, re.DOTALL)
        if match:
            executive_summary = match.group(1).strip()
            break
    
    if not executive_summary:
        # Fallback: look for any bullet points in the text
        lines = insights_text.split('\n')
        bullet_points = []
        overview = ""
        
        for line in lines:
            line = line.strip()
            if line.startswith('-') or line.startswith('•'):
                clean_point = re.sub(r'^[-•]\s*', '', line).strip()
                if clean_point and len(clean_point) > 10:
                    bullet_points.append(clean_point)
            elif not overview and len(line) > 20 and not line.startswith('-') and not line.startswith('•'):
                # Use first substantial line as overview
                overview = line
        
        if bullet_points:
            return {
                'overview': overview or 'Strategic insights available',
                'bullet_points': bullet_points[:3]  # Limit to 3 points
            }
        
        return None
    
    # Parse the executive summary
    lines = executive_summary.split('\n')
    overview = ""
    bullet_points = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        if line.startswith('-') or line.startswith('•'):
            clean_point = re.sub(r'^[-•]\s*', '', line).strip()
            if clean_point:
                bullet_points.append(clean_point)
        elif not overview and len(line) > 10:
            overview = line
    
    # If no bullet points found, try to extract sentences
    if not bullet_points and overview:
        sentences = re.split(r'[.!?]+', overview)
        for sentence in sentences:
            sentence = sentence.strip()
            if sentence and len(sentence) > 20:
                bullet_points.append(sentence)
                if len(bullet_points) >= 3:
                    break
    
    return {
        'overview': overview or 'Strategic insights available',
        'bullet_points': bullet_points[:3] if bullet_points else ['Key insights available']
    }

# @app.route('/')
# def index():
#     return render_template('oldindex.html')

@app.route('/explore_case_studies', methods=['POST'])
def explore_case_studies():
    """Pre-sales endpoint for browsing case studies"""
    try:
        # Get request data
        data = request.json
        
        if not data:
            return jsonify({'error': 'No data received'}), 400

        # Get search parameters (only region, product, and prompt for pre-sales)
        region = data.get('region', '')
        product = data.get('product', '')
        prompt = data.get('prompt', '')

        # Create search string
        search_params = [region, product, prompt]
        search_string = " ".join([param for param in search_params if param.strip()])

        if not search_string:
            return jsonify({'error': 'Please provide at least one search parameter'}), 400

        print(f"🔍 Exploring case studies with query: {search_string}")

        # Get similar case studies
        results = metrics_retriever.search_similar_cases(search_string, top_k=5)  # More results for exploration

        if not results:
            return jsonify({
                'error': 'No case studies found. Please try different search parameters.',
                'case_studies': []
            }), 404

        # Format case studies
        case_studies = []
        for result in results:
            result_metrics = result.get('metrics', {})
            
            company_name = result_metrics.get('company_name', 
                                            result.get('filename', 'Unknown Company').replace('.pdf', '').replace('_', ' '))
            industry = result_metrics.get('industry', 'N/A')
            region = result_metrics.get('region', 'N/A')
            use_case = result_metrics.get('use_case', 'N/A')
            company_size = result_metrics.get('company_size', 'N/A')
            
            technologies = result_metrics.get('technologies', 'N/A')
            if isinstance(technologies, list):
                technologies = ', '.join([str(tech) for tech in technologies if tech])
            elif not technologies:
                technologies = 'N/A'
            
            business_outcomes = result_metrics.get('business_outcomes_combined', 'N/A')
            key_results = format_business_outcomes_combined(business_outcomes)
            
            source_url = result_metrics.get('source_url', 'N/A')
            
            formatted_case_study = {
                'id': hashlib.md5(f"{company_name}_{result['filename']}_{source_url}".encode()).hexdigest()[:8],  # Simple ID for bookmarking
                'company': company_name,
                'title': result['filename'],
                'industry': industry,
                'region': region,
                'product': technologies,
                'source': source_url,
                'similarity': f"{result['similarity']:.2f}",
                'key_results': key_results,
                'use_case': use_case,
                'company_size': company_size,
                'bookmarked': False  # Default bookmark status
            }
       
            case_use_cases = use_case.split(',') if use_case != 'N/A' else []
            formatted_case_study['extracted_use_cases'] = [uc.strip() for uc in case_use_cases if uc.strip()]
            case_studies.append(formatted_case_study)

        return jsonify({
            'success': True,
            'case_studies': case_studies,
            'total_found': len(case_studies)
        })

    except Exception as e:
        print(f"❌ Error in case study exploration: {e}")
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/fetch_market_trends', methods=['POST'])
def fetch_market_trends():
    """Endpoint to fetch market trends using batch processing"""
    try:
        if not TRENDS_AVAILABLE:
            return jsonify({
                'error': 'Market trends module not available',
                'trends': None
            }), 503

        data = request.json
        if not data:
            return jsonify({'error': 'No data received'}), 400

        industry = data.get('industry', 'Financial services')
        region = data.get('region', 'Asia')
        use_case = data.get('product', 'AI & Machine Learning')
        
        print(f"📈 Fetching market trends for: Industry={industry}, Use Case={use_case}, Region={region}")

        # Use NewsAPICollector to get articles directly
        collector = NewsAPICollector()
        articles = collector.get_targeted_articles(industry, use_case, region, limit=10)
        
        if not articles:
            return jsonify({
                'error': 'No market data sources available',
                'trends': None
            }), 404

        print(f"✅ Got {len(articles)} articles, processing with batch optimization...")

        # Convert to format expected by batch processor
        formatted_articles = []
        for article in articles:
            formatted_articles.append({
                'title': article['title'],
                'link': article['link'],
                'cleaned_text': [article['content']]
            })
        
        # Use optimized batch processing
        try:
            results, insights = process_articles_optimized(formatted_articles, industry, use_case, region)
            
            if insights:
                return jsonify({
                    'success': True,
                    'trends': {
                        'aggregate_insights': insights,
                        'stats': {
                            'total_articles': len(articles),
                            'processed': len(articles),
                            'successful': len(results)
                        }
                    }
                })
            else:
                return jsonify({
                    'error': 'No relevant market insights found',
                    'trends': None
                }), 404
                
        except Exception as processing_error:
            print(f"❌ Batch processing failed: {processing_error}")
            
            # Fallback to individual processing but limit articles
            results = []
            for article in articles[:5]:  # Only process first 5 for speed
                try:
                    formatted_article = {
                        'title': article['title'],
                        'link': article['link'],
                        'cleaned_text': [article['content']]
                    }
                    summary = smart_summarize_article(formatted_article, industry, use_case, region)
                    if summary:
                        results.append(summary)
                except Exception as e:
                    print(f"⚠️ Error processing article: {e}")
                    continue

            if results:
                insights = generate_aggregate_insights(results, industry, use_case, region)
                if insights:
                    return jsonify({
                        'success': True,
                        'trends': {
                            'aggregate_insights': insights,
                            'stats': {
                                'total_articles': len(articles),
                                'processed': min(5, len(articles)),
                                'successful': len(results)
                            }
                        }
                    })

        return jsonify({
            'error': 'No relevant market insights found',
            'trends': None
        }), 404

    except Exception as e:
        print(f"❌ Error in market trends analysis: {e}")
        return jsonify({
            'error': str(e),
            'trends': None
        }), 500

@app.route('/fetch_company_intelligence', methods=['POST'])
def fetch_company_intelligence():
    """Endpoint to fetch company news intelligence with proper executive summary handling"""
    try:
        if not COMPANY_NEWS_AVAILABLE:
            return jsonify({
                'error': 'Company news intelligence module not available',
                'intelligence': None
            }), 503

        # Get request data
        data = request.json
        
        if not data:
            return jsonify({'error': 'No data received'}), 400

        # Get company name from the request
        company_name = data.get('company_name', '').strip()
        days_back = data.get('days_back', 7)  # Default to 7 days
        
        if not company_name:
            return jsonify({'error': 'Company name is required'}), 400

        print(f"🔍 Fetching company intelligence for: {company_name}")
        intelligence_report = company_intelligence.analyze_company(company_name, days_back)
        
        # Handle the executive summary properly
        executive_summary = intelligence_report.get('executive_summary', [])
        
        # Convert executive summary array to the format expected by frontend
        if executive_summary and isinstance(executive_summary, list):
            # Frontend expects { bullet_points: [...] } format for strategic summary
            formatted_executive_summary = {
                'bullet_points': executive_summary
            }
        else:
            # Fallback if no executive summary
            formatted_executive_summary = {
                'bullet_points': [
                    f"Recent strategic developments for {company_name}",
                    f"Business opportunities identified in market analysis",
                    f"Competitive positioning shows growth potential"
                ]
            }
        
        print("✅ Executive summary formatted for frontend:", formatted_executive_summary)
        
        presales_summary = {
            'company': intelligence_report.get('company', company_name),
            'total_articles': intelligence_report.get('total_articles', 0),
            'analysis_period': intelligence_report.get('analysis_period', '7 days'),
            'key_insights': intelligence_report.get('key_insights', ''),
            'executive_summary': formatted_executive_summary,  # Now in correct format
            'success': True
        } 
        
        return jsonify({
            'success': True,
            'intelligence': presales_summary 
        })
        
    except Exception as e:
        print(f"❌ Error in company intelligence analysis: {e}")
        return jsonify({
            'error': str(e),
            'intelligence': None
        }), 500

@app.route('/find_similar_cases', methods=['POST'])
def find_similar_cases():
    """Post-sales endpoint for finding similar cases based on reference and bookmarks"""
    try:
        # Get request data
        data = request.json
        
        if not data:
            return jsonify({'error': 'No data received'}), 400

        # Get search parameters for post-sales (all filters)
        industry = data.get('industry', '')
        region = data.get('region', '')
        use_case = data.get('useCase', '')
        product = data.get('product', '')
        prompt = data.get('prompt', '')
        reference_case_study = data.get('reference_case_study', '')
        
        # NEW: Get bookmark-related data
        bookmarked_case_studies = data.get('bookmarked_case_studies', [])
        bookmarked_use_cases = data.get('bookmarked_use_cases', [])

        print(f"📚 Bookmarked case studies: {len(bookmarked_case_studies)}")
        print(f"🎯 Bookmarked use cases: {bookmarked_use_cases}")

        # Handle reference case study selection
        search_string = ""
        reference_case_data = None
        
        if reference_case_study:
            try:
                # Parse the reference case study JSON
                reference_case_data = json.loads(reference_case_study) if isinstance(reference_case_study, str) else reference_case_study
                print(f"📋 Using reference case: {reference_case_data.get('company', 'Unknown')}")
                
                # Build search string based on reference case characteristics
                ref_parts = []
                if reference_case_data.get('industry'):
                    ref_parts.append(reference_case_data['industry'])
                if reference_case_data.get('use_case'):
                    ref_parts.append(reference_case_data['use_case'])
                if reference_case_data.get('product'):
                    ref_parts.append(reference_case_data['product'])
                if reference_case_data.get('region'):
                    ref_parts.append(reference_case_data['region'])
                
                # Combine reference case attributes with user input
                search_parts = ref_parts + [industry, region, use_case, product, prompt]
                search_string = " ".join([part for part in search_parts if part and part.strip()])
                
            except (json.JSONDecodeError, TypeError) as e:
                print(f"⚠️ Error parsing reference case study: {e}")
                # Fall back to regular search if reference case parsing fails

        # NEW: Enhance search with bookmarked use cases if no reference case
        if not search_string:
            search_params = [industry, region, use_case, product, prompt]
            
            # Add bookmarked use cases to search if available
            if bookmarked_use_cases:
                print(f"🔍 Adding bookmarked use cases to search: {bookmarked_use_cases}")
                search_params.extend(bookmarked_use_cases)
            
            search_string = " ".join([param for param in search_params if param and param.strip()])

        if not search_string:
            return jsonify({'error': 'Please provide search parameters, select a reference case study, or bookmark some case studies'}), 400

        print(f"🔍 Finding similar cases with query: {search_string}")

        # Get similar case studies with enhanced search
        results = metrics_retriever.search_similar_cases(search_string, top_k=8)  # Get more results for filtering

        if not results:
            return jsonify({
                'error': 'No similar case studies found. Please try different search parameters.',
                'case_studies': []
            }), 404

        # NEW: Score and filter results based on bookmark similarity
        if bookmarked_case_studies:
            results = enhance_results_with_bookmark_similarity(results, bookmarked_case_studies, bookmarked_use_cases)

        # Format case studies (same format as explore_case_studies)
        case_studies = []
        for result in results[:5]:  # Take top 5 after enhancement
            result_metrics = result.get('metrics', {})
            
            company_name = result_metrics.get('company_name', 
                                            result.get('filename', 'Unknown Company').replace('.pdf', '').replace('_', ' '))
            industry = result_metrics.get('industry', 'N/A')
            region = result_metrics.get('region', 'N/A')
            use_case = result_metrics.get('use_case', 'N/A')
            company_size = result_metrics.get('company_size', 'N/A')
            
            technologies = result_metrics.get('technologies', 'N/A')
            if isinstance(technologies, list):
                technologies = ', '.join([str(tech) for tech in technologies if tech])
            elif not technologies:
                technologies = 'N/A'
            
            business_outcomes = result_metrics.get('business_outcomes_combined', 'N/A')
            key_results = format_business_outcomes_combined(business_outcomes)
            
            source_url = result_metrics.get('source_url', 'N/A')
            
            formatted_case_study = {
                'id': hashlib.md5(f"{company_name}_{result['filename']}_{source_url}".encode()).hexdigest()[:8],
                'company': company_name,
                'title': result['filename'],
                'industry': industry,
                'region': region,
                'product': technologies,
                'source': source_url,
                'similarity': f"{result['similarity']:.2f}",
                'key_results': key_results,
                'use_case': use_case,
                'company_size': company_size,
                'bookmark_similarity': result.get('bookmark_similarity', 0)  # NEW: Add bookmark similarity score
            }
            
            case_studies.append(formatted_case_study)

        # Build response
        response_data = {
            'success': True,
            'case_studies': case_studies,
            'total_found': len(case_studies),
            'used_bookmarks': len(bookmarked_case_studies) > 0,
            'bookmarked_use_cases': bookmarked_use_cases
        }
        
        if reference_case_data:
            response_data['reference_case'] = reference_case_data
            print(f"✅ Found {len(case_studies)} cases similar to reference: {reference_case_data.get('company', 'Unknown')}")
        elif bookmarked_case_studies:
            print(f"✅ Found {len(case_studies)} cases enhanced by {len(bookmarked_case_studies)} bookmarks")

        return jsonify(response_data)

    except Exception as e:
        print(f"❌ Error in finding similar cases: {e}")
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/generate_pitch', methods=['POST'])
def generate_pitch():
    """Generate pitch from selected case studies with bookmark context"""
    try:
        data = request.json
        case_study_results = data.get('case_study_results', [])
        pitch_type = data.get('pitch_type', 'email')
        target_info = data.get('target_info', {})
        custom_context = data.get('custom_context', '')
        
        # NEW: Get bookmark-related data
        bookmarked_case_studies = data.get('bookmarked_case_studies', [])
        bookmarked_use_cases = data.get('bookmarked_use_cases', [])
        
        print(f"🎯 Generating pitch with {len(bookmarked_case_studies)} bookmarked cases")
        print(f"📝 Pitch type: {pitch_type}")
        print(f"🏢 Target: {target_info.get('company', 'Not specified')}")

        # Determine pitch scenario based on bookmarks
        pitch_scenario = "generic"
        if bookmarked_case_studies:
            if case_study_results:
                pitch_scenario = "enhanced_with_bookmarks"  # Scenario 1 & 2
            else:
                pitch_scenario = "bookmark_only"  # Could happen if no similar cases found
        elif case_study_results:
            pitch_scenario = "generic_with_cases"  # Scenario 3
        
        print(f"📊 Pitch scenario: {pitch_scenario}")
        
        # Enhanced context for pitch generation
        enhanced_context = custom_context
        if bookmarked_use_cases:
            use_case_context = f"\n\nKey use cases of interest: {', '.join(bookmarked_use_cases)}"
            enhanced_context += use_case_context
        
        if bookmarked_case_studies:
            bookmark_context = f"\n\nReference examples from {len(bookmarked_case_studies)} similar companies"
            enhanced_context += bookmark_context

        # Generate pitch with enhanced context
        pitch = pitch_generator.generate_pitch(
            case_study_results=case_study_results,
            pitch_type=pitch_type,
            target_info=target_info,
            custom_context=enhanced_context,
            bookmarked_case_studies=bookmarked_case_studies,  # NEW: Pass bookmarks to generator
            bookmarked_use_cases=bookmarked_use_cases,        # NEW: Pass use cases to generator
            pitch_scenario=pitch_scenario                      # NEW: Pass scenario type
        )
        
        return jsonify({
            'pitch': pitch,
            'scenario': pitch_scenario,
            'used_bookmarks': len(bookmarked_case_studies) > 0
        })
        
    except Exception as e:
        print(f"❌ Error generating pitch: {e}")
        return jsonify({'error': str(e)}), 500

def format_business_outcomes_combined(business_outcomes_combined) -> str:
    """Format business outcomes - copied from retrieve.py for consistency"""
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

def enhance_results_with_bookmark_similarity(results, bookmarked_case_studies, bookmarked_use_cases):
    """Enhance search results by scoring similarity to bookmarked case studies"""
    
    def calculate_bookmark_similarity(result, bookmarked_cases, bookmarked_use_cases):
        """Calculate similarity score between a result and bookmarked cases"""
        similarity_score = 0
        result_metrics = result.get('metrics', {})
        
        # Score based on use case overlap
        result_use_case = result_metrics.get('use_case', '').lower()
        for bookmarked_use_case in bookmarked_use_cases:
            if bookmarked_use_case.lower() in result_use_case or result_use_case in bookmarked_use_case.lower():
                similarity_score += 0.4  # High weight for use case match
        
        # Score based on industry overlap
        result_industry = result_metrics.get('industry', '').lower()
        for bookmarked_case in bookmarked_cases:
            bookmark_industry = bookmarked_case.get('industry', '').lower()
            if bookmark_industry and bookmark_industry in result_industry:
                similarity_score += 0.2
        
        # Score based on product/technology overlap
        result_tech = str(result_metrics.get('technologies', '')).lower()
        for bookmarked_case in bookmarked_cases:
            bookmark_product = bookmarked_case.get('product', '').lower()
            if bookmark_product and bookmark_product in result_tech:
                similarity_score += 0.2
        
        # Score based on region overlap
        result_region = result_metrics.get('region', '').lower()
        for bookmarked_case in bookmarked_cases:
            bookmark_region = bookmarked_case.get('region', '').lower()
            if bookmark_region and bookmark_region in result_region:
                similarity_score += 0.1
        
        # Score based on company size overlap
        result_size = result_metrics.get('company_size', '').lower()
        for bookmarked_case in bookmarked_cases:
            bookmark_size = bookmarked_case.get('company_size', '').lower()
            if bookmark_size and bookmark_size in result_size:
                similarity_score += 0.1
        
        return min(similarity_score, 1.0)  # Cap at 1.0
    
    # Calculate bookmark similarity for each result
    for result in results:
        bookmark_similarity = calculate_bookmark_similarity(result, bookmarked_case_studies, bookmarked_use_cases)
        result['bookmark_similarity'] = bookmark_similarity
        
        # Boost overall similarity score based on bookmark match
        original_similarity = result.get('similarity', 0)
        # Weighted average: 70% original similarity + 30% bookmark similarity
        result['similarity'] = (original_similarity * 0.7) + (bookmark_similarity * 0.3)
    
    # Sort by enhanced similarity score
    results.sort(key=lambda x: x.get('similarity', 0), reverse=True)
    
    return results

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)