/* Beyond Java: Union Types & Narrowing, Enums → Unions, Records → Data Objects.
 * Same format as described at the top of content/topics.js. */
window.TOPIC_GROUPS = window.TOPIC_GROUPS || {};
window.TOPIC_GROUPS.beyondJava = [

  /* ================================================================== */
  {
    id: 'unions-narrowing',
    group: 'Beyond Java',
    title: 'Union Types & Narrowing',
    summary: 'Sealed hierarchies and pattern matching become discriminated unions with exhaustive checks.',
    keywords: 'union sealed permits pattern matching switch discriminated narrowing typeof in never exhaustive type guard',
    intro: `A union type says a value is one of several types: <code>string | number</code>. The compiler then
      <em>narrows</em> the type inside each <code>if</code> or <code>case</code>. Unions are TypeScript's answer to Java's
      sealed interfaces with pattern matching, and they are used everywhere.`,
    sections: [
      {
        id: 'sealed',
        title: 'Sealed interfaces → discriminated unions',
        body: `<p>Give each member of the union a shared literal property, usually <code>kind</code> or <code>type</code>.
          Checking it tells the compiler which member you have.</p>`,
        compare: {
          sel: { file: 'Shape.java (Java 21)' },
          pw: { file: 'shape.ts' },
          segs: [
            [`sealed interface Shape permits Circle, Square {}
record Circle(double radius) implements Shape {}
record Square(double side) implements Shape {}`, `type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number };`],
            [`double area(Shape s) {
    return switch (s) {
        case Circle c -> Math.PI * c.radius() * c.radius();
        case Square q -> q.side() * q.side();
    };
}`, `function area(s: Shape): number {
  switch (s.kind) {
    case 'circle': return Math.PI * s.radius ** 2;
    case 'square': return s.side ** 2;
  }
}`],
            [`Shape s = new Circle(2);`, `const s: Shape = { kind: 'circle', radius: 2 };`],
          ],
        },
      },
      {
        id: 'exhaustive',
        title: 'Exhaustive checks',
        body: `<p>Java refuses to compile a <code>switch</code> over a sealed type that misses a case. TypeScript does the same
          if the function declares its return type. To make it explicit, assign the leftover value to <code>never</code>:
          the assignment only compiles when no cases are left.</p>`,
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`// add "record Triangle(…) implements Shape" to the permits list:
// every switch over Shape that misses it stops compiling`, `function area(s: Shape): number {
  switch (s.kind) {
    case 'circle': return Math.PI * s.radius ** 2;
    case 'square': return s.side ** 2;
    default: {
      const unhandled: never = s;   // error here if a kind is missing
      throw new Error(\`Unknown shape: \${JSON.stringify(unhandled)}\`);
    }
  }
}`],
          ],
        },
      },
      {
        id: 'narrowing',
        title: 'Narrowing simple unions',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`// overloads, or Object plus instanceof
String format(Object value) {
    if (value instanceof Integer n) return String.format("%,d", n);
    return value.toString();
}`, `function format(value: string | number): string {
  if (typeof value === 'number') return value.toLocaleString();
  return value;          // narrowed to string
}`],
            [`if (response instanceof Success s) { … }`, `if ('data' in response) { … }       // narrowed by property`],
          ],
        },
      },
      {
        id: 'results',
        title: 'Results instead of exceptions',
        body: `<p>Unions make "success or failure" easy to return as a value, so callers can't forget the failure case.</p>`,
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`sealed interface Result<T> permits Ok, Err {}
record Ok<T>(T value) implements Result<T> {}
record Err<T>(String error) implements Result<T> {}`, `type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };`],
            [`Result<User> r = parseUser(json);
if (r instanceof Ok<User> ok) save(ok.value());`, `const r = parseUser(json);
if (r.ok) save(r.value);
else console.error(r.error);`],
          ],
        },
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'enums',
    group: 'Beyond Java',
    title: 'Enums → Literal Unions',
    summary: 'Most enums become unions of string literals. as const objects cover enums with data.',
    keywords: 'enum values valueOf ordinal literal union as const keyof typeof satisfies',
    intro: `TypeScript has an <code>enum</code> keyword, but most TypeScript code uses a <em>union of string literals</em>
      instead. It needs no extra runtime code, reads well in JSON and logs, and works with the exhaustive checks from the
      previous topic.`,
    sections: [
      {
        id: 'simple',
        title: 'A simple enum',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`enum Status { ACTIVE, PAUSED, STOPPED }`, `type Status = 'active' | 'paused' | 'stopped';`],
            [`Status s = Status.ACTIVE;`, `const s: Status = 'active';`],
            [`Status bad = Status.DELETED;     // compile error`, `const bad: Status = 'deleted';   // compile error`],
            [`if (s == Status.ACTIVE) { … }`, `if (s === 'active') { … }`],
          ],
        },
      },
      {
        id: 'values',
        title: 'values() and valueOf()',
        body: `<p>A union type disappears at runtime, so you can't loop over it. To keep a list of the values, start from an
          array marked <code>as const</code> and derive the type from it.</p>`,
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`enum Status { ACTIVE, PAUSED, STOPPED }`, `const STATUSES = ['active', 'paused', 'stopped'] as const;
type Status = (typeof STATUSES)[number];   // 'active' | 'paused' | 'stopped'`],
            [`for (Status s : Status.values()) { … }`, `for (const s of STATUSES) { … }`],
            [`Status s = Status.valueOf(input);   // throws if unknown`, `function toStatus(input: string): Status {
  const match = STATUSES.find(s => s === input);
  if (!match) throw new Error(\`Unknown status: \${input}\`);
  return match;
}`],
          ],
        },
      },
      {
        id: 'with-data',
        title: 'Enums with fields',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`enum Plan {
    FREE(0, 1), PRO(12, 5), TEAM(40, 50);

    final int price;
    final int seats;
    Plan(int price, int seats) {
        this.price = price;
        this.seats = seats;
    }
}`, `const PLANS = {
  free: { price: 0, seats: 1 },
  pro:  { price: 12, seats: 5 },
  team: { price: 40, seats: 50 },
} as const;

type Plan = keyof typeof PLANS;            // 'free' | 'pro' | 'team'`],
            [`int price = Plan.PRO.price;`, `const price = PLANS.pro.price;`],
            [`int price(Plan p) { return p.price; }`, `function price(p: Plan) { return PLANS[p].price; }`],
          ],
        },
        callout: {
          type: 'tip',
          body: `<code>as const</code> makes the object read-only and keeps its exact values as types. Add
            <code>satisfies Record&lt;string, { price: number; seats: number }&gt;</code> after it to check that every entry has
            the right fields.`,
        },
      },
      {
        id: 'enum-keyword',
        title: 'The enum keyword',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`enum Direction { UP, DOWN }`, `enum Direction { Up = 'UP', Down = 'DOWN' }
const d = Direction.Up;`],
          ],
        },
        callout: {
          type: 'warn',
          body: `TypeScript's <code>enum</code> generates runtime code, can't be run by tools that only strip types, and numeric
            enums behave in surprising ways. If you use it, give every member a string value, as above.`,
        },
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'records',
    group: 'Beyond Java',
    title: 'Records → Data Objects',
    summary: 'Records and Lombok @Value become types plus object literals. Copies use the spread operator.',
    keywords: 'record lombok value data class immutable with copy spread destructuring equals deep equal',
    intro: `Plain objects with a type are TypeScript's records. There's no constructor and no generated accessors: you
      write the object literal, and the compiler checks it against the type.`,
    sections: [
      {
        id: 'declaring',
        title: 'Declaring and creating',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`public record Money(String currency, long cents) {}`, `export type Money = Readonly<{ currency: string; cents: number }>;`],
            [`Money price = new Money("EUR", 1999);`, `const price: Money = { currency: 'EUR', cents: 1999 };`],
            [`price.cents()`, `price.cents`],
            [`public record Money(String currency, long cents) {
    public Money {
        if (cents < 0) throw new IllegalArgumentException();
    }
}`, `function money(currency: string, cents: number): Money {
  if (cents < 0) throw new RangeError('cents must be >= 0');
  return { currency, cents };      // shorthand for currency: currency
}`],
          ],
        },
      },
      {
        id: 'copying',
        title: 'Copies and "withers"',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`Money doubled = new Money(price.currency(), price.cents() * 2);`, `const doubled = { ...price, cents: price.cents * 2 };`],
            [`// Lombok: price.toBuilder().currency("USD").build()`, `const inDollars = { ...price, currency: 'USD' };`],
            [`var currency = price.currency();
var cents = price.cents();`, `const { currency, cents } = price;     // destructuring`],
          ],
        },
        callout: {
          type: 'warn',
          body: `<code>{ ...obj }</code> is a <em>shallow</em> copy: nested objects and arrays are shared with the original.
            Use <code>structuredClone(obj)</code> for a deep copy.`,
        },
      },
      {
        id: 'equality',
        title: 'Equality',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`new Money("EUR", 5).equals(new Money("EUR", 5))   // true`, `{ currency: 'EUR', cents: 5 } === { currency: 'EUR', cents: 5 }   // false`],
            ['', `import { isDeepStrictEqual } from 'node:util';
isDeepStrictEqual(a, b);                 // true when contents match`, 'Records generate equals()'],
          ],
        },
      },
    ],
  },
];
