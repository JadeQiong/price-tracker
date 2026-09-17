# import os
# from typing import Any

# from anakin import Anakin


# PRODUCT_ID = "4000230477"

# PRODUCT_URL = (
#     "https://www.costco.com/p/-/callaway-edge-graphite-10-piece-"
#     "golf-club-set-right-handed/4000230477?langId=-1"
# )

# ACTION_ID = "co_product_details"


# client = Anakin(
#     api_key=os.environ["ANAKIN_API_KEY"]
# )


# def fetch_product() -> Any:
#     return client.wire(
#         ACTION_ID,
#         {
#             "url": PRODUCT_URL,
#         },
#     )


# def fetch_price() -> float:
#     result = fetch_product()

#     print("Anakin result:")
#     print(result)

#     # TODO:
#     # 根据第一次实际返回的 response 调整这里。
#     raise ValueError("Need to inspect Anakin response structure.")


# if __name__ == "__main__":
#     price = fetch_price()
#     print(f"Current price: ${price:.2f}")
PRODUCT_ID = "4000230477"

PRODUCT_URL = (
    "https://www.costco.com/p/-/callaway-edge-graphite-10-piece-"
    "golf-club-set-right-handed/4000230477?langId=-1"
)


def fetch_price() -> float:
    """
    Temporary hardcoded price.

    Replace this implementation with the Anakin API call
    once the Costco API integration is working.
    """
    return 659.99


if __name__ == "__main__":
    price = fetch_price()
    print(f"Current price: ${price:.2f}")