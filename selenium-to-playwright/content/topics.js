/* Content for the Selenium (Java) → Playwright (TypeScript) guide.
 *
 * Topic:    { id, group, title, summary, keywords?, intro, sections: [...] }   or   { group, title, soon: true }
 * Section:  { id, title, body?, compare?, table?, callout? (one or an array) }
 * compare:  { sel: { file, lang }, pw: { file, lang }, segs: [[seleniumCode, playwrightCode, placeholder?], ...] }
 *           Each pair renders on one row so equivalent lines line up. Use '' when a side has no counterpart;
 *           the optional third item replaces the default "not needed / no equivalent" text.
 *           Langs: java (default left), ts (default right), shell, xml, text.
 * callout:  { type: 'diff' | 'tip' | 'warn' | 'pw', title?, body }
 *
 * Code lives in template literals: write it flush-left, escape "${" as "\${", and avoid backslashes.
 */
window.TOPICS = [

  /* ================================================================== */
  {
    id: 'setup',
    group: 'Getting Started',
    title: 'Setup & Installation',
    summary: 'Maven + TestNG vs. one npm command. Drivers, project layout, running tests.',
    keywords: 'install maven npm pom codegen run cli',
    intro: `Selenium is a <em>browser automation library</em>: you assemble a framework around it — TestNG or JUnit
      to run tests, an assertion library, a reporter, a driver factory. <strong>Playwright Test</strong> ships all of that
      as one package: runner, assertions, fixtures, parallelism, HTML reports and tracing.`,
    sections: [
      {
        id: 'install',
        title: 'Installing',
        body: `<p>In Java you declare dependencies in <code>pom.xml</code>. Playwright's initializer scaffolds a ready-to-run
          project: <code>playwright.config.ts</code>, an example test, and the browser binaries.</p>`,
        compare: {
          sel: { file: 'pom.xml', lang: 'xml' },
          pw: { file: 'terminal', lang: 'shell' },
          segs: [
            [`
<dependency>
  <groupId>org.seleniumhq.selenium</groupId>
  <artifactId>selenium-java</artifactId>
  <version>\${selenium.version}</version>
</dependency>`, `
# Creates the config, an example test, and installs browsers
npm init playwright@latest`],
            [`
<dependency>
  <groupId>org.testng</groupId>
  <artifactId>testng</artifactId>
  <version>\${testng.version}</version>
  <scope>test</scope>
</dependency>`, '', 'Runner, assertions and reporters are included'],
          ],
        },
        callout: {
          type: 'tip',
          body: `When the initializer asks, choose <strong>TypeScript</strong> and a <code>tests</code> folder. You need a
            current LTS release of Node.js. No separate TypeScript compiler setup is required — Playwright compiles test files for you.`,
        },
      },
      {
        id: 'browsers',
        title: 'Browser binaries',
        body: `<p>Since Selenium 4.6, <em>Selenium Manager</em> downloads the driver that matches the browser installed on your
          machine. Playwright instead downloads its own tested browser builds, pinned to the Playwright version — so every
          laptop and CI agent runs exactly the same browser.</p>`,
        compare: {
          sel: { file: 'DriverFactory.java' },
          pw: { file: 'terminal', lang: 'shell' },
          segs: [
            [`
// Selenium Manager resolves chromedriver automatically
WebDriver driver = new ChromeDriver();`, `
npx playwright install             # chromium, firefox, webkit
npx playwright install chromium    # or just one browser`],
            [`// Older projects: WebDriverManager.chromedriver().setup();`,
             `npx playwright install --with-deps # + OS libraries (Linux / CI)`],
          ],
        },
        callout: {
          type: 'tip',
          body: `Want your installed Google Chrome or Microsoft Edge instead of the bundled Chromium? Set
            <code>channel: 'chrome'</code> or <code>channel: 'msedge'</code> in the config.`,
        },
      },
      {
        id: 'structure',
        title: 'Project structure',
        compare: {
          sel: { file: 'Maven project', lang: 'text' },
          pw: { file: 'Playwright project', lang: 'text' },
          segs: [
            [`src/test/java/tests/LoginTest.java`, `tests/login.spec.ts`],
            [`src/test/java/pages/LoginPage.java`, `pages/login.page.ts`],
            [`testng.xml`, `playwright.config.ts`],
            [`pom.xml`, `package.json`],
            [`target/surefire-reports/`, `playwright-report/   (HTML report)
test-results/        (traces, screenshots, videos)`],
          ],
        },
        callout: {
          type: 'tip',
          body: `By default, test files must end in <code>.spec.ts</code> or <code>.test.ts</code> (change it with
            <code>testMatch</code> in the config).`,
        },
      },
      {
        id: 'running',
        title: 'Running tests',
        compare: {
          sel: { file: 'terminal', lang: 'shell' },
          pw: { file: 'terminal', lang: 'shell' },
          segs: [
            [`mvn test`, `npx playwright test`],
            [`mvn test -Dtest=LoginTest`, `npx playwright test login.spec.ts`],
            [`mvn test -Dgroups=smoke`, `npx playwright test --grep @smoke`],
            [`# headed by default; headless via ChromeOptions`, `npx playwright test --headed     # headless is the default`],
            [``, `npx playwright test --ui         # watch mode + time-travel debugging`],
            [`# debug: breakpoints in the IDE`, `npx playwright test --debug      # step through in the Inspector`],
            [`# reports: Surefire, Allure, ExtentReports...`, `npx playwright show-report       # built-in HTML report`],
          ],
        },
        callout: {
          type: 'pw',
          title: 'Playwright-only: Codegen',
          body: `<code>npx playwright codegen https://your-app.com</code> opens a browser and writes test code while you click —
            like Selenium IDE, but it emits real Playwright Test code with recommended locators. It's the fastest way to learn
            how Playwright would locate an element.`,
        },
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'first-test',
    group: 'Getting Started',
    title: 'Your First Test',
    summary: 'A complete login test written both ways, plus how TestNG annotations map to hooks.',
    keywords: 'login example testng annotations hooks beforeEach describe',
    intro: `The same login test, written both ways. Hover any row to see which lines correspond, and notice what disappears
      on the right: the setup, the teardown, and the explicit wait.`,
    sections: [
      {
        id: 'login',
        title: 'A login test, side by side',
        compare: {
          sel: { file: 'LoginTest.java' },
          pw: { file: 'tests/login.spec.ts' },
          segs: [
            [`
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.*;
import org.testng.Assert;
import org.testng.annotations.*;
import java.time.Duration;
`, `import { test, expect } from '@playwright/test';`],
            [`
public class LoginTest {
  private WebDriver driver;

  @BeforeMethod
  public void setUp() {
    driver = new ChromeDriver();
    driver.manage().window().maximize();
  }
`, `
// No setUp(): the built-in 'page' fixture gives every
// test a fresh, isolated browser context and tab.`],
            [`
  @Test
  public void userCanLogIn() {`, `test('user can log in', async ({ page }) => {`],
            [`    driver.get("https://example.com/login");`, `  await page.goto('https://example.com/login');`],
            [`    driver.findElement(By.id("username")).sendKeys("tom");`, `  await page.getByLabel('Username').fill('tom');`],
            [`    driver.findElement(By.id("password")).sendKeys("secret");`, `  await page.getByLabel('Password').fill('secret');`],
            [`    driver.findElement(By.cssSelector("button[type='submit']")).click();`,
             `  await page.getByRole('button', { name: 'Sign in' }).click();`],
            [`
    WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    WebElement heading = wait.until(
        ExpectedConditions.visibilityOfElementLocated(By.tagName("h1")));`, ''],
            [`
    Assert.assertEquals(heading.getText(), "Welcome, tom");
  }`, `
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome, tom');
});`],
            [`
  @AfterMethod
  public void tearDown() {
    driver.quit();
  }
}`, `
// No tearDown(): the context is closed for you,
// even when the test fails.`],
          ],
        },
        callout: [
          {
            type: 'diff',
            title: 'What changed',
            body: `<ul>
              <li><strong>async / await</strong> — every browser call returns a Promise, so test functions are <code>async</code> and calls are <code>await</code>ed.</li>
              <li><strong>Fixtures instead of @Before/@After</strong> — ask for <code>page</code> in the test's parameters and Playwright creates and cleans it up.</li>
              <li><strong>No explicit wait</strong> — <code>expect(…).toHaveText()</code> retries until the text matches or the timeout (5 s by default) runs out.</li>
              <li><strong>User-facing locators</strong> — <code>getByLabel</code> and <code>getByRole</code> find elements the way a user does, not by implementation ids.</li>
            </ul>`,
          },
          {
            type: 'warn',
            title: 'Forgetting await',
            body: `Without <code>await</code>, a Playwright call fires and the test moves straight on — causing flaky or
              falsely passing tests. Turn on the ESLint rule <code>@typescript-eslint/no-floating-promises</code> to catch it.`,
          },
        ],
      },
      {
        id: 'hooks',
        title: 'TestNG annotations → test hooks',
        body: `<p>A test file groups tests with <code>test.describe</code> and uses hooks where you'd use TestNG annotations.</p>`,
        compare: {
          sel: { file: 'CartTest.java' },
          pw: { file: 'tests/cart.spec.ts' },
          segs: [
            [`public class CartTest {`, `test.describe('cart', () => {`],
            [`
  @BeforeClass
  public void beforeAll() { /* once per class */ }`, `  test.beforeAll(async () => { /* once per worker */ });`],
            [`
  @BeforeMethod
  public void beforeEach() { driver.get(baseUrl); }`, `  test.beforeEach(async ({ page }) => { await page.goto('/'); });`],
            [`
  @Test
  public void addsItem() { /* ... */ }`, `  test('adds item', async ({ page }) => { /* ... */ });`],
            [`
  @Test(enabled = false)
  public void removesItem() { }`, `  test.skip('removes item', async ({ page }) => { });`],
            [`
  @Test(groups = "smoke")
  public void showsTotal() { }`, `  test('shows total', { tag: '@smoke' }, async ({ page }) => { });`],
            [`
  @AfterMethod
  public void afterEach() { }`, `  test.afterEach(async ({ page }) => { });`],
            [`}`, `});`],
          ],
        },
        callout: {
          type: 'tip',
          body: `<code>beforeAll</code> runs once per <em>worker process</em>, not once for the whole run. For true one-time setup
            (seeding data, logging in once) use a setup project — covered in <em>Authentication reuse</em>.`,
        },
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'browsers',
    group: 'Getting Started',
    title: 'Browsers & Configuration',
    summary: 'Options objects vs. playwright.config.ts, and the Browser → Context → Page model.',
    keywords: 'chromeoptions headless config context page projects devices mobile',
    intro: `In Selenium you configure each browser in code with an Options object, usually inside a driver factory. In
      Playwright, configuration lives in <code>playwright.config.ts</code> and every test inherits it.`,
    sections: [
      {
        id: 'choosing',
        title: 'Choosing a browser',
        body: `<p>Each <em>project</em> runs the whole suite in one browser configuration. Run a single one with
          <code>npx playwright test --project=firefox</code>.</p>`,
        compare: {
          sel: { file: 'DriverFactory.java' },
          pw: { file: 'playwright.config.ts' },
          segs: [
            [`
String browser = System.getProperty("browser", "chrome");
WebDriver driver = switch (browser) {`, `
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [`],
            [`  case "chrome" -> new ChromeDriver();`, `    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },`],
            [`  case "firefox" -> new FirefoxDriver();`, `    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },`],
            [`  case "edge" -> new EdgeDriver();`, `    { name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },`],
            [`  case "safari" -> new SafariDriver(); // macOS only`, `    { name: 'webkit', use: { ...devices['Desktop Safari'] } }, // any OS`],
            [`  default -> throw new IllegalArgumentException(browser);
};`, `  ],
});`],
          ],
        },
        callout: [
          {
            type: 'tip',
            body: `WebKit is the engine behind Safari. Playwright's WebKit build runs on Windows and Linux too, so you can check
              Safari-like behavior without a Mac.`,
          },
          {
            type: 'pw',
            title: 'Playwright-only: device emulation',
            body: `<code>{ name: 'mobile', use: { ...devices['iPhone 13'] } }</code> sets viewport, user agent, touch and device
              scale factor in one line. Selenium only offers Chrome's <code>mobileEmulation</code> option.`,
          },
        ],
      },
      {
        id: 'options',
        title: 'Common options',
        compare: {
          sel: { file: 'DriverFactory.java' },
          pw: { file: 'playwright.config.ts' },
          segs: [
            [`ChromeOptions options = new ChromeOptions();`, `export default defineConfig({
  use: {`],
            [`options.addArguments("--headless=new");`, `    headless: true, // already the default`],
            [`options.addArguments("--window-size=1280,720");`, `    viewport: { width: 1280, height: 720 },`],
            [`options.setAcceptInsecureCerts(true);`, `    ignoreHTTPSErrors: true,`],
            [`String baseUrl = config.getProperty("baseUrl");`, `    baseURL: 'https://staging.example.com',`],
            [`options.addArguments("--lang=de-DE");`, `    locale: 'de-DE',`],
            [``, `    timezoneId: 'Europe/Berlin',`],
            [`// Screenshots on failure: write a TestNG listener`, `
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',`],
            [`WebDriver driver = new ChromeDriver(options);`, `  },
});`],
          ],
        },
        callout: {
          type: 'tip',
          body: `Override options for one file with <code>test.use({ viewport: { width: 375, height: 667 } })</code>, or for one
            run from the CLI, e.g. <code>--headed</code>.`,
        },
      },
      {
        id: 'context',
        title: 'Driver vs. Browser, Context & Page',
        body: `<p>This is the most important architectural difference. A Selenium <code>WebDriver</code> is one browser session.
          Playwright splits that into three layers:</p>
          <ul>
            <li><strong>Browser</strong> — the browser process. Expensive, so it's launched once per worker and reused.</li>
            <li><strong>BrowserContext</strong> — an isolated, incognito-like profile with its own cookies, storage and cache. Takes milliseconds to create.</li>
            <li><strong>Page</strong> — a tab inside a context.</li>
          </ul>`,
        compare: {
          sel: {},
          pw: { file: 'library API, outside the test runner' },
          segs: [
            [`
// One WebDriver = one browser process + one session
WebDriver driver = new ChromeDriver();`, `
import { chromium } from 'playwright';

const browser = await chromium.launch();`],
            [`
// Isolation between tests = quit and start a new driver (~1-2 s)
driver.quit();
driver = new ChromeDriver();`, `
// Isolation = a new context (~milliseconds)
const context = await browser.newContext();`],
            [`driver.switchTo().newWindow(WindowType.TAB);`, `const page = await context.newPage();`],
            [`driver.quit();`, `await browser.close();`],
          ],
        },
        callout: {
          type: 'diff',
          body: `Inside <code>@playwright/test</code> you rarely write this code: <code>browser</code>, <code>context</code> and
            <code>page</code> are fixtures. Each test automatically gets a <strong>new context</strong>, so cookies and logins never
            leak between tests — and that's what makes running tests in parallel cheap.`,
        },
      },
    ],
  },

  window.TOPIC_GROUPS.core.asyncAwait,     // content/core-concepts-more.js

  /* ================================================================== */
  {
    id: 'navigation',
    group: 'Core Concepts',
    title: 'Navigation',
    summary: 'get, back, refresh, title and URL — plus waiting for navigation.',
    keywords: 'goto get url title back forward reload refresh baseurl',
    intro: `Navigation maps almost one-to-one. The differences: Playwright methods return Promises (so they need
      <code>await</code>), and URLs can be relative to the <code>baseURL</code> from your config.`,
    sections: [
      {
        id: 'basics',
        title: 'Basic navigation',
        compare: {
          sel: { file: 'NavigationTest.java' },
          pw: { file: 'navigation.spec.ts' },
          segs: [
            [`driver.get("https://example.com/login");`, `await page.goto('https://example.com/login');`],
            [`driver.get(baseUrl + "/login");`, `await page.goto('/login'); // resolved against baseURL`],
            [`driver.navigate().back();`, `await page.goBack();`],
            [`driver.navigate().forward();`, `await page.goForward();`],
            [`driver.navigate().refresh();`, `await page.reload();`],
            [`String title = driver.getTitle();`, `const title = await page.title();`],
            [`String url = driver.getCurrentUrl();`, `const url = page.url(); // synchronous: no await`],
            [`String html = driver.getPageSource();`, `const html = await page.content();`],
          ],
        },
        callout: {
          type: 'tip',
          body: `<code>page.goto()</code> waits for the <code>load</code> event by default. Pass
            <code>{ waitUntil: 'domcontentloaded' }</code> for faster navigation — similar to Selenium's
            <code>PageLoadStrategy.EAGER</code>.`,
        },
      },
      {
        id: 'waiting',
        title: 'Waiting for navigation',
        body: `<p>After a click that navigates, wait for the new URL rather than sleeping.</p>`,
        compare: {
          sel: { file: 'NavigationTest.java' },
          pw: { file: 'navigation.spec.ts' },
          segs: [
            [`driver.findElement(By.id("login")).click();`, `await page.getByRole('button', { name: 'Log in' }).click();`],
            [`
new WebDriverWait(driver, Duration.ofSeconds(10))
    .until(ExpectedConditions.urlContains("/dashboard"));`, `await page.waitForURL('**/dashboard');`],
            [`Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"));`, `await expect(page).toHaveURL(/dashboard/);`],
          ],
        },
        callout: {
          type: 'diff',
          title: 'Prefer assertions over reading values',
          body: `<code>expect(page.url()).toContain('/dashboard')</code> checks once. <code>await expect(page).toHaveURL(/dashboard/)</code>
            retries until the URL matches — so it waits <em>and</em> asserts.`,
        },
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'locators',
    group: 'Core Concepts',
    title: 'Locators',
    summary: 'WebElement vs. Locator, getByRole and friends, lists, filtering and strict mode.',
    keywords: 'by id xpath css findelement findelements getbyrole getbylabel getbytestid filter nth stale',
    intro: `This is where Playwright feels most different. A Selenium <code>WebElement</code> is a handle to a DOM node found
      <em>right now</em> — if the page re-renders, it goes stale. A Playwright <code>Locator</code> is a <em>recipe</em> for
      finding an element, resolved fresh every time you act on it. <code>StaleElementReferenceException</code> simply doesn't exist.`,
    sections: [
      {
        id: 'element-vs-locator',
        title: 'WebElement vs. Locator',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`
// Searches the DOM immediately; throws NoSuchElementException if absent
WebElement save = driver.findElement(By.id("save"));`, `
// Nothing is searched yet — this is only a description
const save = page.locator('#save');`],
            [`
// If the DOM re-rendered meanwhile: StaleElementReferenceException
save.click();`, `
// Resolved now: waits for the element, then clicks
await save.click();`],
          ],
        },
        callout: {
          type: 'tip',
          body: `Creating a locator is synchronous — no <code>await</code>. Only actions (<code>click</code>, <code>fill</code>, …),
            reads (<code>innerText</code>, <code>count</code>, …) and assertions are awaited.`,
        },
      },
      {
        id: 'classic',
        title: 'CSS, XPath, id and friends',
        body: `<p>All your existing selectors still work through <code>page.locator()</code>. XPath is detected automatically when
          the string starts with <code>//</code>.</p>`,
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`driver.findElement(By.id("email"))`, `page.locator('#email')`],
            [`driver.findElement(By.name("q"))`, `page.locator('[name="q"]')`],
            [`driver.findElement(By.className("alert"))`, `page.locator('.alert')`],
            [`driver.findElement(By.tagName("h1"))`, `page.locator('h1')`],
            [`driver.findElement(By.cssSelector("form .btn.primary"))`, `page.locator('form .btn.primary')`],
            [`driver.findElement(By.xpath("//table//tr[2]/td[1]"))`, `page.locator('//table//tr[2]/td[1]')`],
            [`driver.findElement(By.linkText("Forgot password?"))`, `page.getByRole('link', { name: 'Forgot password?', exact: true })`],
            [`driver.findElement(By.partialLinkText("Forgot"))`, `page.getByRole('link', { name: 'Forgot' })`],
          ],
        },
        callout: {
          type: 'tip',
          body: `Text matching in <code>getByRole</code>, <code>getByText</code> and <code>getByLabel</code> is case-insensitive and
            matches substrings by default. Pass <code>exact: true</code> for an exact match, or a regular expression such as <code>/^Save$/</code>.`,
        },
      },
      {
        id: 'user-facing',
        title: 'User-facing locators (recommended)',
        body: `<p>Playwright encourages locating elements the way users and assistive technology perceive them — by role, label and
          text. These locators survive CSS and id refactors, and they double as a light accessibility check.</p>`,
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`By.xpath("//button[normalize-space()='Sign in']")`, `page.getByRole('button', { name: 'Sign in' })`],
            [`By.xpath("//h2[text()='Orders']")`, `page.getByRole('heading', { name: 'Orders', level: 2 })`],
            [`By.xpath("//label[text()='Email']/following-sibling::input")`, `page.getByLabel('Email')`],
            [`By.cssSelector("input[placeholder='Search']")`, `page.getByPlaceholder('Search')`],
            [`By.xpath("//*[contains(text(),'Welcome back')]")`, `page.getByText('Welcome back')`],
            [`By.cssSelector("img[alt='Company logo']")`, `page.getByAltText('Company logo')`],
            [`By.cssSelector("[title='Close']")`, `page.getByTitle('Close')`],
            [`By.cssSelector("[data-testid='cart-badge']")`, `page.getByTestId('cart-badge')`],
          ],
        },
        callout: [
          {
            type: 'tip',
            title: 'Which locator should I use?',
            body: `<ol>
              <li><code>getByRole</code> — buttons, links, headings, checkboxes, textboxes, rows…</li>
              <li><code>getByLabel</code> — form fields</li>
              <li><code>getByPlaceholder</code>, <code>getByText</code>, <code>getByAltText</code>, <code>getByTitle</code></li>
              <li><code>getByTestId</code> — when there's no good user-facing option</li>
              <li>CSS / XPath — last resort</li>
            </ol>
            Your app uses <code>data-qa</code> instead of <code>data-testid</code>? Set <code>testIdAttribute: 'data-qa'</code> under
            <code>use</code> in the config.`,
          },
          {
            type: 'pw',
            title: 'Let Playwright pick for you',
            body: `Run <code>npx playwright codegen</code>, or use the locator picker in UI mode (<code>--ui</code>): hover any
              element and it shows the recommended locator.`,
          },
        ],
      },
      {
        id: 'lists',
        title: 'Lists of elements',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`List<WebElement> rows = driver.findElements(By.cssSelector("tbody tr"));`, `const rows = page.locator('tbody tr');`],
            [`int count = rows.size();`, `const count = await rows.count();`],
            [`WebElement first = rows.get(0);`, `const first = rows.first();`],
            [`WebElement third = rows.get(2);`, `const third = rows.nth(2);`],
            [`WebElement last = rows.get(rows.size() - 1);`, `const last = rows.last();`],
            [`
for (WebElement row : rows) {
  System.out.println(row.getText());
}`, `
for (const row of await rows.all()) {
  console.log(await row.innerText());
}`],
            [`List<String> texts = rows.stream().map(WebElement::getText).toList();`, `const texts = await rows.allInnerTexts();`],
          ],
        },
        callout: {
          type: 'warn',
          title: 'Strict mode',
          body: `If a locator matches more than one element, actions like <code>click()</code> throw a <em>strict mode
            violation</em> instead of silently using the first match the way <code>findElement</code> does. That's deliberate — it
            catches ambiguous selectors. Make the locator more specific, or choose explicitly with <code>.first()</code> or <code>.nth()</code>.`,
        },
      },
      {
        id: 'filtering',
        title: 'Chaining & filtering',
        body: `<p>Instead of long XPath expressions, compose locators: chain to search inside another locator, and use
          <code>filter()</code> to narrow by text or by a child element.</p>`,
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`
WebElement form = driver.findElement(By.id("checkout"));
form.findElement(By.name("zip")).sendKeys("10001");`, `await page.locator('#checkout').getByLabel('ZIP code').fill('10001');`],
            [`
driver.findElement(By.xpath(
    "//div[@class='product'][.//h3[text()='Laptop']]//button[text()='Add to cart']"
)).click();`, `
await page.locator('.product')
  .filter({ hasText: 'Laptop' })
  .getByRole('button', { name: 'Add to cart' })
  .click();`],
            [`
driver.findElement(By.xpath(
    "//li[.//span[@class='badge' and text()='New']]"));`, `
page.getByRole('listitem').filter({
  has: page.locator('.badge', { hasText: 'New' }),
});`],
            [`driver.findElements(By.xpath("//li[not(contains(., 'Sold out'))]"));`,
             `page.getByRole('listitem').filter({ hasNotText: 'Sold out' });`],
            [`
driver.findElement(RelativeLocator.with(By.tagName("input"))
    .below(By.id("email")));`, '', 'No layout locators — use getByLabel or filter() instead'],
          ],
        },
      },
    ],
  },

  window.TOPIC_GROUPS.core.shadowDom,

  /* ================================================================== */
  {
    id: 'actions',
    group: 'Core Concepts',
    title: 'Actions & Interactions',
    summary: 'Clicking, typing, dropdowns, mouse actions, uploads, downloads and JavaScript.',
    keywords: 'click sendkeys fill type select dropdown hover drag drop upload download javascript executor keys',
    intro: `Most actions are methods on a locator. Before acting, Playwright runs <strong>actionability checks</strong> — the
      element must be attached, visible, stable (not animating), enabled and able to receive clicks. That's why you won't need
      the scroll-into-view, wait-until-clickable and JavaScript-click workarounds common in Selenium suites.`,
    sections: [
      {
        id: 'basics',
        title: 'Click, type and keys',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`WebElement email = driver.findElement(By.id("email"));`, `const email = page.getByLabel('Email');`],
            [`driver.findElement(By.id("save")).click();`, `await page.getByRole('button', { name: 'Save' }).click();`],
            [`
email.clear();
email.sendKeys("tom@example.com");`, `await email.fill('tom@example.com'); // clears first`],
            [`email.sendKeys("tom");`, `await email.pressSequentially('tom'); // key by key, e.g. for autocomplete`],
            [`email.sendKeys(Keys.ENTER);`, `await email.press('Enter');`],
            [`email.sendKeys(Keys.chord(Keys.CONTROL, "a"));`, `await email.press('ControlOrMeta+A');`],
            [`email.clear();`, `await email.clear();`],
            [`if (!terms.isSelected()) terms.click();`, `await page.getByLabel('I accept the terms').check();`],
            [`if (newsletter.isSelected()) newsletter.click();`, `await page.getByLabel('Newsletter').uncheck();`],
            [`String text = heading.getText();`, `const text = await heading.innerText();`],
            [`String value = email.getAttribute("value");`, `const value = await email.inputValue();`],
            [`String href = link.getAttribute("href");`, `const href = await link.getAttribute('href');`],
          ],
        },
        callout: {
          type: 'tip',
          body: `<code>ControlOrMeta</code> presses Ctrl on Windows/Linux and Cmd on macOS — one test for every platform.`,
        },
      },
      {
        id: 'dropdowns',
        title: 'Dropdowns',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`Select country = new Select(driver.findElement(By.id("country")));`, `const country = page.getByLabel('Country');`],
            [`country.selectByVisibleText("India");`, `await country.selectOption({ label: 'India' });`],
            [`country.selectByValue("in");`, `await country.selectOption('in'); // matches value or label`],
            [`country.selectByIndex(2);`, `await country.selectOption({ index: 2 });`],
            [`
colors.selectByValue("red");
colors.selectByValue("blue");`, `await colors.selectOption(['red', 'blue']); // multi-select`],
            [`colors.deselectAll();`, `await colors.selectOption([]);`],
            [`String selected = country.getFirstSelectedOption().getText();`, `await expect(country).toHaveValue('in');`],
          ],
        },
        callout: {
          type: 'tip',
          body: `Like Selenium's <code>Select</code>, <code>selectOption</code> only works on native <code>&lt;select&gt;</code>
            elements. For custom dropdowns (React-Select, MUI…), click the trigger and then the option:
            <code>await page.getByRole('option', { name: 'India' }).click()</code>.`,
        },
      },
      {
        id: 'mouse',
        title: 'Hover, double-click, drag & drop',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`Actions actions = new Actions(driver);`, ``, 'No Actions builder — these are locator methods'],
            [`actions.moveToElement(menu).perform();`, `await menu.hover();`],
            [`actions.doubleClick(cell).perform();`, `await cell.dblclick();`],
            [`actions.contextClick(file).perform();`, `await file.click({ button: 'right' });`],
            [`actions.dragAndDrop(card, doneColumn).perform();`, `await card.dragTo(doneColumn);`],
            [`actions.keyDown(Keys.SHIFT).click(item).keyUp(Keys.SHIFT).perform();`, `await item.click({ modifiers: ['Shift'] });`],
            [`
((JavascriptExecutor) driver)
    .executeScript("arguments[0].scrollIntoView(true);", footer);`, `await footer.scrollIntoViewIfNeeded(); // rarely needed: actions auto-scroll`],
            [`actions.scrollByAmount(0, 500).perform();`, `await page.mouse.wheel(0, 500);`],
          ],
        },
        callout: {
          type: 'tip',
          body: `Need low-level control? <code>page.mouse</code> and <code>page.keyboard</code> offer <code>move</code>,
            <code>down</code>, <code>up</code>, <code>type</code> and more — the equivalent of building an <code>Actions</code> chain.`,
        },
      },
      {
        id: 'files',
        title: 'File upload & download',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`
driver.findElement(By.cssSelector("input[type='file']"))
    .sendKeys("/abs/path/report.pdf");`, `await page.getByLabel('Upload').setInputFiles('fixtures/report.pdf');`],
            [`// Custom upload button with a hidden input: un-hide it with JS first`, `
const chooserPromise = page.waitForEvent('filechooser');
await page.getByRole('button', { name: 'Choose file' }).click();
const chooser = await chooserPromise;
await chooser.setFiles('fixtures/report.pdf');`],
            [`
Map<String, Object> prefs = new HashMap<>();
prefs.put("download.default_directory", "/tmp/downloads");
options.setExperimentalOption("prefs", prefs);`, `const downloadPromise = page.waitForEvent('download');`],
            [`driver.findElement(By.linkText("Export CSV")).click();`, `await page.getByRole('link', { name: 'Export CSV' }).click();`],
            [`// ...then poll the folder until the file appears`, `
const download = await downloadPromise;
await download.saveAs('downloads/' + download.suggestedFilename());`],
          ],
        },
        callout: {
          type: 'diff',
          title: 'The "promise before action" pattern',
          body: `Start waiting for an event <em>before</em> triggering it, then <code>await</code> the promise afterwards. You'll
            use the same pattern for downloads, file choosers, popups and new tabs, and network responses.`,
        },
      },
      {
        id: 'javascript',
        title: 'Executing JavaScript',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`JavascriptExecutor js = (JavascriptExecutor) driver;`, ''],
            [`String title = (String) js.executeScript("return document.title;");`, `const title = await page.evaluate(() => document.title);`],
            [`js.executeScript("window.scrollTo(0, document.body.scrollHeight);");`, `await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));`],
            [`js.executeScript("arguments[0].style.outline = '3px solid red';", el);`, `await el.evaluate(node => (node as HTMLElement).style.outline = '3px solid red');`],
            [`Long n = (Long) js.executeScript("return arguments[0] * 2;", 21);`, `const n = await page.evaluate(x => x * 2, 21);`],
          ],
        },
        callout: {
          type: 'warn',
          body: `The function you pass to <code>evaluate</code> runs <em>in the browser</em>, not in Node. It can't see your test's
            variables — pass them in as the second argument, just like <code>arguments[]</code> in Selenium.`,
        },
      },
    ],
  },

  window.TOPIC_GROUPS.core.elementState,

  /* ================================================================== */
  {
    id: 'waits',
    group: 'Core Concepts',
    title: 'Waits → Auto-waiting',
    summary: 'Why most WebDriverWait code simply disappears, and what to use when you do need to wait.',
    keywords: 'webdriverwait implicit explicit fluentwait expectedconditions sleep timeout poll',
    intro: `If you take one thing from this guide: <strong>delete your waits</strong>. Playwright waits automatically before every
      action, and its <code>expect</code> assertions retry until they pass. Most <code>WebDriverWait</code> code has no
      Playwright equivalent because none is needed.`,
    sections: [
      {
        id: 'implicit-explicit',
        title: 'Implicit & explicit waits',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));`, `// Nothing — every action waits for its element`],
            [`WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));`, `// Nothing — timeouts live in playwright.config.ts`],
            [`wait.until(ExpectedConditions.elementToBeClickable(By.id("save"))).click();`, `await page.locator('#save').click();`],
            [`Thread.sleep(2000);`, `await page.waitForTimeout(2000); // debugging only — never in real tests`],
          ],
        },
      },
      {
        id: 'expected-conditions',
        title: 'ExpectedConditions → expect()',
        body: `<p>When you need to wait for a <em>state</em> rather than act, use a web-first assertion. It waits and verifies in one line.</p>`,
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("toast")));`, `await expect(page.locator('#toast')).toBeVisible();`],
            [`wait.until(ExpectedConditions.invisibilityOfElementLocated(By.className("spinner")));`, `await expect(page.locator('.spinner')).toBeHidden();`],
            [`wait.until(ExpectedConditions.textToBePresentInElementLocated(By.id("status"), "Done"));`, `await expect(page.locator('#status')).toContainText('Done');`],
            [`wait.until(ExpectedConditions.attributeToBe(By.id("save"), "aria-busy", "false"));`, `await expect(page.locator('#save')).toHaveAttribute('aria-busy', 'false');`],
            [`wait.until(ExpectedConditions.numberOfElementsToBe(By.cssSelector("li"), 5));`, `await expect(page.locator('li')).toHaveCount(5);`],
            [`wait.until(ExpectedConditions.elementToBeSelected(By.id("remember")));`, `await expect(page.getByLabel('Remember me')).toBeChecked();`],
            [`wait.until(ExpectedConditions.titleIs("Dashboard"));`, `await expect(page).toHaveTitle('Dashboard');`],
            [`wait.until(ExpectedConditions.urlContains("/dashboard"));`, `await expect(page).toHaveURL(/dashboard/);`],
          ],
        },
        callout: {
          type: 'warn',
          title: 'The #1 migration mistake',
          body: `<code>expect(await status.innerText()).toBe('Done')</code> reads the text <em>once</em> and fails if it isn't
            there yet. <code>await expect(status).toHaveText('Done')</code> keeps retrying. Rule of thumb:
            <strong>pass the locator to expect, not its value.</strong>`,
        },
      },
      {
        id: 'non-element',
        title: 'Waiting for things that aren\'t elements',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`
