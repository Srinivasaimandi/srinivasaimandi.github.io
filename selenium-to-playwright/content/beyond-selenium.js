/* Beyond Selenium topics: Network Mocking, API Testing, Authentication Reuse, Trace Viewer & Debugging.
 * Same format as content/topics.js (see the comment at the top of that file). */
window.TOPIC_GROUPS = window.TOPIC_GROUPS || {};
window.TOPIC_GROUPS.beyondSelenium = [

  /* ================================================================== */
  {
    id: 'network-mocking',
    group: 'Beyond Selenium',
    title: 'Network Mocking',
    summary: 'Intercept, mock, modify and block requests in every browser with page.route().',
    keywords: 'route mock stub intercept fulfill abort har network cdp bidi',
    intro: `Selenium 4 can intercept traffic through Chrome DevTools Protocol, but it's Chromium-only and tied to CDP versions.
      Playwright's <code>page.route()</code> works the same in Chromium, Firefox and WebKit, and is the easiest way to make
      tests independent of slow or flaky backends.`,
    sections: [
      {
        id: 'mock',
        title: 'Mocking an API response',
        compare: {
          sel: { file: 'Selenium 4 (Chromium only)' },
          pw: { file: 'tests/shop.spec.ts' },
          segs: [
            [`
try (NetworkInterceptor interceptor = new NetworkInterceptor(
    driver,
    Route.matching(req -> req.getUri().contains("/api/products"))
        .to(() -> req -> new HttpResponse()
            .setStatus(200)
            .addHeader("Content-Type", "application/json")
            .setContent(Contents.asJson(List.of(Map.of("name", "Laptop"))))))) {`, `
await page.route('**/api/products', route =>
  route.fulfill({ json: [{ name: 'Laptop' }] })
);`],
            [`  driver.get("https://example.com/shop");`, `await page.goto('/shop');`],
            [`
  Assert.assertTrue(driver.findElement(By.xpath("//*[text()='Laptop']")).isDisplayed());
}`, `await expect(page.getByText('Laptop')).toBeVisible();`],
          ],
        },
        callout: {
          type: 'tip',
          body: `Register routes <em>before</em> the navigation or click that triggers the request. Routes added with
            <code>page.route</code> apply to that page; <code>context.route</code> covers every page in the context, including popups.`,
        },
      },
      {
        id: 'modify',
        title: 'Errors, blocking and modifying responses',
        compare: {
          sel: { file: 'Selenium 4 (Chromium only)' },
          pw: { file: 'Playwright' },
          segs: [
            [`// Return a 500: same NetworkInterceptor with .setStatus(500)`, `
await page.route('**/api/orders', route =>
  route.fulfill({ status: 500, body: 'Server error' })
);`],
            [`
DevTools devTools = ((HasDevTools) driver).getDevTools();
devTools.createSession();
devTools.send(Network.setBlockedURLs(List.of("*.png", "*.jpg")));`, `
await page.route('**/*.{png,jpg,jpeg}', route => route.abort());`],
            ['', `
await page.route('**/api/cart', async route => {
  const response = await route.fetch();       // call the real server
  const json = await response.json();
  json.items.push({ name: 'Free gift', price: 0 });
  await route.fulfill({ response, json });    // return the edited body
});`],
            ['', `
await page.route('**/api/**', route =>
  route.continue({ headers: { ...route.request().headers(), 'x-test-run': '1' } })
);`],
          ],
        },
        callout: {
          type: 'pw',
          title: 'Playwright-only: replay from a HAR file',
          body: `Record real traffic once with <code>await page.routeFromHAR('hars/api.har', { url: '**/api/**', update: true })</code>,
            then drop <code>update: true</code> to replay those responses in every run — a full offline backend for UI tests.`,
        },
      },
      {
        id: 'observe',
        title: 'Listening to traffic',
        compare: {
          sel: { file: 'Selenium' },
          pw: { file: 'Playwright' },
          segs: [
            [`// CDP / BiDi listeners: browser-specific and still evolving`, `
page.on('request', req => console.log('>>', req.method(), req.url()));
page.on('response', res => console.log('<<', res.status(), res.url()));`],
            [`// Assert an API call was made: usually not possible without a proxy`, `
const requestPromise = page.waitForRequest('**/api/analytics');
await page.getByRole('button', { name: 'Buy' }).click();
const request = await requestPromise;
expect(request.postDataJSON()).toMatchObject({ event: 'purchase' });`],
          ],
        },
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'api-testing',
    group: 'Beyond Selenium',
    title: 'API Testing',
    summary: 'REST Assured vs. the built-in request fixture, and mixing API calls with UI tests.',
    keywords: 'rest assured request api http get post json apirequestcontext',
    intro: `Selenium has no HTTP client, so Java teams usually add REST Assured. Playwright ships one: the <code>request</code>
      fixture. It uses the same <code>baseURL</code>, runner, reports and traces as your UI tests.`,
    sections: [
      {
        id: 'requests',
        title: 'Sending requests',
        compare: {
          sel: { file: 'ProductApiTest.java (REST Assured)' },
          pw: { file: 'tests/api/products.spec.ts' },
          segs: [
            [`
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;`, `import { test, expect } from '@playwright/test';`],
            [`
@Test
public void createsProduct() {`, `test('creates product', async ({ request }) => {`],
            [`
  Response res = given()
      .baseUri("https://api.example.com")
      .contentType(ContentType.JSON)
      .body(Map.of("name", "Laptop", "price", 999))
  .when()
      .post("/products");`, `
  const res = await request.post('/products', {
    data: { name: 'Laptop', price: 999 }, // sent as JSON
  });`],
            [`  res.then().statusCode(201);`, `  expect(res.status()).toBe(201);`],
            [`  String id = res.path("id");`, `  const { id } = await res.json();`],
            [`
  given().baseUri("https://api.example.com")
      .get("/products/" + id)
      .then().body("name", equalTo("Laptop"));
}`, `
  const product = await request.get('/products/' + id);
  await expect(product).toBeOK();
  expect(await product.json()).toMatchObject({ name: 'Laptop' });
});`],
          ],
        },
        callout: {
          type: 'tip',
          body: `<code>data</code> sends JSON, <code>form</code> sends URL-encoded fields, and <code>multipart</code> sends files.
            <code>await expect(response).toBeOK()</code> passes for any 2xx status.`,
        },
      },
      {
        id: 'config',
        title: 'Base URL and headers',
        compare: {
          sel: { file: 'ApiConfig.java' },
          pw: { file: 'playwright.config.ts' },
          segs: [
            [`
RestAssured.requestSpecification = new RequestSpecBuilder()`, `
export default defineConfig({
  use: {`],
            [`    .setBaseUri("https://api.example.com")`, `    baseURL: 'https://api.example.com',`],
            [`
    .addHeader("Authorization", "Bearer " + System.getenv("API_TOKEN"))
    .build();`, `
    extraHTTPHeaders: { Authorization: 'Bearer ' + process.env.API_TOKEN },
  },
});`],
          ],
        },
      },
      {
        id: 'hybrid',
        title: 'Mixing API and UI in one test',
        body: `<p>Create test data through the API (fast and reliable), then check it in the UI. In Java this means two separate
          libraries; in Playwright both fixtures live in the same test.</p>`,
        compare: {
          sel: { file: 'ProductPageTest.java' },
          pw: { file: 'tests/product.spec.ts' },
          segs: [
            [`
@Test
public void showsNewProduct() {`, `test('shows a new product', async ({ page, request }) => {`],
            [`
  String id = given().contentType(ContentType.JSON)
      .body(Map.of("name", "Laptop"))
      .post("/api/products").path("id");`, `
  const res = await request.post('/api/products', { data: { name: 'Laptop' } });
  const { id } = await res.json();`],
            [`  driver.get(baseUrl + "/products/" + id);`, `  await page.goto('/products/' + id);`],
            [`
  Assert.assertEquals(driver.findElement(By.tagName("h1")).getText(), "Laptop");
}`, `
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Laptop');
});`],
          ],
        },
        callout: {
          type: 'pw',
          title: 'Shared cookies',
          body: `<code>page.request</code> (and <code>context.request</code>) share cookies with the browser. Log in through the UI
            and then call authenticated APIs directly — or the reverse.`,
        },
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'auth-reuse',
    group: 'Beyond Selenium',
    title: 'Authentication Reuse',
    summary: 'Log in once, save the session to a file, and start every test already signed in.',
    keywords: 'login storagestate session cookies setup project dependencies roles',
    intro: `Logging in through the UI before every test is slow and adds flakiness. Playwright logs in <strong>once</strong> in a
      setup project, saves the browser's cookies and local storage to a file (the <em>storage state</em>), and loads that file
      into every test's context.`,
    sections: [
      {
        id: 'login-once',
        title: 'Log in once',
        compare: {
          sel: { file: 'tests/BaseTest.java' },
          pw: { file: 'tests/auth.setup.ts' },
          segs: [
            [`// Typical: log in through the UI before EVERY test`, `
import { test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';`],
            [`
@BeforeMethod
public void login() {`, `setup('authenticate', async ({ page }) => {`],
            [`  driver.get(baseUrl + "/login");`, `  await page.goto('/login');`],
            [`  driver.findElement(By.id("username")).sendKeys(config.user());`, `  await page.getByLabel('Username').fill(process.env.APP_USER!);`],
            [`  driver.findElement(By.id("password")).sendKeys(config.password());`, `  await page.getByLabel('Password').fill(process.env.APP_PASSWORD!);`],
            [`  driver.findElement(By.id("login")).click();`, `  await page.getByRole('button', { name: 'Sign in' }).click();`],
            [`
  new WebDriverWait(driver, Duration.ofSeconds(10))
      .until(ExpectedConditions.urlContains("/dashboard"));`, `  await page.waitForURL('**/dashboard');`],
            [`}`, `
  await page.context().storageState({ path: authFile }); // save the session
});`],
          ],
        },
      },
      {
        id: 'wire-up',
        title: 'Start every test signed in',
        body: `<p>The closest Selenium equivalent is saving cookies after one login and adding them back in each test — which
          misses tokens kept in <code>localStorage</code>. Playwright's storage state includes both.</p>`,
        compare: {
          sel: { file: 'tests/BaseTest.java' },
          pw: { file: 'playwright.config.ts' },
          segs: [
            ['', `
export default defineConfig({
  projects: [
    { name: 'setup', testMatch: '**/*.setup.ts' },`],
            [`
@BeforeMethod
public void reuseSession() {
  Set<Cookie> cookies = CookieStore.load(); // saved after one UI login
  driver.get(baseUrl);                       // must be on the domain first
  cookies.forEach(c -> driver.manage().addCookie(c));
  driver.navigate().refresh();
}`, `
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'], // runs auth.setup.ts first
    },
  ],
});`],
          ],
        },
        callout: [
          {
            type: 'warn',
            body: `The storage state file contains live session cookies. Add <code>playwright/.auth</code> to
              <code>.gitignore</code>.`,
          },
          {
            type: 'tip',
            title: 'Several roles, or none',
            body: `Save one file per role (<code>admin.json</code>, <code>user.json</code>) and pick per file with
              <code>test.use({ storageState: 'playwright/.auth/admin.json' })</code>. For a signed-out test, use
              <code>test.use({ storageState: { cookies: [], origins: [] } })</code>.`,
          },
        ],
      },
      {
        id: 'api-login',
        title: 'Even faster: log in through the API',
        compare: {
          sel: { file: 'Selenium' },
          pw: { file: 'tests/auth.setup.ts' },
          segs: [
            ['', `
setup('authenticate via API', async ({ request }) => {
  await request.post('/api/login', {
    form: { username: process.env.APP_USER!, password: process.env.APP_PASSWORD! },
  });
  await request.storageState({ path: authFile });
});`, 'Needs an HTTP client plus manual cookie copying'],
          ],
        },
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'debugging',
    group: 'Beyond Selenium',
    title: 'Trace Viewer & Debugging',
    summary: 'Inspector, UI mode and the trace viewer: time-travel debugging for every action.',
    keywords: 'debug trace viewer inspector ui mode pause screenshot video logs step',
    intro: `Debugging Selenium usually means IDE breakpoints, screenshots from a listener and log files. Playwright adds the
      <strong>trace viewer</strong>: a recording of every action with a DOM snapshot before and after, plus network calls,
      console output and the line of test code — so you can investigate a CI failure as if you had been watching.`,
    sections: [
      {
        id: 'live',
        title: 'Debugging live',
        compare: {
          sel: { file: 'IDE', lang: 'shell' },
          pw: { file: 'terminal', lang: 'shell' },
          segs: [
            [`# Set a breakpoint, then "Debug test" in the IDE`, `npx playwright test --debug                  # Inspector: step through each action`],
            ['', `npx playwright test login.spec.ts:12 --debug  # start at a given line`],
            ['', `npx playwright test --ui                     # timeline, DOM snapshots, watch mode`],
            [`# Verbose WebDriver logs: -Dwebdriver.chrome.verboseLogging=true`, `DEBUG=pw:api npx playwright test           # log every Playwright call`],
          ],
        },
        callout: {
          type: 'tip',
          body: `Add <code>await page.pause();</code> anywhere in a test to stop there and open the Inspector — the equivalent of a
            breakpoint, with a live browser you can explore and a locator picker.`,
        },
      },
      {
        id: 'trace',
        title: 'Traces, screenshots and videos on failure',
        compare: {
          sel: { file: 'listeners/ScreenshotListener.java' },
          pw: { file: 'playwright.config.ts' },
          segs: [
            [`
public class ScreenshotListener implements ITestListener {
  @Override
  public void onTestFailure(ITestResult result) {`, `
export default defineConfig({
  use: {`],
            [`
    File shot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
    // copy it to the report folder, attach it to the report...`, `    screenshot: 'only-on-failure',`],
            [`    // video: needs a third-party recorder or Grid video`, `    video: 'retain-on-failure',`],
            ['', `    trace: 'on-first-retry', // or 'retain-on-failure'`],
            [`
  }
}`, `
  },
});`],
          ],
        },
        callout: {
          type: 'pw',
          title: 'Opening a trace',
          body: `Click the trace in the HTML report, or run <code>npx playwright show-trace test-results/…/trace.zip</code>. You
            can also drop the zip onto <code>trace.playwright.dev</code>, which opens it locally in your browser.`,
        },
      },
      {
        id: 'on-demand',
        title: 'Screenshots, logs and steps on demand',
        compare: {
          sel: { file: 'Selenium' },
          pw: { file: 'Playwright' },
          segs: [
            [`File shot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);`, `await page.screenshot({ path: 'checkout.png', fullPage: true });`],
            [`File el = cart.getScreenshotAs(OutputType.FILE);`, `await cart.screenshot({ path: 'cart.png' });`],
            [`LogEntries logs = driver.manage().logs().get(LogType.BROWSER);`, `page.on('console', msg => console.log(msg.type(), msg.text()));`],
            ['', `page.on('pageerror', err => console.log('Uncaught:', err.message));`],
            [`
@Step("Add laptop to cart") // Allure
public void addToCart() { ... }`, `
await test.step('Add laptop to cart', async () => {
  await page.getByRole('button', { name: 'Add to cart' }).click();
});`],
          ],
        },
        callout: {
          type: 'tip',
          body: `<code>test.step</code> groups actions under a readable name in the HTML report, UI mode and traces — no extra
            reporting library needed.`,
        },
      },
    ],
  },
];
