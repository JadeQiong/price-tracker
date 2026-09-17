const PRICE_SELECTOR =
  '[data-testid="Text_single-price-whole-value"]';

function getPrice() {
  const element = document.querySelector(PRICE_SELECTOR);

  if (!element) {
    return null;
  }

  return element.textContent.trim();
}

function checkPrice() {
  const price = getPrice();

  if (price) {
    console.log("Costco price:", price);
    return true;
  }

  console.log("Price not found yet...");
  return false;
}

// 先立即检查
if (!checkPrice()) {
  // Costco 动态加载页面，所以每 1 秒检查一次
  const interval = setInterval(() => {
    if (checkPrice()) {
      clearInterval(interval);
    }
  }, 1000);

  // 最多等待 30 秒
  setTimeout(() => {
    clearInterval(interval);
  }, 30000);
}