const getRemainingValiditySeconds = () =>
  30 - (Math.round(new Date().getTime() / 1000) % 30);

module.exports = {
  getRemainingValiditySeconds,
};
