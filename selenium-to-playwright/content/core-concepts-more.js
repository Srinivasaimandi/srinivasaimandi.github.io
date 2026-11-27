/* Additional Core Concepts topics. Each is spliced into the Core Concepts group in content/topics.js
 * (by name, so you control where it sits in the menu). Same format as content/topics.js. */
window.TOPIC_GROUPS = window.TOPIC_GROUPS || {};
window.TOPIC_GROUPS.core = {

  /* ================================================================== */
  asyncAwait: {
    id: 'async-await',
    group: 'Core Concepts',
    title: 'Async/Await for Java Devs',
    summary: 'Promises, async functions, the classic pitfalls, and TypeScript syntax next to Java.',
    keywords: 'async await promise typescript javascript syntax foreach const let java developers',
    intro: `The biggest <em>language</em> difference you'll meet. Selenium's Java calls block until the browser answers.
      Playwright's calls return a <strong>Promise</strong> straight away, and <code>await</code> pauses until it settles. Once
      every browser call is awaited, the code reads just like synchronous Java.`,
    sections: [
      {
        id: 'promises',
        title: 'Blocking calls vs. Promises',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`
// Blocks until the browser answers, then returns a String
String title = driver.getTitle();`, `
// Returns a Promise<string> immediately...
const titlePromise = page.title();
// ...await unwraps it once the browser answers
const title = await titlePromise;`],
            ['', `const title = await page.title(); // the usual one-liner`, 'Every Java call already behaves like this'],
          ],
        },
      },
      {
        id: 'async-functions',
        title: 'async functions and their callers',
        body: `<p>A function that uses <code>await</code> must be marked <code>async</code>, it always returns a Promise, and
          whoever calls it must <code>await</code> it too. "Async all the way up" is the rule.</p>`,
        compare: {
          sel: { file: 'pages/DashboardPage.java' },
          pw: { file: 'pages/dashboard.page.ts' },
          segs: [
            [`
public String getGreeting() {
  return driver.findElement(By.id("greeting")).getText();
}`, `
async getGreeting(): Promise<string> {
  return await this.page.locator('#greeting').innerText();
}`],
            [`String greeting = dashboard.getGreeting();`, `const greeting = await dashboard.getGreeting();`],
          ],
        },
      },
      {
        id: 'pitfalls',
        title: 'The four classic pitfalls',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`driver.findElement(By.id("save")).click();`, `
// ❌ no await: the test moves on before the click happens
page.getByRole('button', { name: 'Save' }).click();

// ✅
await page.getByRole('button', { name: 'Save' }).click();`],
            [`
for (WebElement row : rows) {
  row.findElement(By.tagName("button")).click();
}`, `
// ❌ forEach does not wait for async callbacks
(await rows.all()).forEach(async row => await row.getByRole('button').click());

// ✅ for...of awaits each iteration, in order
for (const row of await rows.all()) {
  await row.getByRole('button').click();
}`],
            [`
if (driver.findElement(By.id("error")).isDisplayed()) {
  // ...
}`, `
// ❌ a Promise is always truthy, so this branch always runs
if (page.locator('#error').isVisible()) { }

// ✅
if (await page.locator('#error').isVisible()) { }`],
            [`// Java: CompletableFuture.allOf(...)`, `
// Start two things together and wait for both
const [response] = await Promise.all([
  page.waitForResponse('**/api/save'),
  page.getByRole('button', { name: 'Save' }).click(),
]);`],
          ],
        },
        callout: {
          type: 'tip',
          body: `The ESLint rules <code>@typescript-eslint/no-floating-promises</code> and
            <code>@typescript-eslint/no-misused-promises</code> catch the first three pitfalls before you run anything.`,
        },
      },
      {
        id: 'syntax',
        title: 'TypeScript syntax for Java developers',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`String name = "tom";`, `const name = 'tom';           // type inferred: string`],
            [`int count = 0; count++;`, `let count = 0; count++;        // let = can be reassigned`],
            [`List<String> items = new ArrayList<>();`, `const items: string[] = [];`],
            [`Map<String, Integer> prices = new HashMap<>();`, `const prices: Record<string, number> = {};`],
            [`items.stream().filter(i -> i.startsWith("a")).toList();`, `items.filter(i => i.startsWith('a'));`],
            [`String msg = "Hello " + name + "!";`, `const msg = \`Hello \${name}!\`;   // template literal`],
            [`if (a.equals(b)) { }`, `if (a === b) { }               // always === , never ==`],
            [`String city = user != null ? user.getCity() : null;`, `const city = user?.city;`],
            [`String env = value != null ? value : "qa";`, `const env = value ?? 'qa';`],
            [`public record User(String name, int age) { }`, `type User = { name: string; age: number };`],
            [`import com.shop.pages.LoginPage;`, `import { LoginPage } from '../pages/login.page';`],
            [`public class LoginPage { }`, `export class LoginPage { }     // export = visible to other files`],
          ],
        },
        callout: {
          type: 'tip',
          body: `Use <code>const</code> by default and <code>let</code> only when you reassign. Never use <code>var</code>.`,
        },
      },
    ],
  },

  /* ================================================================== */
  shadowDom: {
    id: 'shadow-dom',
    group: 'Core Concepts',
    title: 'Shadow DOM',
    summary: 'getShadowRoot() at every level vs. locators that pierce open shadow roots automatically.',
    keywords: 'shadow dom shadowroot web components getshadowroot searchcontext',
    intro: `Web components hide their internals inside <em>shadow roots</em>. In Selenium 4 you call
      <code>getShadowRoot()</code> on each host, level by level. Playwright's CSS and <code>getBy*</code> locators
      <strong>pierce open shadow roots automatically</strong>, so you write the locator as if the shadow DOM weren't there.`,
    sections: [
      {
        id: 'single',
        title: 'One shadow root',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`WebElement host = driver.findElement(By.cssSelector("user-card"));`, ''],
            [`SearchContext shadow = host.getShadowRoot();`, ''],
            [`shadow.findElement(By.cssSelector("button.follow")).click();`, `
await page.locator('user-card button.follow').click(); // pierces the shadow root
// or, better:
await page.getByRole('button', { name: 'Follow' }).click();`],
          ],
        },
      },
      {
        id: 'nested',
        title: 'Nested shadow roots',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`
SearchContext outer = driver.findElement(By.cssSelector("app-shell")).getShadowRoot();
SearchContext inner = outer.findElement(By.cssSelector("settings-panel")).getShadowRoot();`, '', 'Not needed: any depth works'],
            [`inner.findElement(By.cssSelector("input#email")).sendKeys("tom@example.com");`, `await page.getByLabel('Email').fill('tom@example.com');`],
            [`
// Before Selenium 4: a JavaScript workaround
WebElement root = (WebElement) ((JavascriptExecutor) driver)
    .executeScript("return arguments[0].shadowRoot", host);`, ''],
          ],
        },
        callout: [
          {
            type: 'warn',
            body: `XPath does <strong>not</strong> pierce shadow roots in Playwright either. Use CSS or the <code>getBy*</code>
              locators. (Inside a Selenium shadow root, only CSS selectors work.)`,
          },
          {
            type: 'tip',
            body: `<em>Closed</em> shadow roots (<code>mode: 'closed'</code>) can't be reached by either tool. Ask the developers
              for an open root or a test hook.`,
          },
        ],
      },
    ],
  },

  /* ================================================================== */
  elementState: {
    id: 'element-state',
    group: 'Core Concepts',
    title: 'Element State & Conditions',
    summary: 'isDisplayed/isEnabled, "if the element exists", optional popups, and either-or outcomes.',
    keywords: 'isdisplayed isenabled isselected exists conditional if optional popup try catch or locator handler',
    intro: `Selenium's <code>findElement</code> throws when nothing matches, so conditional logic leans on
      <code>findElements().isEmpty()</code> or try/catch. Playwright has two separate tools: <strong>state checks</strong>
      (<code>isVisible()</code> …) answer <em>right now</em> and are for branching; <strong>assertions</strong> retry and are
      for verifying. Mixing them up is a common source of flaky tests.`,
    sections: [
      {
        id: 'state',
        title: 'State checks',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`boolean shown = el.isDisplayed();`, `const shown = await loc.isVisible();`],
            [`boolean enabled = el.isEnabled();`, `const enabled = await loc.isEnabled();`],
            [`boolean disabled = !el.isEnabled();`, `const disabled = await loc.isDisabled();`],
            [`boolean checked = el.isSelected();`, `const checked = await loc.isChecked();`],
            [`boolean editable = el.isEnabled() && el.getAttribute("readonly") == null;`, `const editable = await loc.isEditable();`],
            [`boolean exists = !driver.findElements(By.id("banner")).isEmpty();`, `const exists = (await page.locator('#banner').count()) > 0;`],
          ],
        },
        callout: {
          type: 'warn',
          title: 'These do not wait',
          body: `<code>isVisible()</code> returns <code>false</code> for an element that will appear 200 ms later. To
            <em>verify</em> state, use <code>await expect(loc).toBeVisible()</code>, which retries.`,
        },
      },
      {
        id: 'conditional',
        title: 'Optional elements and popups',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`
List<WebElement> banners = driver.findElements(By.id("cookie-banner"));
if (!banners.isEmpty() && banners.get(0).isDisplayed()) {
  banners.get(0).findElement(By.tagName("button")).click();
}`, `
const banner = page.locator('#cookie-banner');
if (await banner.isVisible()) {
  await banner.getByRole('button', { name: 'Accept' }).click();
}`],
            [`
// Popup may appear at any moment: wrap clicks in try/catch
// for ElementClickInterceptedException and retry`, `
// Whenever the banner shows up during the test, dismiss it
await page.addLocatorHandler(page.locator('#cookie-banner'), async banner => {
  await banner.getByRole('button', { name: 'Accept' }).click();
});`],
          ],
        },
        callout: {
          type: 'pw',
          title: 'Playwright-only: locator handlers',
          body: `<code>page.addLocatorHandler</code> runs your handler whenever the overlay blocks an action, then retries the
            action — perfect for cookie banners, survey popups and "rate this app" dialogs that appear at random times.`,
        },
      },
      {
        id: 'fallback',
        title: 'Waiting with a fallback',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`
try {
  new WebDriverWait(driver, Duration.ofSeconds(3))
      .until(ExpectedConditions.visibilityOfElementLocated(By.id("promo")));
  driver.findElement(By.id("close-promo")).click();
} catch (TimeoutException e) {
  // no promo this time
}`, `
try {
  await page.locator('#promo').waitFor({ state: 'visible', timeout: 3_000 });
  await page.locator('#close-promo').click();
} catch {
  // no promo this time
}`],
          ],
        },
      },
      {
        id: 'either-or',
        title: 'Either of two outcomes',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`
wait.until(ExpectedConditions.or(
    ExpectedConditions.visibilityOfElementLocated(By.id("success")),
    ExpectedConditions.visibilityOfElementLocated(By.id("error"))));`, `
const success = page.getByText('Order placed');
const error = page.getByRole('alert');
await expect(success.or(error).first()).toBeVisible();`],
            [`
if (!driver.findElements(By.id("error")).isEmpty()) {
  Assert.fail(driver.findElement(By.id("error")).getText());
}`, `
if (await error.isVisible()) {
  throw new Error(await error.innerText());
}`],
          ],
        },
      },
    ],
  },

  /* ================================================================== */
  tables: {
    id: 'tables',
    group: 'Core Concepts',
    title: 'Web Tables',
    summary: 'Reading rows and cells, finding a row by its content, and asserting columns and sort order.',
    keywords: 'table row cell column td tr grid sort xpath',
    intro: `Finding a row by the text in one cell and clicking a button in another is a classic Selenium XPath exercise. In
      Playwright you filter rows by their content and chain into them — no axes, no indexes.`,
    sections: [
      {
        id: 'read',
        title: 'Reading a table',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`List<WebElement> rows = driver.findElements(By.cssSelector("#orders tbody tr"));`, `const rows = page.locator('#orders tbody tr');`],
            [`
for (WebElement row : rows) {
  List<WebElement> cells = row.findElements(By.tagName("td"));
  System.out.println(cells.get(0).getText() + " | " + cells.get(2).getText());
}`, `
for (const row of await rows.all()) {
  const cells = row.locator('td');
  console.log(await cells.nth(0).innerText(), '|', await cells.nth(2).innerText());
}`],
          ],
        },
      },
      {
        id: 'find-row',
        title: 'Find a row, act on it',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`
driver.findElement(By.xpath(
    "//table[@id='orders']//tr[td[text()='ORD-1042']]//button[text()='Cancel']"
)).click();`, `
const order = page.locator('#orders tbody tr').filter({ hasText: 'ORD-1042' });
await order.getByRole('button', { name: 'Cancel' }).click();`],
            [`
String status = driver.findElement(By.xpath(
    "//table[@id='orders']//tr[td[text()='ORD-1042']]/td[3]")).getText();
Assert.assertEquals(status, "Cancelled");`, `await expect(order.locator('td').nth(2)).toHaveText('Cancelled');`],
          ],
        },
        callout: {
          type: 'tip',
          body: `For accessible tables, <code>page.getByRole('row', { name: /ORD-1042/ })</code> also works: a row's
            accessible name is built from its cell text.`,
        },
      },
      {
        id: 'assert',
        title: 'Asserting table contents',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`Assert.assertEquals(rows.size(), 3);`, `await expect(rows).toHaveCount(3);`],
            [`
List<String> statuses = driver.findElements(By.cssSelector("#orders td.status"))
    .stream().map(WebElement::getText).toList();
Assert.assertEquals(statuses, List.of("Shipped", "Pending", "Cancelled"));`, `
await expect(page.locator('#orders td.status'))
  .toHaveText(['Shipped', 'Pending', 'Cancelled']);`],
            [`
List<Double> prices = driver.findElements(By.cssSelector("td.price")).stream()
    .map(e -> Double.parseDouble(e.getText())).toList();
List<Double> sorted = new ArrayList<>(prices);
Collections.sort(sorted);
Assert.assertEquals(prices, sorted);`, `
const prices = (await page.locator('td.price').allInnerTexts()).map(Number);
expect(prices).toEqual([...prices].sort((a, b) => a - b));`],
          ],
        },
        callout: {
          type: 'warn',
          body: `<code>allInnerTexts()</code> reads whatever is in the DOM right now. After sorting or filtering, first wait for
            the table to settle — for example <code>await expect(rows).toHaveCount(3)</code> — and then read the values.`,
        },
      },
    ],
  },

  /* ================================================================== */
  cookies: {
    id: 'cookies-storage',
    group: 'Core Concepts',
    title: 'Cookies & Storage',
    summary: 'Cookies on the context instead of the driver, plus localStorage and setup before page load.',
    keywords: 'cookie cookies localstorage sessionstorage storage addcookie deletecookie initscript',
    intro: `Selenium manages cookies on the driver, and only for the domain that's currently open. Playwright manages them on
      the <strong>browser context</strong>: any domain, and even before the first navigation.`,
    sections: [
      {
        id: 'cookies',
        title: 'Cookies',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`
driver.get("https://example.com"); // must be on the domain first
driver.manage().addCookie(new Cookie("session", "abc123"));`, `
await page.context().addCookies([
  { name: 'session', value: 'abc123', url: 'https://example.com' },
]); // no navigation needed`],
            [`Set<Cookie> all = driver.manage().getCookies();`, `const all = await page.context().cookies();`],
            [`Cookie session = driver.manage().getCookieNamed("session");`, `const session = all.find(c => c.name === 'session');`],
            [`driver.manage().deleteCookieNamed("session");`, `await page.context().clearCookies({ name: 'session' });`],
            [`driver.manage().deleteAllCookies();`, `await page.context().clearCookies();`],
          ],
        },
        callout: {
          type: 'tip',
          body: `Each test already starts with a fresh, empty context, so the "delete all cookies before each test" step from
            Selenium suites can simply go.`,
        },
      },
      {
        id: 'storage',
        title: 'localStorage and sessionStorage',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`JavascriptExecutor js = (JavascriptExecutor) driver;`, ''],
            [`js.executeScript("localStorage.setItem('theme', 'dark');");`, `await page.evaluate(() => localStorage.setItem('theme', 'dark'));`],
            [`String theme = (String) js.executeScript("return localStorage.getItem('theme');");`, `const theme = await page.evaluate(() => localStorage.getItem('theme'));`],
            [`js.executeScript("sessionStorage.clear();");`, `await page.evaluate(() => sessionStorage.clear());`],
          ],
        },
      },
      {
        id: 'before-load',
        title: 'Setting state before the page loads',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`driver.get(baseUrl);`, `
await page.addInitScript(() => {
  localStorage.setItem('onboarding-done', 'true');
});`],
            [`js.executeScript("localStorage.setItem('onboarding-done', 'true');");`, `await page.goto('/'); // the app sees the value on its very first load`],
            [`driver.navigate().refresh(); // load again so the app sees it`, ''],
          ],
        },
        callout: {
          type: 'pw',
          body: `<code>addInitScript</code> runs before any of the page's own scripts, on every navigation. It's also handy for
            stubbing things like <code>Math.random</code> or feature flags.`,
        },
      },
    ],
  },

  /* ================================================================== */
  emulation: {
    id: 'emulation',
    group: 'Core Concepts',
    title: 'Emulation & Browser Settings',
    summary: 'Window size, geolocation, permissions, locale, timezone, dark mode, offline and time.',
    keywords: 'window size maximize viewport geolocation permissions locale timezone dark mode color scheme offline user agent clock',
    intro: `Many of these need Chrome-only CDP commands in Selenium. In Playwright they are ordinary options that work in every
      browser — set them in the config, per file with <code>test.use()</code>, or during a test.`,
    sections: [
      {
        id: 'window',
        title: 'Window size',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`driver.manage().window().maximize();`, `await page.setViewportSize({ width: 1920, height: 1080 });`],
            [`driver.manage().window().setSize(new Dimension(375, 812));`, `await page.setViewportSize({ width: 375, height: 812 });`],
            [`Dimension size = driver.manage().window().getSize();`, `const size = page.viewportSize();`],
          ],
        },
        callout: {
          type: 'tip',
          body: `Playwright sizes the <em>viewport</em> (the page area), so results are identical headed or headless. Need a
            genuinely maximized headed Chromium window? Use <code>viewport: null</code> with
            <code>launchOptions: { args: ['--start-maximized'] }</code>.`,
        },
      },
      {
        id: 'location',
        title: 'Geolocation and permissions',
        compare: {
          sel: { file: 'Selenium (Chromium only)' },
          pw: {},
          segs: [
            [`
((ChromiumDriver) driver).executeCdpCommand("Emulation.setGeolocationOverride",
    Map.of("latitude", 51.5, "longitude", -0.12, "accuracy", 100));`, `
test.use({
  geolocation: { latitude: 51.5, longitude: -0.12 },
  permissions: ['geolocation'],
});`],
            [`
Map<String, Object> prefs = Map.of(
    "profile.default_content_setting_values.notifications", 1);
options.setExperimentalOption("prefs", prefs);`, `await page.context().grantPermissions(['notifications']);`],
            ['', `await page.context().setGeolocation({ latitude: 48.85, longitude: 2.35 }); // move mid-test`],
          ],
        },
      },
      {
        id: 'environment',
        title: 'Locale, timezone, dark mode, offline',
        compare: {
          sel: { file: 'Selenium (mostly Chromium only)' },
          pw: {},
          segs: [
            [`options.addArguments("--lang=fr-FR");`, `test.use({ locale: 'fr-FR' });`],
            [`
((ChromiumDriver) driver).executeCdpCommand("Emulation.setTimezoneOverride",
    Map.of("timezoneId", "Asia/Tokyo"));`, `test.use({ timezoneId: 'Asia/Tokyo' });`],
            [`
((ChromiumDriver) driver).executeCdpCommand("Emulation.setEmulatedMedia",
    Map.of("features", List.of(Map.of("name", "prefers-color-scheme", "value", "dark"))));`, `await page.emulateMedia({ colorScheme: 'dark' });`],
            [`// CDP Network.emulateNetworkConditions`, `await page.context().setOffline(true);`],
            [`options.addArguments("--user-agent=QA-Bot/1.0");`, `test.use({ userAgent: 'QA-Bot/1.0' });`],
          ],
        },
      },
      {
        id: 'clock',
        title: 'Controlling time',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`// No built-in support: change the server clock or mock Date with JS`, `
await page.clock.setFixedTime(new Date('2025-12-31T23:59:00'));
await page.goto('/');`],
            ['', `
await page.clock.install({ time: new Date('2025-12-31T23:59:00') });
await page.goto('/');
await page.clock.runFor('02:00'); // fast-forward two minutes`],
          ],
        },
        callout: {
          type: 'pw',
          title: 'Playwright-only: the clock API',
          body: `Test countdowns, session time-outs and "happy new year" banners without waiting.
            <code>setFixedTime</code> freezes <code>Date</code>; <code>install</code> also controls timers, so
            <code>runFor</code> fast-forwards <code>setTimeout</code> and <code>setInterval</code>.`,
        },
      },
    ],
  },
};
