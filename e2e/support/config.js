const DEFAULT_BASE_URL = 'http://localhost:4200';

function boolEnv(value, defaultValue = true) {
  if (value === undefined) {
    return defaultValue;
  }

  return !['false', '0', 'no'].includes(value.toLowerCase());
}

module.exports = {
  baseUrl: process.env.E2E_BASE_URL || DEFAULT_BASE_URL,
  browser: process.env.E2E_BROWSER || 'chrome',
  chromeBinary: process.env.E2E_CHROME_BINARY,
  chromeDriver: process.env.E2E_CHROME_DRIVER,
  headless: boolEnv(process.env.E2E_HEADLESS, true),
  timeoutMs: Number(process.env.E2E_TIMEOUT_MS || 15000),
  userEmail: process.env.E2E_USER_EMAIL || 'user@domain.com',
  userPassword: process.env.E2E_USER_PASSWORD || 'password'
};