// No built-in network API: you wait for a UI side effect instead
driver.findElement(By.id("place-order")).click();`, `
const responsePromise = page.waitForResponse(
  r => r.url().includes('/api/orders') && r.status() === 201
);
await page.getByRole('button', { name: 'Place order' }).click();`],
            [`wait.until(ExpectedConditions.invisibilityOfElementLocated(By.className("loading")));`, `const response = await responsePromise;`],
            [`
wait.until(d -> ((JavascriptExecutor) d)
    .executeScript("return document.readyState").equals("complete"));`, `await page.waitForLoadState('load');`],
            [`wait.until(ExpectedConditions.stalenessOf(oldRow));`, `await page.locator('.row.old').waitFor({ state: 'detached' });`],
            [`
new FluentWait<>(driver)
    .withTimeout(Duration.ofSeconds(30))
    .pollingEvery(Duration.ofMillis(500))
    .ignoring(NoSuchElementException.class)
    .until(d -> d.findElements(By.cssSelector(".row")).size() > 10);`, `
await expect.poll(() => page.locator('.row').count(), {
  timeout: 30_000,
  intervals: [500],
}).toBeGreaterThan(10);`],
            [`// Retrying a group of steps: a hand-written loop with try/catch`, `
await expect(async () => {
  await page.getByRole('button', { name: 'Refresh' }).click();
  await expect(page.getByText('Report ready')).toBeVisible({ timeout: 1_000 });
}).toPass({ timeout: 30_000 });`],
          ],
        },
      },
      {
        id: 'timeouts',
        title: 'Timeouts',
        compare: {
          sel: { file: 'Selenium + TestNG' },
          pw: { file: 'playwright.config.ts' },
          segs: [
            [`@Test(timeOut = 30000) // per test, from TestNG`, `
