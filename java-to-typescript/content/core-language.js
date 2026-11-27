/* Core Language: Variables & Types, Null Safety, Control Flow, Methods → Functions.
 * Same format as described at the top of content/topics.js. */
window.TOPIC_GROUPS = window.TOPIC_GROUPS || {};
window.TOPIC_GROUPS.core = [

  /* ================================================================== */
  {
    id: 'variables',
    group: 'Core Language',
    title: 'Variables & Primitive Types',
    summary: 'final → const, every number is a number, strings and template literals.',
    keywords: 'let const var final int long double number bigint string boolean char template literal format text block parse',
    intro: `TypeScript has fewer primitive types than Java. There is a single <code>number</code> type for all numbers, no
      <code>char</code>, and <code>string</code> is a primitive, not a class.`,
    sections: [
      {
        id: 'declaring',
        title: 'Declaring variables',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`final String name = "Asha";`, `const name = 'Asha';`],
            [`int count = 0;
count++;`, `let count = 0;
count++;`],
            [`final List<String> tags = new ArrayList<>();
tags.add("new");             // allowed: final is not immutable`, `const tags: string[] = [];
tags.push('new');            // allowed: const is not immutable either`],
            ['', `var legacy = 1;              // old JavaScript: don't use`, 'Java has no equivalent of the old var'],
          ],
        },
        callout: {
          type: 'tip',
          body: `Default to <code>const</code>, and use <code>let</code> only when you reassign. Like Java's <code>final</code>,
            <code>const</code> stops reassignment but not changes inside an object or array.`,
        },
      },
      {
        id: 'numbers',
        title: 'Numbers',
        body: `<p><code>number</code> is a 64-bit floating-point value, like Java's <code>double</code>. It holds whole numbers
          exactly up to 2<sup>53</sup> − 1. For anything larger use <code>bigint</code>.</p>`,
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`int age = 34;
double price = 9.99;`, `const age = 34;
const price = 9.99;          // both are number`],
            [`long big = 9_007_199_254_740_993L;`, `const big = 9_007_199_254_740_993n;   // bigint`],
            [`int half = 7 / 2;            // 3`, `const half = Math.trunc(7 / 2);        // 7 / 2 is 3.5`],
            [`int n = Integer.parseInt("42");`, `const n = Number.parseInt('42', 10);   // or Number('42')`],
            [`String s = String.valueOf(42);`, `const s = String(42);`],
          ],
        },
        callout: {
          type: 'warn',
          body: `Division never rounds, and nothing throws. <code>1 / 0</code> is <code>Infinity</code>, and
            <code>Number('abc')</code> is <code>NaN</code> rather than a <code>NumberFormatException</code>. Check results
            with <code>Number.isNaN()</code> or <code>Number.isFinite()</code>.`,
        },
      },
      {
        id: 'strings',
        title: 'Strings',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`String msg = String.format("Hi %s, you are %d", name, age);`, `const msg = \`Hi \${name}, you are \${age}\`;`],
            [`String block = """
    Dear %s,
    Thanks!
    """.formatted(name);`, `const block = \`Dear \${name},
Thanks!\`;`],
            [`a.equals(b)`, `a === b`],
            [`s.isEmpty()
s.isBlank()`, `s.length === 0
s.trim().length === 0`],
            [`s.contains("x")
s.startsWith("x")
s.toUpperCase()`, `s.includes('x')
s.startsWith('x')
s.toUpperCase()`],
            [`s.charAt(0)
s.substring(1, 3)`, `s.charAt(0)                  // or s[0]
s.substring(1, 3)            // or s.slice(1, 3)`],
            [`String.join(", ", list)`, `list.join(', ')`],
            [`"ab".repeat(3)`, `'ab'.repeat(3)`],
          ],
        },
        callout: {
          type: 'diff',
          body: `Compare strings with <code>===</code>. Strings are primitives, so <code>===</code> compares their contents, and
            Java's <code>==</code> vs. <code>equals</code> trap does not exist.`,
        },
      },
      {
        id: 'booleans',
        title: 'Booleans and truthiness',
        body: `<p>Java's <code>if</code> needs a <code>boolean</code>. TypeScript's accepts any value and treats
          <code>0</code>, <code>''</code>, <code>NaN</code>, <code>null</code> and <code>undefined</code> as false.</p>`,
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`if (count > 0) { … }`, `if (count > 0) { … }          // say what you mean`],
            [`if (name != null && !name.isEmpty()) { … }`, `if (name) { … }               // not null, not undefined, not ''`],
            ['', `if (count) { … }              // careful: false when count is 0`, 'Java requires a boolean'],
          ],
        },
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'null-safety',
    group: 'Core Language',
    title: 'Null Safety & Optional',
    summary: 'Optional<T> becomes T | undefined, with ?. and ?? to handle it.',
    keywords: 'null undefined optional nullable orElse map ifPresent optional chaining nullish coalescing strictNullChecks',
    intro: `With <code>strict</code> on, a <code>string</code> can never be <code>null</code>. A value that might be missing says
      so in its type: <code>string | undefined</code>. The compiler makes you handle that case, so
      <code>NullPointerException</code>s are caught before the code runs.`,
    sections: [
      {
        id: 'null-undefined',
        title: 'null and undefined',
        body: `<p>JavaScript has two "nothing" values. <code>undefined</code> means "not set": a missing property, a missing
          argument, an empty array slot. <code>null</code> means "deliberately empty". Most TypeScript code uses
          <code>undefined</code>, and many teams avoid <code>null</code> entirely.</p>`,
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`String nickname = profile.nickname();   // may be null`, `const nickname: string | undefined = profile.nickname;`],
            [`nickname.length();      // NullPointerException at runtime`, `nickname.length;       // compile error: may be undefined`],
            [`if (nickname != null) {
    System.out.println(nickname.length());
}`, `if (nickname !== undefined) {
  console.log(nickname.length);      // OK: narrowed to string
}`],
          ],
        },
      },
      {
        id: 'optional',
        title: 'Optional<T> → T | undefined',
        compare: {
          sel: { file: 'UserService.java' },
          pw: { file: 'user-service.ts' },
          segs: [
            [`Optional<User> findUser(String id) {
    return Optional.ofNullable(users.get(id));
}`, `function findUser(id: string): User | undefined {
  return users.get(id);
}`],
            [`String city = findUser(id)
    .map(User::address)
    .map(Address::city)
    .orElse("Unknown");`, `const city = findUser(id)?.address?.city ?? 'Unknown';`],
            [`findUser(id).ifPresent(u -> send(u));`, `const user = findUser(id);
if (user) send(user);`],
            [`User u = findUser(id).orElseThrow();`, `const u = findUser(id);
if (!u) throw new Error(\`No user \${id}\`);`],
          ],
        },
        callout: {
          type: 'pw',
          title: 'Optional chaining and nullish coalescing',
          body: `<code>a?.b</code> gives <code>undefined</code> instead of failing when <code>a</code> is null or undefined.
            <code>a ?? b</code> gives <code>b</code> only when <code>a</code> is null or undefined. Use <code>??</code> rather
            than <code>||</code> for defaults, because <code>||</code> also replaces <code>0</code> and <code>''</code>.`,
        },
      },
      {
        id: 'non-null',
        title: 'The ! operator',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`Objects.requireNonNull(config.get("url"));   // checks, throws if null`, `config.get('url')!;    // no check: just tells the compiler "trust me"`],
          ],
        },
        callout: {
          type: 'warn',
          body: `A trailing <code>!</code> removes <code>undefined</code> from the type and does nothing at runtime. If you are
            wrong, the failure appears later and further away. Prefer an explicit check that throws a clear error.`,
        },
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'control-flow',
    group: 'Core Language',
    title: 'Control Flow & Equality',
    summary: 'Loops, switch, === vs. ==, and the for...in trap.',
    keywords: 'if for while loop for of for in switch equality === == ternary break',
    intro: `Most control flow looks the same as in Java. Pay attention to equality, which loop you pick for collections,
      and the lack of switch expressions.`,
    sections: [
      {
        id: 'loops',
        title: 'Loops',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`for (int i = 0; i < 3; i++) { … }`, `for (let i = 0; i < 3; i++) { … }`],
            [`for (String name : names) { … }`, `for (const name of names) { … }`],
            [`for (int i = 0; i < names.size(); i++) {
    System.out.println(i + ": " + names.get(i));
}`, `for (const [i, name] of names.entries()) {
  console.log(\`\${i}: \${name}\`);
}`],
            [`names.forEach(n -> System.out.println(n));`, `names.forEach(n => console.log(n));`],
            [`while (!queue.isEmpty()) { … }
do { … } while (retry);`, `while (queue.length > 0) { … }
do { … } while (retry);`],
          ],
        },
        callout: {
          type: 'warn',
          title: 'for...of, not for...in',
          body: `<code>for (const x of list)</code> loops over values, like Java's enhanced for. <code>for (const x in list)</code>
            loops over property <em>names</em>, so for an array you get the indexes as strings: <code>'0'</code>,
            <code>'1'</code>, … It is almost never what you want.`,
        },
      },
      {
        id: 'equality',
        title: 'Equality',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`a == b          // primitives: value; objects: same reference`, `a === b         // primitives: value; objects: same reference`],
            [`a.equals(b)     // value equality you define`, `// no equals(): compare fields, or use a deep-equality helper`],
            ['', `'1' == 1        // true: == converts types first. Never use ==`, 'Java has no type-converting equality'],
          ],
        },
        callout: {
          type: 'tip',
          body: `Always use <code>===</code> and <code>!==</code>. The one common exception is <code>x == null</code>, which
            checks for both <code>null</code> and <code>undefined</code> in one go.`,
        },
      },
      {
        id: 'switch',
        title: 'switch',
        body: `<p>TypeScript's <code>switch</code> is the old statement form, with fall-through between cases. There are no
          switch expressions or arrow cases, so either <code>return</code> from each case or use a lookup object.</p>`,
        compare: {
          sel: { file: 'Java 21' },
          pw: {},
          segs: [
            [`String label = switch (status) {
    case ACTIVE -> "Active";
    case PAUSED, STOPPED -> "Inactive";
};`, `function label(status: Status): string {
  switch (status) {
    case 'active': return 'Active';
    case 'paused':
    case 'stopped': return 'Inactive';
  }
}`],
            ['', `const LABELS: Record<Status, string> = {
  active: 'Active', paused: 'Inactive', stopped: 'Inactive',
};
const label = LABELS[status];`, 'A switch expression covers this'],
          ],
        },
        callout: {
          type: 'tip',
          body: `Both versions are checked for completeness: if a new <code>Status</code> is added, the function's missing
            <code>return</code> and the <code>Record</code>'s missing key are compile errors. See
            <a href="#/unions-narrowing">Unions &amp; Narrowing</a>.`,
        },
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'functions',
    group: 'Core Language',
    title: 'Methods → Functions',
    summary: 'Standalone functions, default and optional parameters, lambdas and function types.',
    keywords: 'method function arrow lambda overload default parameter optional varargs rest functional interface builder',
    intro: `Functions don't need to live in a class. They are values, so you can store them in variables and pass them
      around, which replaces most functional interfaces.`,
    sections: [
      {
        id: 'declaring',
        title: 'Declaring functions',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`static int add(int a, int b) {
    return a + b;
}`, `function add(a: number, b: number): number {
  return a + b;
}`],
            [`BinaryOperator<Integer> add = (a, b) -> a + b;`, `const add = (a: number, b: number) => a + b;`],
            [`void log(String msg) { … }`, `function log(msg: string): void { … }`],
          ],
        },
      },
      {
        id: 'parameters',
        title: 'Overloads → optional and default parameters',
        body: `<p>Java uses overloading to offer shorter versions of a method. TypeScript does it with one function and
          optional or default parameters.</p>`,
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`String greet(String name) {
    return greet(name, "Hello");
}
String greet(String name, String greeting) {
    return greeting + ", " + name;
}`, `function greet(name: string, greeting = 'Hello') {
  return \`\${greeting}, \${name}\`;
}`],
            [`void notify(User u) { … }
void notify(User u, Channel c) { … }`, `function notify(u: User, channel?: Channel) {
  // channel is Channel | undefined
}`],
            [`int sum(int... nums) { … }`, `function sum(...nums: number[]) { … }`],
          ],
        },
      },
      {
        id: 'options',
        title: 'Builders → options objects',
        body: `<p>For many optional settings, Java code reaches for a builder. TypeScript passes a single object and
          destructures it, which gives you named arguments with defaults.</p>`,
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`HttpRequest req = HttpRequest.newBuilder()
    .uri(uri)
    .timeout(Duration.ofSeconds(5))
    .build();`, `const req = createRequest({ uri, timeoutMs: 5000 });`],
            ['', `type RequestOptions = { uri: string; timeoutMs?: number; retries?: number };

function createRequest({ uri, timeoutMs = 10_000, retries = 0 }: RequestOptions) {
  // …
}`, 'The builder class does this job'],
          ],
        },
      },
      {
        id: 'function-types',
        title: 'Functional interfaces → function types',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`Predicate<User> isAdult = u -> u.age() >= 18;`, `const isAdult = (u: User) => u.age >= 18;`],
            [`Function<String, Integer> length = String::length;`, `const length = (s: string) => s.length;`],
            [`@FunctionalInterface
interface Validator {
    boolean validate(String input);
}`, `type Validator = (input: string) => boolean;`],
            [`void onSave(Consumer<Doc> callback) { … }`, `function onSave(callback: (doc: Doc) => void) { … }`],
            [`Supplier<Instant> clock = Instant::now;`, `const clock = () => new Date();`],
          ],
        },
        callout: {
          type: 'warn',
          title: 'Method references and "this"',
          body: `Java's <code>this::handle</code> stays bound to <code>this</code>. Passing <code>this.handle</code> in TypeScript
            does not, so <code>this</code> is <code>undefined</code> when the function is called later. Pass
            <code>() =&gt; this.handle()</code> instead. See <a href="#/gotchas/this">Common Gotchas</a>.`,
        },
      },
    ],
  },
];
