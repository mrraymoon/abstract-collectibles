const ERC20_DECIMALS = 18;
export const DECIMALS = 10 ** 18;

const ether = (wei) => wei / DECIMALS;

export var truncate = function (address) {
  if (!address) return
  return address.slice(0, 5) + "..." + address.slice(address.length - 4, address.length);
};

// convert from big number
export const formatBigNumber = (num) => {
  if (!num) return
  return num.shiftedBy(-ERC20_DECIMALS).toFixed(2);
}

export const formatPrice = (price) => {
  const precision = 100; // Use 2 decimal places

  price = ether(price);
  price = Math.round(price * precision) / precision;

  return price;
};