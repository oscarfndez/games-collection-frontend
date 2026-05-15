# Smoke Tests

This folder contains the first Selenium + Cucumber smoke test suite for Games Collection.

The suite is intentionally small and non-destructive. It validates critical user journeys without creating or deleting application data:

- Anonymous users are redirected to `/login` when opening a protected route.
- A regular user can sign in.
- A regular user can open the collection page.
- The account menu opens and logout returns to login.
- A regular user does not see admin-only navigation entries.

## Run

Install dependencies:

```bash
npm ci
```

Run against a local Angular dev server:

```bash
npm run e2e:smoke
```

Run against the deployed Kubernetes ingress:

```bash
E2E_BASE_URL=http://oscarfndez.eu/gamescollection npm run e2e:smoke
```

PowerShell:

```powershell
$env:E2E_BASE_URL="http://oscarfndez.eu/gamescollection"
npm run e2e:smoke
```

## Configuration

Environment variables:

```text
E2E_BASE_URL=http://localhost:4200
E2E_BROWSER=chrome
E2E_HEADLESS=true
E2E_TIMEOUT_MS=15000
E2E_USER_EMAIL=user@domain.com
E2E_USER_PASSWORD=password
E2E_CHROME_BINARY=/usr/bin/chromium-browser
E2E_CHROME_DRIVER=/usr/bin/chromedriver
```

`E2E_CHROME_BINARY` and `E2E_CHROME_DRIVER` are useful in Jenkins when running inside an Alpine-based Node container with Chromium installed through `apk`.

Example Alpine setup:

```bash
apk add --no-cache chromium chromium-chromedriver
```

## Reports

The npm script writes an HTML report to:

```text
e2e/reports/cucumber-report.html
```

On failure, screenshots are saved under:

```text
e2e/reports/screenshots/
```

## Selector Policy

Smoke tests should use `data-testid` attributes instead of translated text or CSS classes. This keeps the tests stable while the UI evolves visually or changes language.
