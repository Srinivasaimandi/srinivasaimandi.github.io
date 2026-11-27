/* Test Design topics: Page Object Model, Fixtures, Data-driven Tests.
 * Same format as content/topics.js (see the comment at the top of that file). */
window.TOPIC_GROUPS = window.TOPIC_GROUPS || {};
window.TOPIC_GROUPS.testDesign = [

  /* ================================================================== */
  {
    id: 'page-objects',
    group: 'Test Design',
    title: 'Page Object Model',
    summary: 'Page classes carry over almost unchanged — minus PageFactory, plus Locators and async.',
    keywords: 'pom page object pagefactory findby component',
    intro: `Good news: the Page Object Model carries straight over. Three things change — fields are <code>Locator</code>s
      instead of <code>By</code>s or <code>WebElement</code>s, methods are <code>async</code>, and you no longer need
      <code>PageFactory</code>, because locators are already lazy.`,
    sections: [
      {
        id: 'page-class',
        title: 'A page class',
        compare: {
          sel: { file: 'pages/LoginPage.java' },
          pw: { file: 'pages/login.page.ts' },
          segs: [
            [`
import org.openqa.selenium.*;`, `
import { type Page, type Locator } from '@playwright/test';
import { DashboardPage } from './dashboard.page';`],
            [`
public class LoginPage {
  private final WebDriver driver;`, `
export class LoginPage {`],
            [`
  private final By username = By.id("username");
  private final By password = By.id("password");
  private final By submit = By.cssSelector("button[type='submit']");`, `
  readonly username: Locator;
  readonly password: Locator;
  readonly submit: Locator;`],
            [`
  public LoginPage(WebDriver driver) {
    this.driver = driver;
  }`, `
  constructor(private readonly page: Page) {
    this.username = page.getByLabel('Username');
    this.password = page.getByLabel('Password');
    this.submit = page.getByRole('button', { name: 'Sign in' });
  }`],
            [`
  public void open() {
    driver.get("https://example.com/login");
  }`, `
  async open() {
    await this.page.goto('/login');
  }`],
            [`
  public DashboardPage login(String user, String pass) {
    driver.findElement(username).sendKeys(user);
    driver.findElement(password).sendKeys(pass);
    driver.findElement(submit).click();
    return new DashboardPage(driver);
  }
}`, `
  async login(user: string, pass: string) {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.submit.click();
    return new DashboardPage(this.page);
  }
}`],
          ],
        },
        callout: {
          type: 'tip',
          body: `<code>private readonly page: Page</code> in the constructor is TypeScript shorthand: it declares the field and
            assigns it in one go, replacing <code>this.driver = driver</code>.`,
        },
      },
      {
        id: 'pagefactory',
        title: '@FindBy and PageFactory',
        compare: {
          sel: { file: 'pages/LoginPage.java' },
          pw: { file: 'pages/login.page.ts' },
          segs: [
            [`
@FindBy(id = "username")
private WebElement username;`, `readonly username: Locator; // assigned in the constructor`],
            [`
@FindBy(css = "tbody tr")
private List<WebElement> rows;`, `readonly rows: Locator; // one Locator can match many elements`],
            [`
public LoginPage(WebDriver driver) {
  PageFactory.initElements(driver, this);
}`, '', 'Not needed: locators are lazy by design'],
          ],
        },
        callout: {
          type: 'diff',
          body: `<code>PageFactory</code> wraps fields in proxies so elements are looked up when you use them, not when the page
            object is created. A <code>Locator</code> does exactly that natively, without the reflection, and it never goes stale.`,
        },
      },
      {
        id: 'using',
        title: 'Using page objects in a test',
        compare: {
          sel: { file: 'tests/LoginTest.java' },
          pw: { file: 'tests/login.spec.ts' },
          segs: [
            [`
@Test
public void userCanLogIn() {`, `test('user can log in', async ({ page }) => {`],
            [`  LoginPage loginPage = new LoginPage(driver);`, `  const loginPage = new LoginPage(page);`],
            [`  loginPage.open();`, `  await loginPage.open();`],
            [`  DashboardPage dashboard = loginPage.login("tom", "secret");`, `  const dashboard = await loginPage.login('tom', 'secret');`],
            [`
  Assert.assertEquals(dashboard.getWelcomeText(), "Welcome, tom");
}`, `
  await expect(dashboard.welcome).toHaveText('Welcome, tom');
});`],
          ],
        },
        callout: [
          {
            type: 'diff',
            title: 'Expose locators, not strings',
            body: `A method like <code>getWelcomeText()</code> returns a value read <em>once</em>. Exposing the locator
              (<code>dashboard.welcome</code>) lets the test use a retrying web-first assertion instead.`,
          },
          {
            type: 'tip',
            body: `Tired of writing <code>new LoginPage(page)</code> in every test? The next topic, <a href="#/fixtures">Fixtures</a>,
              injects page objects for you.`,
          },
        ],
      },
      {
        id: 'components',
        title: 'Reusable components',
        body: `<p>For widgets that appear on many pages (a header, a date picker, a table), scope a component to a root locator.
          Every locator inside it is then relative to that root.</p>`,
        compare: {
          sel: { file: 'components/Header.java' },
          pw: { file: 'components/header.ts' },
          segs: [
            [`
public class Header {
  private final WebElement root;

  public Header(WebDriver driver) {
    this.root = driver.findElement(By.tagName("header"));
  }`, `
export class Header {
  constructor(private readonly root: Locator) {}`],
            [`
  public void search(String text) {
    root.findElement(By.name("q")).sendKeys(text, Keys.ENTER);
  }
}`, `
  async search(text: string) {
    await this.root.getByRole('searchbox').fill(text);
    await this.root.getByRole('searchbox').press('Enter');
  }
}`],
            [`Header header = new Header(driver);`, `const header = new Header(page.locator('header'));`],
          ],
        },
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'fixtures',
    group: 'Test Design',
    title: 'Fixtures',
    summary: 'Base test classes and @Before/@After become fixtures with setup and teardown in one place.',
    keywords: 'fixture basetest beforemethod aftermethod extend inject dependency worker scope',
    intro: `Fixtures replace base test classes and <code>@BeforeMethod</code>/<code>@AfterMethod</code>. A test lists the
      fixtures it needs in its parameters, and Playwright sets up only those — then tears them down afterwards, even when
      the test fails.`,
    sections: [
      {
        id: 'builtin',
        title: 'Built-in fixtures replace the base class',
        compare: {
          sel: { file: 'tests/BaseTest.java' },
          pw: { file: 'tests/cart.spec.ts' },
          segs: [
            [`
public abstract class BaseTest {
  protected WebDriver driver;`, `// No base class. Built-in fixtures: page, context, browser,
// request, browserName, baseURL ...`],
            [`
  @BeforeMethod
  public void setUp() {
    driver = DriverFactory.create();
  }`, `// 'page' is created only when a test asks for it`],
            [`
  @AfterMethod(alwaysRun = true)
  public void tearDown() {
    driver.quit();
  }
}`, `// ...and closed after the test, pass or fail`],
            [`
public class CartTest extends BaseTest {
  @Test
  public void addsItem() { /* uses driver */ }
}`, `
test('adds item', async ({ page, browserName }) => {
  /* uses page */
});`],
          ],
        },
      },
      {
        id: 'custom',
        title: 'Custom fixtures: injecting page objects',
        body: `<p>Extend the base <code>test</code> with your own fixtures, export it, and import it in your spec files instead
          of <code>@playwright/test</code>.</p>`,
        compare: {
          sel: { file: 'tests/BaseTest.java' },
          pw: { file: 'fixtures.ts' },
          segs: [
            ['', `
import { test as base } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { CartPage } from './pages/cart.page';`, 'Same package — no imports'],
            [`
public abstract class BaseTest {
  protected LoginPage loginPage;
  protected CartPage cartPage;`, `
type Pages = { loginPage: LoginPage; cartPage: CartPage };

export const test = base.extend<Pages>({`],
            [`
  @BeforeMethod
  public void initPages() {
    loginPage = new LoginPage(driver);
    cartPage = new CartPage(driver);
  }
}`, `
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
});`],
            ['', `export { expect } from '@playwright/test';`],
          ],
        },
      },
      {
        id: 'using-custom',
        title: 'Using custom fixtures',
        compare: {
          sel: { file: 'tests/CheckoutTest.java' },
          pw: { file: 'tests/checkout.spec.ts' },
          segs: [
            [`public class CheckoutTest extends BaseTest {`, `import { test, expect } from '../fixtures';`],
            [`
  @Test
  public void checkout() {`, `
test('checkout', async ({ loginPage, cartPage }) => {`],
            [`    loginPage.open();`, `  await loginPage.open();`],
            [`    cartPage.add("Laptop");`, `  await cartPage.add('Laptop');`],
            [`
  }
}`, `});`],
          ],
        },
        callout: {
          type: 'tip',
          body: `Fixtures are lazy: a test that only asks for <code>cartPage</code> never creates a <code>LoginPage</code>. A
            fixture can also depend on other fixtures — <code>cartPage</code> receives <code>page</code> above.`,
        },
      },
      {
        id: 'setup-teardown',
        title: 'Setup and teardown in one place',
        body: `<p>Everything before <code>use()</code> is setup, the test runs during <code>use()</code>, and everything after it
          is teardown. Setup and cleanup of the same resource live side by side instead of in two annotated methods.</p>`,
        compare: {
          sel: { file: 'tests/ProfileTest.java' },
          pw: { file: 'fixtures.ts' },
          segs: [
            [`private User user;`, `export const test = base.extend<{ user: User }>({
  user: async ({ request }, use) => {`],
            [`
@BeforeMethod
public void createUser() {
  user = api.createUser("tom");
}`, `    const user = await createUser(request, 'tom'); // setup`],

            ['', `    await use(user); // the test runs here`, 'The test runs between the two methods'],
            [`
@AfterMethod(alwaysRun = true)
public void deleteUser() {
  api.deleteUser(user.getId());
}`, `
    await deleteUser(request, user.id); // teardown
  },
});`],
          ],
        },
        callout: [
          {
            type: 'tip',
            title: '@BeforeClass / @BeforeSuite equivalents',
            body: `Give a fixture <code>{ scope: 'worker' }</code> to create it once per worker process and share it across that
              worker's tests: <code>account: [async ({}, use) =&gt; { … }, { scope: 'worker' }]</code>.`,
          },
          {
            type: 'tip',
            title: 'Listener equivalents',
            body: `Add <code>{ auto: true }</code> to run a fixture for every test without asking for it — handy for things you'd
              put in a TestNG listener, such as collecting logs.`,
          },
        ],
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'data-driven',
    group: 'Test Design',
    title: 'Data-driven Tests',
    summary: '@DataProvider becomes a plain loop; reading JSON/CSV data and environment parameters.',
    keywords: 'dataprovider parameterized parameters csv json environment env loop',
    intro: `TestNG needs <code>@DataProvider</code> because tests are methods. In Playwright, tests are created by calling
      <code>test()</code>, so a plain <code>for</code> loop is all it takes to generate one test per data row.`,
    sections: [
      {
        id: 'dataprovider',
        title: '@DataProvider → a loop',
        compare: {
          sel: { file: 'tests/LoginTest.java' },
          pw: { file: 'tests/login.spec.ts' },
          segs: [
            [`
@DataProvider(name = "logins")
public Object[][] logins() {
  return new Object[][] {
    { "tom", "secret", "Welcome, tom" },
    { "ann", "hunter2", "Welcome, ann" },
  };
}`, `
const logins = [
  { user: 'tom', pass: 'secret', greeting: 'Welcome, tom' },
  { user: 'ann', pass: 'hunter2', greeting: 'Welcome, ann' },
];`],
            [`
@Test(dataProvider = "logins")
public void login(String user, String pass, String greeting) {`, `
for (const { user, pass, greeting } of logins) {
  test(\`login as \${user}\`, async ({ loginPage }) => {`],
            [`  loginPage.login(user, pass);`, `    await loginPage.login(user, pass);`],
            [`
  Assert.assertEquals(dashboard.getWelcomeText(), greeting);
}`, `
    await expect(loginPage.greeting).toHaveText(greeting);
  });
}`],
          ],
        },
        callout: {
          type: 'warn',
          body: `Test titles must be unique within a file, so include the data in the title — as
            <code>\`login as \${user}\`</code> does. Duplicate titles fail at startup.`,
        },
      },
      {
        id: 'files',
        title: 'Reading data from JSON or CSV',
        compare: {
          sel: { file: 'tests/UserData.java' },
          pw: { file: 'tests/users.spec.ts' },
          segs: [
            [`
@DataProvider
public Object[][] users() throws IOException {
  ObjectMapper mapper = new ObjectMapper();
  List<User> users = mapper.readValue(
      new File("src/test/resources/users.json"), new TypeReference<>() {});`, `
import fs from 'node:fs';
import path from 'node:path';

const users: User[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data/users.json'), 'utf-8')
);`],
            [`
  List<String> lines = Files.readAllLines(Path.of("src/test/resources/users.csv"));
  return lines.stream().skip(1).map(l -> l.split(",")).toArray(Object[][]::new);
}`, `
import { parse } from 'csv-parse/sync'; // npm i -D csv-parse

const rows = parse(fs.readFileSync(path.join(__dirname, 'data/users.csv')), {
  columns: true,          // first line is the header
  skip_empty_lines: true,
});`],
          ],
        },
      },
      {
        id: 'environment',
        title: 'Environments and parameters',
        body: `<p>TestNG passes parameters through <code>testng.xml</code> or <code>-D</code> system properties. Playwright reads
          plain environment variables, typically in <code>playwright.config.ts</code>.</p>`,
        compare: {
          sel: { file: 'tests/BaseTest.java' },
          pw: { file: 'playwright.config.ts' },
          segs: [
            [`String env = System.getProperty("env", "qa");`, `const env = process.env.ENV ?? 'qa';`],
            [`
@Parameters("baseUrl")
@BeforeClass
public void setUp(String baseUrl) {
  this.baseUrl = baseUrl;
}`, `
export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL ?? 'https://qa.example.com',
  },
});`],
            [`// mvn test -Denv=staging -DbaseUrl=https://staging.example.com`, `// ENV=staging BASE_URL=https://staging.example.com npx playwright test`],
          ],
        },
        callout: {
          type: 'tip',
          body: `Keep secrets and per-machine values in a <code>.env</code> file (git-ignored) and load it at the top of the
            config with <code>import 'dotenv/config';</code> after <code>npm i -D dotenv</code>.`,
        },
      },
    ],
  },
];
