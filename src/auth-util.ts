export const getRemainingValiditySeconds = (): number =>
  30 - (Math.round(new Date().getTime() / 1000) % 30);

