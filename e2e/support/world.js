const { setDefaultTimeout, World } = require('@cucumber/cucumber');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const config = require('./config');

setDefaultTimeout(config.timeoutMs * 2);

class SmokeWorld extends World {
  async startBrowser() {
    if (this.driver) {
      return;
    }

    let builder = new Builder().forBrowser(config.browser);

    if (config.browser === 'chrome') {
      const options = new chrome.Options();
      if (config.chromeBinary) {
        options.setChromeBinaryPath(config.chromeBinary);
      }
      if (config.headless) {
        options.addArguments('--headless=new');
      }
      options.addArguments('--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,1000');
      builder = builder.setChromeOptions(options);
      if (config.chromeDriver) {
        builder = builder.setChromeService(new chrome.ServiceBuilder(config.chromeDriver));
      }
    }

    if (config.browser === 'firefox') {
      const options = new firefox.Options();
      if (config.headless) {
        options.addArguments('-headless');
      }
      builder = builder.setFirefoxOptions(options);
    }

    this.driver = await builder.build();
  }

  async stopBrowser() {
    if (!this.driver) {
      return;
    }

    await this.driver.quit();
    this.driver = undefined;
  }

  async open(path) {
    await this.startBrowser();
    await this.driver.get(`${config.baseUrl}${path}`);
  }

  byTestId(testId) {
    return By.css(`[data-testid="${testId}"]`);
  }

  async findByTestId(testId) {
    return this.driver.wait(until.elementLocated(this.byTestId(testId)), config.timeoutMs);
  }

  async waitVisibleByTestId(testId) {
    const element = await this.findByTestId(testId);
    await this.driver.wait(until.elementIsVisible(element), config.timeoutMs);
    return element;
  }

  async waitUrlContains(fragment) {
    await this.driver.wait(until.urlContains(fragment), config.timeoutMs);
  }

  async isPresentByTestId(testId) {
    const elements = await this.driver.findElements(this.byTestId(testId));
    return elements.length > 0;
  }

  async clearSession() {
    await this.open('/login');
    await this.driver.executeScript('window.localStorage.clear(); window.sessionStorage.clear();');
  }
}

module.exports = {
  SmokeWorld
};
