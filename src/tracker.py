import json
from datetime import datetime, timezone
from pathlib import Path

from price_fetcher import fetch_price, PRODUCT_ID, PRODUCT_URL


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = PROJECT_ROOT / "data" / "price_history.json"


def load_history() -> list[dict]:
    if not DATA_FILE.exists():
        return []

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_history(history: list[dict]) -> None:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)


def create_record(price: float) -> dict:
    return {
        "product_id": PRODUCT_ID,
        "product_url": PRODUCT_URL,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "price": price,
    }


def main():
    print("Checking Costco price...")

    current_price = fetch_price()

    history = load_history()

    previous_price = (
        history[-1]["price"]
        if history
        else None
    )

    record = create_record(current_price)
    history.append(record)

    save_history(history)

    print(f"Current price: ${current_price:.2f}")

    if previous_price is None:
        print("No previous price available.")
    elif current_price < previous_price:
        print(
            f"Price decreased: "
            f"${previous_price:.2f} -> ${current_price:.2f}"
        )
    elif current_price > previous_price:
        print(
            f"Price increased: "
            f"${previous_price:.2f} -> ${current_price:.2f}"
        )
    else:
        print("Price unchanged.")


if __name__ == "__main__":
    main()