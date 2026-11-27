/* Getting Started: Setup & Tooling, Your First Program, How TypeScript Types Work.
 * Same format as described at the top of content/topics.js. */
window.TOPIC_GROUPS = window.TOPIC_GROUPS || {};
window.TOPIC_GROUPS.gettingStarted = [

  /* ================================================================== */
  {
    id: 'setup',
    group: 'Getting Started',
    title: 'Setup & Tooling',
    summary: 'JDK and Maven vs. Node.js, npm and tsc. Project layout, config files and running code.',
    keywords: 'install node npm tsc tsx maven jdk tsconfig package.json run compile',
    intro: `Java code runs on the JVM after <code>javac</code> compiles it to bytecode. TypeScript code runs on a
      JavaScript runtime, usually <strong>Node.js</strong> for back-end code, after its types are checked and removed.
      <code>npm</code> plays the part of Maven, and <code>tsc</code> plays the part of <code>javac</code>.`,
    sections: [
      {
        id: 'install',
        title: 'Installing',
        body: `<p>Install a current LTS release of Node.js; it includes <code>npm</code>. TypeScript itself is just an npm
          package, installed per project, so every project pins its own compiler version, like a Maven plugin version.</p>`,
        compare: {
          sel: { file: 'terminal', lang: 'shell' },
          pw: { file: 'terminal', lang: 'shell' },
          segs: [
            [`# install a JDK, then Maven
java -version
mvn -version`, `# install Node.js (LTS); npm comes with it
node --version
npm --version`],
            [`mvn archetype:generate -DgroupId=com.example -DartifactId=app`, `mkdir app && cd app
npm init -y`],
            ['', `npm install --save-dev typescript tsx @types/node
npx tsc --init                    # writes tsconfig.json`, 'The compiler ships with the JDK'],
          ],
        },
        callout: {
          type: 'tip',
          body: `<code>npx</code> runs a tool installed in the project's <code>node_modules</code>, so
            <code>npx tsc</code> always uses the project's own TypeScript version. <code>@types/node</code> adds type
            definitions for Node's built-in modules; list it under <code>"types"</code> in <code>tsconfig.json</code>
            (next section).`,
        },
      },
      {
        id: 'config',
        title: 'Project files',
        body: `<p><code>package.json</code> lists dependencies and scripts, like <code>pom.xml</code>.
          <code>tsconfig.json</code> holds the compiler settings you would pass to <code>javac</code> or the compiler plugin.
          <code>"type": "module"</code> tells Node.js to use standard <code>import</code>/<code>export</code> modules.</p>`,
        compare: {
          sel: { file: 'pom.xml', lang: 'xml' },
          pw: { file: 'package.json', lang: 'json' },
          segs: [
            [`<artifactId>app</artifactId>
<version>1.0.0</version>`, `{
  "name": "app",
  "version": "1.0.0",
  "type": "module",`],
            [`<dependency>
  <groupId>com.fasterxml.jackson.core</groupId>
  <artifactId>jackson-databind</artifactId>
</dependency>`, `  "dependencies": {
    "zod": "^4.0.0"
  },`],
            [`<!-- mvn compile, mvn test, mvn package -->`, `  "scripts": {
    "build": "tsc",
    "start": "node dist/main.js",
    "test": "vitest"
  }
}`],
          ],
        },
      },
      {
        id: 'tsconfig',
        title: 'Compiler settings',
        body: `<p>Turn on <code>strict</code> from day one. It enables the checks that make TypeScript feel like Java,
          above all null checking. Without it, TypeScript lets far more mistakes through.</p>`,
        compare: {
          sel: { file: 'pom.xml', lang: 'xml' },
          pw: { file: 'tsconfig.json', lang: 'json' },
          segs: [
            [`<maven.compiler.release>21</maven.compiler.release>`, `{
  "compilerOptions": {
    "target": "es2023",`],
            [`<!-- packages follow folders: src/main/java -->`, `    "module": "nodenext",
    "rootDir": "src",
    "outDir": "dist",`],
            [`<!-- -Xlint:all -Werror -->`, `    "strict": true,
    "noUncheckedIndexedAccess": true,`],
            [`<!-- the JDK's own classes are always available -->`, `    "types": ["node"],
    "skipLibCheck": true
  },
  "include": ["src"]
}`],
          ],
        },
        callout: {
          type: 'tip',
          body: `<code>noUncheckedIndexedAccess</code> makes <code>list[i]</code> and <code>map[key]</code> return
            <code>T | undefined</code>, so the compiler reminds you to handle a missing item. In Java that mistake shows up at
            runtime as an <code>IndexOutOfBoundsException</code>.`,
        },
      },
      {
        id: 'running',
        title: 'Compiling and running',
        compare: {
          sel: { file: 'terminal', lang: 'shell' },
          pw: { file: 'terminal', lang: 'shell' },
          segs: [
            [`javac -d out src/Main.java     # compile
java -cp out Main              # run`, `npx tsc                        # check types, write dist/*.js
node dist/main.js              # run the JavaScript`],
            [`java src/Main.java             # run one file directly (Java 11+)`, `npx tsx src/main.ts            # run a .ts file directly, no build step`],
            [`mvn compile                    # compile only`, `npx tsc --noEmit               # check types only`],
            ['', `npx tsx watch src/main.ts      # rerun on every save`],
          ],
        },
        callout: [
          {
            type: 'diff',
            body: `Running and type checking are separate. <code>tsx</code> (and Node's own TypeScript support) strip the types
              and run the code <em>without checking them</em>, so code with type errors still runs. Run
              <code>tsc --noEmit</code> or rely on your editor to catch type errors.`,
          },
          {
            type: 'tip',
            body: `Recent Node.js versions (23.6+, and 22.18+) can run <code>node src/main.ts</code> directly by stripping
              the types. That only works for code whose TypeScript syntax can simply be erased, so <code>enum</code>s and
              constructor parameter properties need a different setup.`,
          },
        ],
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'first-program',
    group: 'Getting Started',
    title: 'Your First Program',
    summary: 'No main method, no mandatory class. Modules, console.log and semicolons.',
    keywords: 'hello world main class console println module import export semicolon',
    intro: `Java needs a class with a <code>main</code> method. A TypeScript file runs from top to bottom, so code at the
      top level <em>is</em> the program. Classes are optional, and each file is its own module.`,
    sections: [
      {
        id: 'hello',
        title: 'Hello, world',
        compare: {
          sel: { file: 'Main.java' },
          pw: { file: 'main.ts' },
          segs: [
            [`public class Main {
    public static void main(String[] args) {`, '', 'No class or main method needed'],
            [`        System.out.println("Hello, world");`, `console.log('Hello, world');`],
            [`        System.out.println("Args: " + Arrays.toString(args));`, `console.log('Args:', process.argv.slice(2));`],
            [`    }
}`, ''],
          ],
        },
        callout: {
          type: 'tip',
          body: `<code>console.log</code> accepts any number of values and prints objects and arrays readably, so you rarely
            need a <code>toString()</code> just to debug. <code>console.error</code> writes to stderr, like
            <code>System.err</code>.`,
        },
      },
      {
        id: 'files',
        title: 'Files and modules',
        body: `<p>Java has one public class per file, grouped into packages by folder. In TypeScript every file is a
          module: you <code>export</code> what other files may use, and anything not exported stays private to the file.</p>`,
        compare: {
          sel: { file: 'com/example/util/MathUtils.java' },
          pw: { file: 'src/util/math.ts' },
          segs: [
            [`package com.example.util;`, '', 'The file path is the module name'],
            [`public final class MathUtils {
    private MathUtils() {}`, '', 'No utility class needed'],
            [`    public static int square(int x) {
        return x * x;
    }`, `export function square(x: number): number {
  return x * x;
}`],
            [`    public static final double TAU = 2 * Math.PI;
}`, `export const TAU = 2 * Math.PI;`],
          ],
        },
      },
      {
        id: 'using',
        title: 'Using another file',
        compare: {
          sel: { file: 'Main.java' },
          pw: { file: 'src/main.ts' },
          segs: [
            [`import com.example.util.MathUtils;`, `import { square, TAU } from './util/math.js';`],
            [`System.out.println(MathUtils.square(4));`, `console.log(square(4));`],
            [`import static com.example.util.MathUtils.*;`, `import * as MathUtils from './util/math.js';`],
          ],
        },
        callout: {
          type: 'warn',
          title: 'The .js in the import is correct',
          body: `With <code>"module": "nodenext"</code>, an import names the file that will exist at runtime, so
            <code>./util/math.js</code> refers to <code>math.ts</code> in your source. TypeScript works out the mapping.`,
        },
      },
      {
        id: 'style',
        title: 'Syntax habits',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`String name = "Asha";        // double quotes for strings`, `const name = 'Asha';          // single or double quotes`],
            [`char initial = 'A';          // single quotes for chars`, `const initial = 'A';          // just a one-letter string`],
            [`int count = 0;               // type before the name`, `let count: number = 0;        // type after the name`],
            [`// semicolons are required`, `// semicolons are optional, but most teams keep them`],
          ],
        },
        callout: {
          type: 'tip',
          body: `Let Prettier settle quotes, semicolons and line width for the team (see <a href="#/tooling">Build &amp; Tooling</a>).`,
        },
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'type-system',
    group: 'Getting Started',
    title: 'How TypeScript Types Work',
    summary: 'Types are checked, then erased. Structural typing, inference, any vs. unknown.',
    keywords: 'erasure structural nominal inference any unknown compile time runtime duck',
    intro: `This is the topic that most changes how a Java developer thinks. TypeScript's type system exists only at
      compile time, matches types by <em>shape</em> rather than by name, and infers most types for you.`,
    sections: [
      {
        id: 'erased',
        title: 'Types are erased',
        body: `<p>Java keeps class information at runtime: <code>instanceof</code>, reflection and casts are all checked by
          the JVM. TypeScript removes every type when it compiles, so the JavaScript that runs has no idea what an
          <code>interface</code> or a type annotation was.</p>`,
        compare: {
          sel: {},
          pw: { file: 'TypeScript → JavaScript' },
          segs: [
            [`Object o = "hello";
Integer n = (Integer) o;     // ClassCastException at runtime`, `const o: unknown = 'hello';
const n = o as number;       // no check at all: n is still 'hello'`],
            [`if (o instanceof Greeter g) { … }   // works for interfaces`, `if (o instanceof Greeter) { … }      // error if Greeter is an interface`],
            [`int add(int a, int b) { return a + b; }`, `function add(a: number, b: number) { return a + b; }
// compiles to: function add(a, b) { return a + b; }`],
          ],
        },
        callout: {
          type: 'warn',
          title: '"as" is not a cast',
          body: `<code>value as User</code> tells the compiler to trust you. Nothing is converted or checked at runtime. To check
            data from outside (JSON, user input), validate it: see <a href="#/gotchas/runtime-types">Common Gotchas</a>.`,
        },
      },
      {
        id: 'structural',
        title: 'Structural typing',
        body: `<p>In Java a class fits a type only if it declares it: <code>implements Named</code>. In TypeScript any value
          with the right properties fits. This is often called "duck typing, checked at compile time".</p>`,
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`interface Named { String name(); }`, `interface Named { name: string }`],
            [`record Dog(String name) implements Named {}`, `class Dog { constructor(public name: string) {} }`],
            [`static String hello(Named n) { return "Hi " + n.name(); }`, `function hello(n: Named) { return 'Hi ' + n.name; }`],
            [`hello(new Dog("Rex"));        // OK: Dog implements Named`, `hello(new Dog('Rex'));        // OK: Dog has a name`],
            [`// a Cat without "implements Named" is rejected`, `hello({ name: 'Tom' });       // OK: a plain object fits too`],
          ],
        },
      },
      {
        id: 'inference',
        title: 'Type inference',
        body: `<p>Like Java's <code>var</code>, but everywhere. Annotate function parameters and public return types; let the
          compiler infer local variables.</p>`,
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`var count = 10;                       // int`, `let count = 10;                       // number`],
            [`var names = new ArrayList<String>();`, `const names: string[] = [];           // annotate empty collections`],
            [`var first = names.get(0);             // String`, `const first = names[0];               // string | undefined (strict index checks)`],
            [`String greet(String n) { return "Hi " + n; }`, `function greet(n: string) { return 'Hi ' + n; }   // returns string`],
          ],
        },
        callout: {
          type: 'tip',
          body: `Hover over any variable in VS Code or IntelliJ to see the type TypeScript inferred. It's the fastest way to learn
            how the compiler thinks.`,
        },
      },
      {
        id: 'any-unknown',
        title: 'any vs. unknown',
        body: `<p>Both accept any value. <code>any</code> switches type checking off entirely, which is like casting everything to
          <code>Object</code> and calling methods by reflection. <code>unknown</code> is the safe version: you must check what it is before using it.</p>`,
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`Object value = parse(input);`, `const value: unknown = JSON.parse(input);`],
            [`// value.length();   compile error`, `value.length;                  // compile error: check it first`],
            [`if (value instanceof String s) {
    System.out.println(s.length());
}`, `if (typeof value === 'string') {
  console.log(value.length);   // OK: narrowed to string
}`],
            ['', `const risky: any = JSON.parse(input);
risky.foo.bar();               // compiles, fails at runtime`, 'Java has no switch to turn type checking off'],
          ],
        },
        callout: {
          type: 'warn',
          body: `Treat <code>any</code> as a last resort. Prefer <code>unknown</code> and narrow it. ESLint's
            <code>no-explicit-any</code> rule helps keep it out of the code base.`,
        },
      },
    ],
  },
];
