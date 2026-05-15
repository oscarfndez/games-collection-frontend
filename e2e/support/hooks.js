const { After, Before, Status, setWorldConstructor } = require('@cucumber/cucumber');
const fs = require('node:fs');
const path = require('node:path');
const { SmokeWorld } = require('./world');

setWorldConstructor(SmokeWorld);

Before(async function () {
  await this.startBrowser();
  await this.clearSession();
});

After(async function (scenario) {
  if (scenario.result?.status === Status.FAILED && this.driver) {
    const screenshot = await this.driver.takeScreenshot();
    const reportsDir = path.join(process.cwd(), 'e2e', 'reports', 'screenshots');
    fs.mkdirSync(reportsDir, { recursive: true });
    const safeName = scenario.pickle.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const filePath = path.join(reportsDir, `${safeName}.png`);
    fs.writeFileSync(filePath, screenshot, 'base64');
    this.attach(screenshot, 'image/png');
  }

  await this.stopBrowser();
});
