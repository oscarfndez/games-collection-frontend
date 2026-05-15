const { Given, Then, When } = require('@cucumber/cucumber');
const { By, until } = require('selenium-webdriver');
const assert = require('node:assert/strict');
const config = require('../support/config');

async function signIn(world, email, password) {
  await world.open('/login');
  const emailInput = await world.waitVisibleByTestId('login-email');
  const passwordInput = await world.waitVisibleByTestId('login-password');
  await emailInput.clear();
  await emailInput.sendKeys(email);
  await passwordInput.clear();
  await passwordInput.sendKeys(password);
  await (await world.waitVisibleByTestId('login-submit')).click();
}

Given('I am on the login page', async function () {
  await this.open('/login');
  await this.waitVisibleByTestId('login-form');
});

Given('I am signed in as the default user', async function () {
  await signIn(this, config.userEmail, config.userPassword);
  await this.waitUrlContains('/collection');
  await this.waitVisibleByTestId('collection-game-select');
});

When('I open the protected route {string}', async function (route) {
  await this.clearSession();
  await this.open(route);
});

When('I sign in with the default user', async function () {
  await signIn(this, config.userEmail, config.userPassword);
});

When('I open the account menu', async function () {
  await (await this.waitVisibleByTestId('app-menu-toggle')).click();
});

When('I sign out from the account menu', async function () {
  await (await this.waitVisibleByTestId('nav-logout')).click();
});

Then('I should be on the login page', async function () {
  await this.waitUrlContains('/login');
  await this.waitVisibleByTestId('login-form');
});

Then('I should see the collection page', async function () {
  await this.waitUrlContains('/collection');
  await this.waitVisibleByTestId('collection-game-select');
  await this.waitVisibleByTestId('collection-platform-select');
});

Then('I should see the account menu', async function () {
  await this.waitVisibleByTestId('app-menu-panel');
  await this.waitVisibleByTestId('nav-collection');
});

Then('I should not see the inventory navigation entry', async function () {
  await this.driver.wait(until.elementLocated(By.css('[data-testid="app-menu-panel"]')), config.timeoutMs);
  assert.equal(await this.isPresentByTestId('nav-inventory'), false);
});

Then('I should not see the users navigation entry', async function () {
  await this.driver.wait(until.elementLocated(By.css('[data-testid="app-menu-panel"]')), config.timeoutMs);
  assert.equal(await this.isPresentByTestId('nav-users'), false);
});
