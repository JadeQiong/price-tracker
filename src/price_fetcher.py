import os
import re
import time
from typing import Any

import requests


PRODUCT_ID = "4000230477"

PRODUCT_URL = (
    "https://www.costco.com/p/-/callaway-edge-graphite-10-piece-"
    "golf-club-set-right-handed/4000230477?langId=-1"
)

SCRAPE_API_URL = "https://api.anakin.io/v1/url-scraper/scrape"
SCRAPE_STATUS_URL = "https://api.anakin.io/v1/url-scraper"

# Poll at least every 10 seconds.
MIN_POLL_INTERVAL_SECONDS = 10

# Don't wait forever if Anakin gets stuck.
MAX_POLL_TIME_SECONDS = 180


def get_api_key() -> str:
    api_key = os.environ.get("ANAKIN_API_KEY")

    if not api_key:
        raise RuntimeError(
            "ANAKIN_API_KEY environment variable is not set."
        )

    return api_key


def scrape_product() -> dict[str, Any]:
    api_key = get_api_key()

    headers = {
        "X-API-Key": api_key,
        "Content-Type": "application/json",
    }

    # Start scraping job
    try:
        response = requests.post(
            SCRAPE_API_URL,
            headers=headers,
            json={
                "url": PRODUCT_URL,
                "country": "us",
                "useBrowser": True,
                "generateJson": False,
            },
            timeout=120,
        )
    except requests.RequestException as e:
        raise RuntimeError(
            f"Failed to call Anakin URL Scraper: {e}"
        ) from e

    if not response.ok:
        raise RuntimeError(
            f"Anakin URL Scraper returned HTTP "
            f"{response.status_code}: {response.text[:500]}"
        )

    try:
        result = response.json()
    except ValueError as e:
        raise RuntimeError(
            f"Anakin returned invalid JSON "
            f"(HTTP {response.status_code}): "
            f"{response.text[:500]}"
        ) from e

    print(f"Anakin HTTP status: {response.status_code}")
    print(f"Scrape status: {result.get('status')}")

    status = result.get("status")

    if status == "completed":
        return result

    if status == "failed":
        raise RuntimeError(
            f"Anakin scrape failed: {result.get('error')}"
        )

    if status != "processing":
        raise RuntimeError(
            f"Unexpected Anakin scrape status: {status}"
        )

    job_id = result.get("id")

    if not job_id:
        raise RuntimeError(
            "Anakin returned processing status but no job ID."
        )

    print(f"Scrape job ID: {job_id}")

    poll_url = f"{SCRAPE_STATUS_URL}/{job_id}"

    elapsed_seconds = 0

    while elapsed_seconds < MAX_POLL_TIME_SECONDS:
        retry_after_ms = result.get("retry_after_ms", 10000)

        wait_seconds = max(
            retry_after_ms / 1000,
            MIN_POLL_INTERVAL_SECONDS,
        )

        # Don't sleep beyond our maximum polling time.
        wait_seconds = min(
            wait_seconds,
            MAX_POLL_TIME_SECONDS - elapsed_seconds,
        )

        print(
            f"Scrape still processing. "
            f"Waiting {wait_seconds:.1f}s..."
        )

        time.sleep(wait_seconds)
        elapsed_seconds += wait_seconds

        try:
            poll_response = requests.get(
                poll_url,
                headers={
                    "X-API-Key": api_key,
                },
                timeout=120,
            )
        except requests.RequestException as e:
            raise RuntimeError(
                f"Failed to poll Anakin URL Scraper: {e}"
            ) from e

        if not poll_response.ok:
            raise RuntimeError(
                f"Anakin polling returned HTTP "
                f"{poll_response.status_code}: "
                f"{poll_response.text[:500]}"
            )

        try:
            result = poll_response.json()
        except ValueError as e:
            raise RuntimeError(
                f"Anakin polling returned invalid JSON "
                f"(HTTP {poll_response.status_code}): "
                f"{poll_response.text[:500]}"
            ) from e

        status = result.get("status")
        print(f"Poll status: {status}")

        if status == "completed":
            return result

        if status == "failed":
            raise RuntimeError(
                f"Anakin scrape failed: {result.get('error')}"
            )

        if status != "processing":
            raise RuntimeError(
                f"Unexpected Anakin polling status: {status}"
            )

    raise TimeoutError(
        f"Anakin scrape did not complete within "
        f"{MAX_POLL_TIME_SECONDS} seconds."
    )


def extract_price(result: dict[str, Any]) -> float:
    html = result.get("html")

    if not html:
        raise ValueError(
            "Anakin response does not contain raw HTML."
        )

    match = re.search(
        r'data-testid="Text_single-price-whole-value"'
        r'[^>]*>\s*\$([\d,]+(?:\.\d{2})?)',
        html,
    )

    if not match:
        raise ValueError(
            "Could not find Costco price element in HTML."
        )

    price_text = match.group(1).replace(",", "")

    print(f"Raw price text: ${price_text}")

    try:
        price = float(price_text)
    except ValueError as e:
        raise ValueError(
            f"Invalid price value: {price_text!r}"
        ) from e

    if price <= 0:
        raise ValueError(
            f"Invalid product price: {price}"
        )

    return price


def fetch_price() -> float:
    result = scrape_product()
    return extract_price(result)


if __name__ == "__main__":
    try:
        price = fetch_price()
        print(f"Current price: ${price:.2f}")
    except Exception as e:
        print(f"ERROR: {e}")
        raise