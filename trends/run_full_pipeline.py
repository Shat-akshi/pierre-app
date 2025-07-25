




from link_collector import get_moneycontrol_links, get_et_tech_links
from article_scraper import scrape_article
from summarizer import summarize_article

# Optional: Choose industry, use_case, region
filters = {
    "industry": "Financial services",
    "use_case": "AI & Machine Learning",
    "region": "Asia"
}

print("🚀 Collecting links...\n")
urls = get_moneycontrol_links() + get_et_tech_links()
print(f"🔗 {len(urls)} links found.\n\n")

results = []
for i, url in enumerate(urls):
    print(f"[{i+1}/{len(urls)}] Processing: {url}")
    article = scrape_article(url)
    if not article:
        continue
    summary = summarize_article(
        article,
        industry=filters["industry"],
        use_case=filters["use_case"],
        region=filters["region"]
    )
    if summary:
        results.append(summary)

# Print output
print("\n📊 Market Trend Summary:\n")
for r in results:
    print(f"📰 {r['title']}")
    print(r["summary"])
    print(f"🔗 Source: {r['link']}\n{'-'*80}")