export default defineConfig({
  timeout: 30_000,             // per test`],
            [`// Assertions check once — there is no assertion timeout`, `  expect: { timeout: 5_000 }, // retry window for each expect()`],
            [`driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));`, `
  use: {
    actionTimeout: 10_000,     // each click / fill / ...`],
            [`driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(30));`, `
    navigationTimeout: 30_000, // each goto / waitForURL
  },
});`],
          ],
        },
        callout: {
          type: 'tip',
          body: `Defaults: 30 s per test and 5 s per assertion. Actions and navigations have no separate limit unless you set one,
            so the test timeout bounds them. Override per call: <code>await expect(loc).toBeVisible({ timeout: 15_000 })</code>.`,
        },
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'assertions',
    group: 'Core Concepts',
    title: 'Assertions',
    summary: 'TestNG Assert vs. auto-retrying expect(), soft assertions and visual comparison.',
    keywords: 'assert assertequals asserttrue expect tohavetext tobevisible soft screenshot visual',
    intro: `TestNG's <code>Assert</code> compares values you've already fetched. Playwright's <code>expect</code> works directly on
      locators and pages and <strong>retries</strong> until the condition holds — the wait and the check in one line.`,
    sections: [
      {
        id: 'page',
        title: 'Page assertions',
        compare: {
          sel: { file: 'TestNG' },
          pw: {},
          segs: [
            [`Assert.assertEquals(driver.getTitle(), "Dashboard");`, `await expect(page).toHaveTitle('Dashboard');`],
            [`Assert.assertTrue(driver.getTitle().contains("Dash"));`, `await expect(page).toHaveTitle(/Dash/);`],
            [`Assert.assertEquals(driver.getCurrentUrl(), baseUrl + "/dashboard");`, `await expect(page).toHaveURL('/dashboard'); // baseURL-aware`],
          ],
        },
      },
      {
        id: 'element',
        title: 'Element assertions',
        compare: {
          sel: { file: 'TestNG' },
          pw: {},
          segs: [
            [`Assert.assertTrue(banner.isDisplayed());`, `await expect(banner).toBeVisible();`],
            [`Assert.assertTrue(driver.findElements(By.id("error")).isEmpty());`, `await expect(page.locator('#error')).toHaveCount(0);`],
            [`Assert.assertFalse(spinner.isDisplayed());`, `await expect(spinner).toBeHidden();`],
            [`Assert.assertEquals(heading.getText(), "Welcome, tom");`, `await expect(heading).toHaveText('Welcome, tom');`],
            [`Assert.assertTrue(heading.getText().contains("Welcome"));`, `await expect(heading).toContainText('Welcome');`],
            [`Assert.assertEquals(email.getAttribute("value"), "tom@example.com");`, `await expect(email).toHaveValue('tom@example.com');`],
            [`Assert.assertEquals(link.getAttribute("href"), "/terms");`, `await expect(link).toHaveAttribute('href', '/terms');`],
            [`Assert.assertTrue(tab.getAttribute("class").contains("active"));`, `await expect(tab).toHaveClass(/active/);`],
            [`Assert.assertTrue(save.isEnabled());`, `await expect(save).toBeEnabled();`],
            [`Assert.assertTrue(terms.isSelected());`, `await expect(terms).toBeChecked();`],
            [`Assert.assertEquals(driver.findElements(By.cssSelector(".cart li")).size(), 3);`, `await expect(page.locator('.cart li')).toHaveCount(3);`],
            [`
List<String> names = fruits.stream().map(WebElement::getText).toList();
Assert.assertEquals(names, List.of("Apple", "Banana"));`, `await expect(page.locator('.fruit')).toHaveText(['Apple', 'Banana']);`],
            [`Assert.assertEquals(error.getCssValue("color"), "rgba(255, 0, 0, 1)");`, `await expect(error).toHaveCSS('color', 'rgb(255, 0, 0)');`],
          ],
        },
        callout: {
          type: 'tip',
          body: `Negate any assertion with <code>.not</code>: <code>await expect(page.getByText('Error')).not.toBeVisible()</code>.`,
        },
      },
      {
        id: 'soft',
        title: 'Soft assertions, messages & plain values',
        compare: {
          sel: { file: 'TestNG' },
          pw: {},
          segs: [
            [`SoftAssert soft = new SoftAssert();`, ''],
            [`soft.assertEquals(title.getText(), "Cart");`, `await expect.soft(title).toHaveText('Cart');`],
            [`soft.assertTrue(checkout.isEnabled());`, `await expect.soft(checkout).toBeEnabled();`],
            [`soft.assertAll();`, `// failures are reported when the test ends`],
            [`Assert.assertEquals(badge.getText(), "3", "Cart badge count");`, `await expect(badge, 'Cart badge count').toHaveText('3');`],
            [`Assert.assertEquals(total, 42);`, `expect(total).toBe(42); // plain value: no retry, no await`],
          ],
        },
        callout: {
          type: 'diff',
          title: 'Retrying vs. non-retrying',
          body: `Assertions on a <strong>locator or page</strong> (<code>toBeVisible</code>, <code>toHaveText</code>, …) are async,
            retry, and must be awaited. Assertions on <strong>plain values</strong> (<code>toBe</code>, <code>toEqual</code>,
            <code>toContain</code>, …) check once, like TestNG.`,
        },
      },
      {
        id: 'visual',
        title: 'Visual comparison',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`// Needs a third-party tool (Applitools, Percy, AShot + image diff)`, `await expect(page).toHaveScreenshot('dashboard.png');`],
            ['', `
await expect(page.locator('.chart')).toHaveScreenshot('chart.png', {
  maxDiffPixelRatio: 0.01,
});`],
          ],
        },
        callout: {
          type: 'pw',
          body: `The first run saves a baseline image; later runs compare against it. Update baselines with
            <code>npx playwright test --update-snapshots</code>. Generate baselines on the same OS as CI, since font rendering differs.`,
        },
      },
    ],
  },

  window.TOPIC_GROUPS.core.tables,

  /* ================================================================== */
  {
    id: 'frames-tabs-alerts',
    group: 'Core Concepts',
    title: 'Frames, Tabs & Alerts',
    summary: 'No more switchTo(): frame locators, Page objects per tab, and dialog listeners.',
    keywords: 'iframe frame switchto window handle tab popup alert confirm prompt dialog',
    intro: `Selenium makes you <em>switch</em> the driver's focus into frames, windows and alerts — and remember to switch back.
      Playwright has no switching: frames are reached through locators, each tab is its own <code>Page</code> object, and
      dialogs are handled with event listeners.`,
    sections: [
      {
        id: 'frames',
        title: 'iframes',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`driver.switchTo().frame("payment");`, `const payment = page.frameLocator('#payment');`],
            [`driver.findElement(By.id("card-name")).sendKeys("Tom Smith");`, `await payment.getByLabel('Name on card').fill('Tom Smith');`],
            [`driver.switchTo().defaultContent();`, `// No switching back — 'page' still targets the main document`],
            [`driver.findElement(By.id("pay")).click();`, `await page.getByRole('button', { name: 'Pay' }).click();`],
            [`driver.switchTo().frame("outer").switchTo().frame("inner");`, `page.frameLocator('#outer').frameLocator('#inner')`],
          ],
        },
        callout: {
          type: 'tip',
          body: `Because nothing switches, you can use the main page and a frame on consecutive lines. Frame locators also
            auto-wait for the iframe to load.`,
        },
      },
      {
        id: 'tabs',
        title: 'New tabs & windows',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`String original = driver.getWindowHandle();`, `const popupPromise = page.context().waitForEvent('page');`],
            [`driver.findElement(By.linkText("Open help")).click();`, `await page.getByRole('link', { name: 'Open help' }).click();`],
            [`
wait.until(ExpectedConditions.numberOfWindowsToBe(2));
for (String handle : driver.getWindowHandles()) {
  if (!handle.equals(original)) {
    driver.switchTo().window(handle);
  }
}`, `const helpPage = await popupPromise;`],
            [`Assert.assertEquals(driver.getTitle(), "Help Center");`, `await expect(helpPage).toHaveTitle('Help Center');`],
            [`driver.close();`, `await helpPage.close();`],
            [`driver.switchTo().window(original);`, `// 'page' is still the original tab — nothing to switch`],
            [`driver.switchTo().newWindow(WindowType.TAB);`, `const newTab = await page.context().newPage();`],
          ],
        },
      },
      {
        id: 'alerts',
        title: 'Alerts, confirms & prompts',
        body: `<p>Playwright handles dialogs with a listener that you register <em>before</em> the action that opens the dialog.</p>`,
        compare: {
          sel: {},
          pw: {},
          segs: [
            ['', `
page.once('dialog', async dialog => {
  console.log(dialog.message());
  await dialog.accept();     // or dialog.dismiss()
});`, 'Selenium handles the alert after it appears ↓'],
            [`driver.findElement(By.id("delete")).click();`, `await page.getByRole('button', { name: 'Delete' }).click();`],
            [`
Alert alert = wait.until(ExpectedConditions.alertIsPresent());
System.out.println(alert.getText());
alert.accept();     // or alert.dismiss()`, '', 'Already handled by the listener ↑'],
            [`
alert.sendKeys("Tom"); // prompt()
alert.accept();`, `page.once('dialog', dialog => dialog.accept('Tom'));`],
          ],
        },
        callout: {
          type: 'warn',
          body: `If no listener is registered, Playwright <strong>auto-dismisses</strong> every dialog, so a <code>confirm()</code>
            returns <code>false</code>. If a delete button seems to "do nothing" in your test, this is usually why.`,
        },
      },
    ],
  },

  /* ================================================================== */
  /* Larger groups live in their own files (loaded before this one in index.html). */
  window.TOPIC_GROUPS.core.cookies,
  window.TOPIC_GROUPS.core.emulation,

  ...window.TOPIC_GROUPS.testDesign,       // content/test-design.js
  ...window.TOPIC_GROUPS.beyondSelenium,   // content/beyond-selenium.js
  ...window.TOPIC_GROUPS.runningAtScale,   // content/running-at-scale.js

  /* ================================================================== */
  {
    id: 'cheat-sheet',
    group: 'Reference',
    title: 'Cheat Sheet',
    summary: 'Every common mapping on one page. Bookmark it.',
    keywords: 'reference quick table summary',
    intro: `Every common mapping on one page. Bookmark it.`,
    sections: [
      {
        id: 'all',
        title: 'Quick reference',
        table: [
          'Setup & lifecycle',
          ['Start browser', 'WebDriver driver = new ChromeDriver();', "test('…', async ({ page }) => { … });"],
          ['Quit browser', 'driver.quit();', '// automatic'],
          ['Headless', 'options.addArguments("--headless=new");', 'use: { headless: true } // default'],
          ['Window size', 'driver.manage().window().setSize(new Dimension(1280, 720));', 'use: { viewport: { width: 1280, height: 720 } }'],
          'Navigation',
          ['Open URL', 'driver.get(url);', 'await page.goto(url);'],
          ['Back', 'driver.navigate().back();', 'await page.goBack();'],
          ['Reload', 'driver.navigate().refresh();', 'await page.reload();'],
          ['Title', 'driver.getTitle();', 'await page.title();'],
          ['Current URL', 'driver.getCurrentUrl();', 'page.url();'],
          'Locators',
          ['By id', 'By.id("email")', "page.locator('#email')"],
          ['By CSS', 'By.cssSelector(".btn")', "page.locator('.btn')"],
          ['By XPath', 'By.xpath("//h1")', "page.locator('//h1')"],
          ['By link text', 'By.linkText("Help")', "page.getByRole('link', { name: 'Help', exact: true })"],
          ['Button by text', 'By.xpath("//button[.=\'Save\']")', "page.getByRole('button', { name: 'Save' })"],
          ['Input by label', 'By.xpath("//label[.=\'Email\']/following::input[1]")', "page.getByLabel('Email')"],
          ['Test id', 'By.cssSelector("[data-testid=\'cart\']")', "page.getByTestId('cart')"],
          ['All matches', 'driver.findElements(By.cssSelector("li"))', "page.locator('li') // one locator, many matches"],
          ['Nth match', 'elements.get(2)', 'locator.nth(2)'],
          ['Count', 'elements.size()', 'await locator.count()'],
          'Actions',
          ['Click', 'el.click();', 'await loc.click();'],
          ['Type text', 'el.clear(); el.sendKeys("x");', "await loc.fill('x');"],
          ['Press key', 'el.sendKeys(Keys.ENTER);', "await loc.press('Enter');"],
          ['Checkbox', 'if (!el.isSelected()) el.click();', 'await loc.check();'],
          ['Dropdown', 'new Select(el).selectByVisibleText("A");', "await loc.selectOption({ label: 'A' });"],
          ['Hover', 'new Actions(driver).moveToElement(el).perform();', 'await loc.hover();'],
          ['Drag & drop', 'new Actions(driver).dragAndDrop(a, b).perform();', 'await a.dragTo(b);'],
          ['Upload', 'input.sendKeys("/path/file.pdf");', "await loc.setInputFiles('file.pdf');"],
          ['Run JavaScript', 'js.executeScript("return 1 + 1;");', 'await page.evaluate(() => 1 + 1);'],
          ['Screenshot', '((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);', "await page.screenshot({ path: 'shot.png' });"],
          'Reading values',
          ['Text', 'el.getText()', 'await loc.innerText()'],
          ['Attribute', 'el.getAttribute("href")', "await loc.getAttribute('href')"],
          ['Input value', 'el.getAttribute("value")', 'await loc.inputValue()'],
          ['Is visible', 'el.isDisplayed()', 'await loc.isVisible() // no waiting'],
          'Waits & assertions',
          ['Wait for visible', 'wait.until(visibilityOfElementLocated(by));', 'await expect(loc).toBeVisible();'],
          ['Wait for hidden', 'wait.until(invisibilityOfElementLocated(by));', 'await expect(loc).toBeHidden();'],
          ['Wait for URL', 'wait.until(urlContains("/home"));', "await page.waitForURL('**/home');"],
          ['Assert text', 'Assert.assertEquals(el.getText(), "Hi");', "await expect(loc).toHaveText('Hi');"],
          ['Assert count', 'Assert.assertEquals(list.size(), 3);', 'await expect(loc).toHaveCount(3);'],
          ['Assert title', 'Assert.assertEquals(driver.getTitle(), "Home");', "await expect(page).toHaveTitle('Home');"],
          ['Sleep', 'Thread.sleep(1000);', 'await page.waitForTimeout(1000); // avoid'],
          'Frames, tabs & dialogs',
          ['Enter iframe', 'driver.switchTo().frame("f");', "page.frameLocator('#f')"],
          ['Leave iframe', 'driver.switchTo().defaultContent();', '// not needed'],
          ['New tab', 'driver.switchTo().newWindow(WindowType.TAB);', 'await page.context().newPage();'],
          ['Switch tab', 'driver.switchTo().window(handle);', '// just use the other Page object'],
          ['Accept alert', 'driver.switchTo().alert().accept();', "page.once('dialog', d => d.accept());"],
          'Shadow DOM, cookies & browser state',
          ['Shadow DOM', 'host.getShadowRoot().findElement(By.cssSelector("b"));', "page.locator('my-host b') // pierces automatically"],
          ['Element exists?', '!driver.findElements(by).isEmpty()', '(await loc.count()) > 0'],
          ['Add cookie', 'driver.manage().addCookie(new Cookie("k", "v"));', "await page.context().addCookies([{ name: 'k', value: 'v', url }]);"],
          ['Delete cookies', 'driver.manage().deleteAllCookies();', 'await page.context().clearCookies();'],
          ['localStorage', 'js.executeScript("localStorage.setItem(\'k\', \'v\');");', "await page.evaluate(() => localStorage.setItem('k', 'v'));"],
          ['Resize window', 'driver.manage().window().setSize(new Dimension(375, 812));', 'await page.setViewportSize({ width: 375, height: 812 });'],
          ['Geolocation', '// CDP Emulation.setGeolocationOverride', 'test.use({ geolocation: { latitude: 51.5, longitude: -0.12 } });'],
          ['Dark mode', '// CDP Emulation.setEmulatedMedia', "await page.emulateMedia({ colorScheme: 'dark' });"],
          'Test design',
          ['Page object field', '@FindBy(id = "q") private WebElement q;', "this.q = page.getByLabel('Search');"],
          ['Base test class', 'class LoginTest extends BaseTest', "const test = base.extend<Fixtures>({ … });"],
          ['Data provider', '@Test(dataProvider = "users")', 'for (const u of users) { test(u.name, async () => { … }); }'],
          ['Group / tag', '@Test(groups = "smoke")', "test('…', { tag: '@smoke' }, async () => { … });"],
          ['Skip', '@Test(enabled = false)', "test.skip('…', async () => { … });"],
          ['Known bug', '@Test(enabled = false) // + comment', "test.fixme('…', async () => { … });"],
          ['Longer timeout', '@Test(timeOut = 120000)', 'test.slow();'],
          ['Run by group', 'mvn test -Dgroups=smoke', 'npx playwright test --grep @smoke'],
          ['Suite setup', '@BeforeSuite', "{ name: 'setup', testMatch: '**/global.setup.ts' } // + dependencies"],
          ['Fake data', 'new Faker().name().fullName()', 'faker.person.fullName()'],
          ['Custom assertion', 'static void assertPrice(…)', 'const expect = baseExpect.extend({ async toHavePrice(…) { … } });'],
          'Network, API & auth',
          ['Mock a response', '// CDP NetworkInterceptor (Chromium only)', "await page.route('**/api/x', r => r.fulfill({ json: {} }));"],
          ['Block requests', '// CDP Network.setBlockedURLs', "await page.route('**/*.png', r => r.abort());"],
          ['API GET', 'given().get("/users").then().statusCode(200);', "await expect(await request.get('/users')).toBeOK();"],
          ['Reuse login', '// re-add saved cookies before each test', "use: { storageState: 'playwright/.auth/user.json' }"],
          'Running at scale',
          ['Parallel', '<suite parallel="methods" thread-count="4">', 'fullyParallel: true, workers: 4'],
          ['Retry', '@Test(retryAnalyzer = Retry.class)', 'retries: 2'],
          ['Remote / scale out', 'new RemoteWebDriver(gridUrl, options);', 'npx playwright test --shard=1/4'],
          ['Report step', '@Step("Log in")', "await test.step('Log in', async () => { … });"],
          ['Pause to debug', '// IDE breakpoint', 'await page.pause();'],
        ],
      },
    ],
  },

  ...window.TOPIC_GROUPS.migration,        // content/migration.js
];
