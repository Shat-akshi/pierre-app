
# 3rd july codes 


import re
from collections import Counter

def create_keyword_sets(filters):
    """Create keyword sets for each filter category to pre-filter articles"""
    industry_keywords = {
        "Financial services": ["bank", "financ", "invest", "insur", "payment", "loan", "credit", "fintech", "capital", "wealth", "money", "fund", "economy", "banking", "monetary"],
        "Technology": ["tech", "software", "hardware", "app", "platform", "digital", "IT", "internet", "computing", "code", "developer", "startup", "innovation"],
        "Healthcare": ["health", "medical", "patient", "hospital", "pharma", "doctor", "clinic", "care", "treatment", "drug", "healthcare", "medicine", "wellness", "therapy"],
        "Manufacturing": ["manufactur", "factory", "production", "industrial", "assembly", "supply chain", "product", "machine", "operations", "equipment"],
        "Retail": ["retail", "shop", "store", "commerce", "consumer", "brand", "merchant", "marketplace", "customer", "ecommerce", "shopping", "buyer"],
        "Energy": ["energy", "power", "electricity", "oil", "gas", "renewable", "solar", "wind", "utility", "fuel", "sustainable", "green"]
    }
    
    use_case_keywords = {
        "AI & Machine Learning": ["AI", "artificial intelligence", "machine learning", "ML", "algorithm", "neural", "deep learning", "predict", "model", "automate", "cognitive", "data science", "intelligent"],
        "Digital Transformation": ["transform", "digital", "moderniz", "legacy", "innovation", "disrupt", "agile", "journey", "evolution", "change", "adapt", "modern"],
        "Cloud Computing": ["cloud", "SaaS", "PaaS", "IaaS", "AWS", "Azure", "GCP", "server", "infrastructure", "hosting", "virtualization", "hybrid", "multi-cloud"],
        "Data Analytics": ["data", "analytic", "insight", "dashboard", "BI", "business intelligence", "metric", "KPI", "statistic", "report", "visualization", "decision"],
        "Cybersecurity": ["security", "cyber", "threat", "hack", "breach", "protect", "risk", "vulnerab", "attack", "defense", "privacy", "encryption", "secure"],
        "Automation": ["automat", "RPA", "robot", "workflow", "process", "efaficiency", "manual", "task", "streamline", "optimize"]
    }
    
    region_keywords = {
        "Asia": ["asia", "china", "japan", "india", "singapore", "korea", "malaysia", "indonesia", "thailand", "vietnam", "philippines", "apac", "asian"],
        "North America": ["america", "US", "USA", "united states", "canada", "mexico", "north america", "american"],
        "Europe": ["europe", "EU", "UK", "germany", "france", "spain", "italy", "netherlands", "sweden", "switzerland", "european", "britain"],
        "Global": ["global", "world", "international", "worldwide", "across countries", "multinational", "planet", "universal"],
        "India": ["india", "mumbai", "delhi", "bangalore", "hyderabad", "chennai", "kolkata", "pune", "ahmedabad", "indian"],
        "China": ["china", "beijing", "shanghai", "shenzhen", "guangzhou", "hong kong", "chinese"]
    }
    
    # Get the keywords for the selected filters
    industry_set = set(industry_keywords.get(filters["industry"], []))
    use_case_set = set(use_case_keywords.get(filters["use_case"], []))
    region_set = set(region_keywords.get(filters["region"], []))
    
    return {
        "industry": industry_set,
        "use_case": use_case_set,
        "region": region_set
    }

def pre_filter_article(article, filters):
    """Quickly check if an article is likely to be relevant before sending to WatsonX"""
    if not article or not article.get("cleaned_text"):
        return False
    
    # Get the keyword sets for each filter
    keyword_sets = create_keyword_sets(filters)
    
    # Combine title and first ~1200 chars of content for quicker analysis (increased from 800)
    title = article.get("title", "").lower()
    content = " ".join(article.get("cleaned_text", []))[:1200].lower()
    text_to_analyze = title + " " + content
    
    # Count matches for each filter category
    matches = {
        "industry": 0,
        "use_case": 0,
        "region": 0
    }
    
    # Count keyword occurrences
    for category, keywords in keyword_sets.items():
        for keyword in keywords:
            if keyword.lower() in text_to_analyze:
                matches[category] += 1
                
                # Give extra weight to keywords in title
                if keyword.lower() in title:
                    matches[category] += 1
    
    # More lenient relevance scoring
    # 1. Lower threshold for strong category match (2+ instead of 3+)
    # 2. Consider articles with good match in 1 category and at least some match in another
    categories_with_matches = sum(1 for count in matches.values() if count >= 1)
    strong_category_match = any(count >= 2 for count in matches.values())
    multi_category = sum(1 for count in matches.values() if count >= 1) >= 2
    
    # Title matches are extra valuable
    title_match = any(keyword in title for category in keyword_sets.values() for keyword in category)
    
    # More lenient criteria
    return categories_with_matches >= 1 or strong_category_match or (multi_category and title_match)

def rank_articles_by_relevance(articles, filters):
    """Rank articles by their likely relevance to the filters"""
    if not articles:
        return []
    
    # Get keyword sets
    keyword_sets = create_keyword_sets(filters)
    all_keywords = set()
    for keywords in keyword_sets.values():
        all_keywords.update(keywords)
    
    # Calculate relevance scores
    scored_articles = []
    for article in articles:
        if not article or not article.get("cleaned_text"):
            continue
            
        title = article.get("title", "").lower()
        content = " ".join(article.get("cleaned_text", []))[:1500].lower()
        text = title + " " + content
        
        # Count matching keywords
        score = 0
        for keyword in all_keywords:
            if keyword.lower() in text:
                # Keywords in title count more
                if keyword.lower() in title:
                    score += 3  # Increased from 2 to give more weight to title matches
                else:
                    score += 1
        
        # Bonus points for articles with recent timestamps or specific phrases
        recency_terms = ["recent", "new", "latest", "today", "yesterday", "this week", "this month", "announced", "launches", "unveils"]
        for term in recency_terms:
            if term in text:
                score += 0.5
        
        scored_articles.append((score, article))
    
    # Sort by score, highest first
    scored_articles.sort(reverse=True, key=lambda x: x[0])
    
    # Return only the articles, not the scores
    return [article for score, article in scored_articles]