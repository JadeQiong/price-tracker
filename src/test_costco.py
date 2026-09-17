import requests
from bs4 import BeautifulSoup

URL = (
    "https://www.costco.com/p/-/callaway-edge-graphite-10-piece-"
    "golf-club-set-right-handed/4000230477?langId=-1"
)

headers = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/140.0.0.0 Safari/537.36"
    )
}


response = requests.get(
    URL,
    headers=headers,
    timeout=20,
)

print("Status:", response.status_code)
print("HTML length:", len(response.text))

soup = BeautifulSoup(response.text, "html.parser")

price_element = soup.select_one(
    '[data-testid="Text_single-price-whole-value"]'
)

if price_element:
    print("Price element:", price_element)
    print("Price:", price_element.get_text(strip=True))
else:
    print("Price element NOT found")