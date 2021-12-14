const getRemainingValiditySeconds = () =>
  30 - (Math.round(new Date() / 1000) % 30);

module.exports = {
  getRemainingValiditySeconds,
};
