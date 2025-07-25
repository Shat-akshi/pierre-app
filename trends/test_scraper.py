from article_scraper import scrape_article

url = "https://www.moneycontrol.com/news/business/startup/funding-alert-startup-x-secures-15m-in-series-a-1223345.html"
article = scrape_article(url)

if article:
    print("Title:", article["title"])
    print("Summary preview:\n")
    for line in article["cleaned_text"][:10]:
        print("-", line)
