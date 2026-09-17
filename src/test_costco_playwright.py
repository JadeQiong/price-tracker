from playwright.sync_api import sync_playwright

URL = (
    "https://www.costco.com/p/-/callaway-edge-graphite-10-piece-"
    "golf-club-set-right-handed/4000230477"
)

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=False
    )

    page = browser.new_page()

    page.goto(
        URL,
        wait_until="domcontentloaded",
        timeout=60000,
    )

    print("URL:", page.url)
    print("TITLE:", page.title())

    page.wait_for_timeout(10000)

    print(page.locator("body").inner_text()[:2000])

    browser.close()