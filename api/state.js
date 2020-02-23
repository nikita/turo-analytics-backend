const { APP_VERSION } = require("./constants");

export const appUserAgent = () => {
  return `Turo/${APP_VERSION} (iPhone; iOS 13.3; Scale/3.00)`;
};
