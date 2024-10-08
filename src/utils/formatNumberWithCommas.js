function formatNumberWithCommas (num) {
  const number = num || 0
  return number.toLocaleString('en-US');
}

export default formatNumberWithCommas;