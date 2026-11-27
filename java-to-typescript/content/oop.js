/* Object-Oriented: Classes, Interfaces & Type Aliases, Inheritance, Generics.
 * Same format as described at the top of content/topics.js. */
window.TOPIC_GROUPS = window.TOPIC_GROUPS || {};
window.TOPIC_GROUPS.oop = [

  /* ================================================================== */
  {
    id: 'classes',
    group: 'Object-Oriented',
    title: 'Classes & Objects',
    summary: 'Fields, constructors, access modifiers, getters and static members.',
    keywords: 'class field constructor private public protected readonly final static getter setter toString parameter properties singleton',
    intro: `TypeScript classes will look familiar. The main differences are shorter constructors, two kinds of
      <code>private</code>, real getter and setter syntax, and the fact that many things that are classes in Java are just
      functions or object literals in TypeScript.`,
    sections: [
      {
        id: 'class',
        title: 'A class',
        compare: {
          sel: { file: 'Account.java' },
          pw: { file: 'account.ts' },
          segs: [
            [`public class Account {`, `export class Account {`],
            [`    private final String id;
    private double balance;`, `  readonly id: string;
  #balance: number;`],
            [`    public Account(String id, double balance) {
        this.id = id;
        this.balance = balance;
    }`, `  constructor(id: string, balance: number) {
    this.id = id;
    this.#balance = balance;
  }`],
            [`    public double getBalance() {
        return balance;
    }`, `  get balance(): number {
    return this.#balance;
  }`],
            [`    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Amount must be positive");
        balance += amount;
    }
}`, `  deposit(amount: number): void {
    if (amount <= 0) throw new RangeError('Amount must be positive');
    this.#balance += amount;
  }
}`],
            [`Account acc = new Account("A-1", 100);
acc.deposit(50);
System.out.println(acc.getBalance());`, `const acc = new Account('A-1', 100);
acc.deposit(50);
console.log(acc.balance);       // a getter reads like a field`],
          ],
        },
        callout: {
          type: 'diff',
          body: `Members are <code>public</code> by default, and inside methods you must always write <code>this.</code>
            to reach a field or another method.`,
        },
      },
      {
        id: 'private',
        title: 'private vs. #private',
        body: `<p>TypeScript has two kinds of private. The <code>private</code> keyword is checked only by the compiler; at
          runtime the field is an ordinary public property. A <code>#name</code> field is private in the JavaScript runtime
          too, which is closer to Java.</p>`,
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`private String token;`, `private token: string;       // compile-time only
#secret: string;              // enforced at runtime`],
            [`protected String name;`, `protected name: string;`],
            [`// package-private (no modifier)`, `// no equivalent: leave it out of the module's exports instead`],
          ],
        },
      },
      {
        id: 'parameter-properties',
        title: 'Shorter constructors',
        body: `<p>Adding a modifier to a constructor parameter declares the field and assigns it in one step. It replaces the
          boilerplate that Lombok's <code>@RequiredArgsConstructor</code> or a record would remove in Java.</p>`,
        compare: {
          sel: { file: 'OrderService.java' },
          pw: { file: 'order-service.ts' },
          segs: [
            [`public class OrderService {
    private final OrderRepository repo;
    private final Clock clock;

    public OrderService(OrderRepository repo, Clock clock) {
        this.repo = repo;
        this.clock = clock;
    }
}`, `export class OrderService {
  constructor(
    private readonly repo: OrderRepository,
    private readonly clock: Clock,
  ) {}
}`],
          ],
        },
        callout: {
          type: 'tip',
          body: `Parameter properties are TypeScript-only syntax, so tools that only strip types (such as
            <code>node file.ts</code>) can't run them. If your project sets <code>erasableSyntaxOnly</code>, write the fields
            out in full instead.`,
        },
      },
      {
        id: 'static',
        title: 'Static members and singletons',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`public static final int MAX = 10;
public static Account empty(String id) {
    return new Account(id, 0);
}`, `static readonly MAX = 10;
static empty(id: string): Account {
  return new Account(id, 0);
}`],
            [`public enum Config {
    INSTANCE;
    public String url() { … }
}`, `// a module is evaluated once, so an exported object is already a singleton
export const config = {
  url: process.env.API_URL ?? 'http://localhost:8080',
};`],
          ],
        },
      },
      {
        id: 'to-string',
        title: 'toString, equals and hashCode',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`@Override
public String toString() { return "Account[" + id + "]"; }`, `toString(): string { return \`Account[\${this.id}]\`; }`],
            [`@Override
public boolean equals(Object o) { … }
@Override
public int hashCode() { … }`, `// no built-in equality protocol: === compares references.
// Write an equals(other: Account) method if you need one.`],
          ],
        },
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'interfaces',
    group: 'Object-Oriented',
    title: 'Interfaces & Type Aliases',
    summary: 'Interfaces describe shapes, not contracts a class must sign. Plus "type" and when to use it.',
    keywords: 'interface type alias implements optional property readonly index signature default method extends',
    intro: `A TypeScript <code>interface</code> describes the shape of an object. Because typing is structural, any object
      with that shape fits, including plain object literals. Classes can still say <code>implements</code>, which asks the
      compiler to check the class.`,
    sections: [
      {
        id: 'interface',
        title: 'Declaring and implementing',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`public interface Notifier {
    void send(String to, String message);
}`, `export interface Notifier {
  send(to: string, message: string): void;
}`],
            [`public class EmailNotifier implements Notifier {
    public void send(String to, String message) { … }
}`, `export class EmailNotifier implements Notifier {
  send(to: string, message: string): void { … }
}`],
            [`Notifier test = new Notifier() {
    public void send(String to, String message) {
        System.out.println(to + ": " + message);
    }
};`, `const test: Notifier = {
  send: (to, message) => console.log(\`\${to}: \${message}\`),
};`],
          ],
        },
      },
      {
        id: 'data-shapes',
        title: 'Interfaces for data',
        body: `<p>In Java, data usually lives in classes or records. In TypeScript, data is usually a plain object described by
          an interface or type, with no class at all.</p>`,
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`public class Address {
    private String street;
    private String city;
    private String postcode;   // may be null
    // getters, setters, constructor…
}`, `interface Address {
  street: string;
  city: string;
  postcode?: string;            // optional: string | undefined
  readonly country: string;     // can't be reassigned
}`],
            [`Address a = new Address("1 Main St", "Pune", null, "IN");`, `const a: Address = { street: '1 Main St', city: 'Pune', country: 'IN' };`],
          ],
        },
      },
      {
        id: 'interface-vs-type',
        title: 'interface or type?',
        body: `<p><code>type</code> gives a name to any type: an object shape, a union, a function type, a tuple. For object
          shapes, <code>interface</code> and <code>type</code> are nearly interchangeable.</p>`,
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`interface Point { int x(); int y(); }`, `interface Point { x: number; y: number }
type Point2 = { x: number; y: number };      // same thing`],
            [`interface Point3D extends Point { int z(); }`, `interface Point3D extends Point { z: number }
type Point3D2 = Point & { z: number };       // intersection`],
            ['', `type Id = string | number;                  // only "type" can do unions
type Handler = (event: Event) => void;`, 'Java has no type aliases'],
          ],
        },
        callout: {
          type: 'tip',
          body: `A common rule: use <code>interface</code> for object shapes that classes implement or others extend, and
            <code>type</code> for everything else. Being consistent matters more than which you pick.`,
        },
      },
      {
        id: 'default-methods',
        title: 'Default methods',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`interface Greeter {
    String name();
    default String greet() { return "Hi " + name(); }
}`, `// interfaces can't contain code. Use a function…
function greet(g: { name: string }) { return \`Hi \${g.name}\`; }
// …or an abstract class with a concrete method`],
          ],
        },
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'inheritance',
    group: 'Object-Oriented',
    title: 'Inheritance & Abstract Classes',
    summary: 'extends, super, abstract and override all carry over. instanceof only works for classes.',
    keywords: 'extends super abstract override instanceof polymorphism inheritance composition',
    intro: `Inheritance works much like Java's: single inheritance of classes, any number of interfaces, abstract classes
      and methods, and <code>super</code> calls.`,
    sections: [
      {
        id: 'abstract',
        title: 'Abstract classes and overriding',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`public abstract class Shape {
    public abstract double area();
    public String describe() {
        return getClass().getSimpleName() + " with area " + area();
    }
}`, `export abstract class Shape {
  abstract area(): number;
  describe(): string {
    return \`\${this.constructor.name} with area \${this.area()}\`;
  }
}`],
            [`public class Circle extends Shape {
    private final double radius;
    public Circle(double radius) {
        super();
        this.radius = radius;
    }
    public double radius() { return radius; }
    @Override
    public double area() { return Math.PI * radius * radius; }
}`, `export class Circle extends Shape {
  constructor(readonly radius: number) {
    super();
  }

  override area(): number { return Math.PI * this.radius ** 2; }
}`],
          ],
        },
        callout: {
          type: 'tip',
          body: `Turn on <code>noImplicitOverride</code> in <code>tsconfig.json</code>. The <code>override</code> keyword then
            becomes required, which catches the same mistakes as Java's <code>@Override</code>.`,
        },
      },
      {
        id: 'instanceof',
        title: 'Checking types at runtime',
        body: `<p><code>instanceof</code> works for classes, because classes exist at runtime. Interfaces and type aliases don't,
          so check for a property or write a type guard instead.</p>`,
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`if (shape instanceof Circle c) {
    System.out.println(c.radius());
}`, `if (shape instanceof Circle) {
  console.log(shape.radius);   // narrowed to Circle
}`],
            [`if (event instanceof Clickable c) { c.click(); }`, `if ('click' in event) { event.click(); }`],
            ['', `function isClickable(x: unknown): x is Clickable {
  return typeof x === 'object' && x !== null && 'click' in x;
}`, 'instanceof works for interfaces too'],
          ],
        },
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'generics',
    group: 'Object-Oriented',
    title: 'Generics & Utility Types',
    summary: 'Generics carry over, wildcards mostly disappear, and utility types derive new types from old ones.',
    keywords: 'generic type parameter bounded extends wildcard erasure Partial Pick Omit Readonly Record keyof utility',
    intro: `Generics look and behave much like Java's, and they are erased in both languages. TypeScript then goes
      further: it can build new types from existing ones, which replaces a lot of hand-written DTO classes.`,
    sections: [
      {
        id: 'basics',
        title: 'Generic classes and functions',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`public class Box<T> {
    private final T value;
    public Box(T value) { this.value = value; }
    public T get() { return value; }
}`, `export class Box<T> {
  constructor(private readonly value: T) {}
  get(): T { return this.value; }
}`],
            [`static <T> Optional<T> first(List<T> items) {
    return items.stream().findFirst();
}`, `function first<T>(items: T[]): T | undefined {
  return items[0];
}`],
            [`Box<String> box = new Box<>("hi");`, `const box = new Box('hi');      // Box<string>, inferred`],
          ],
        },
      },
      {
        id: 'bounds',
        title: 'Bounded types and wildcards',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`static <T extends Entity> Map<String, T> index(List<T> items) { … }`, `function index<T extends { id: string }>(items: T[]): Map<string, T> { … }`],
            [`static double total(List<? extends Shape> shapes) { … }`, `function total(shapes: readonly Shape[]): number { … }`],
            ['', `function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map(item => item[key]);
}
pluck(users, 'name');    // string[]
pluck(users, 'nme');     // compile error`, 'Needs reflection in Java'],
          ],
        },
        callout: {
          type: 'diff',
          body: `Wildcards aren't needed: TypeScript compares generic types by shape, and a <code>readonly</code> array of a
            subtype is accepted wherever a <code>readonly</code> array of the parent type is expected.`,
        },
      },
      {
        id: 'utility',
        title: 'Utility types',
        body: `<p>In Java a "create user" request, an "update user" request and a "public user" view are often three DTO
          classes. In TypeScript you derive them from one type.</p>`,
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`record User(String id, String name, String email, String passwordHash) {}`, `type User = { id: string; name: string; email: string; passwordHash: string };`],
            [`record PublicUser(String id, String name) {}`, `type PublicUser = Pick<User, 'id' | 'name'>;`],
            [`record NewUser(String name, String email, String passwordHash) {}`, `type NewUser = Omit<User, 'id'>;`],
            [`// every field optional: a class with nullable fields`, `type UserPatch = Partial<NewUser>;`],
            [`// immutable view: copy into a record`, `type FrozenUser = Readonly<User>;`],
            [`Map<Role, List<String>> permissions;`, `type Permissions = Record<Role, string[]>;`],
          ],
        },
        callout: {
          type: 'pw',
          body: `More helpers worth knowing: <code>Required&lt;T&gt;</code>, <code>NonNullable&lt;T&gt;</code>,
            <code>ReturnType&lt;typeof fn&gt;</code>, <code>Parameters&lt;typeof fn&gt;</code> and
            <code>Awaited&lt;T&gt;</code>.`,
        },
      },
    ],
  },
];
