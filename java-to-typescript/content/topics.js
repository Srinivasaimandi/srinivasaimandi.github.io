/* Content for the Java → TypeScript guide.
 *
 * Each file in content/ adds one group to window.TOPIC_GROUPS; this file sets the menu order.
 *
 * Topic:    { id, group, title, summary, keywords?, intro, sections: [...] }   or   { group, title, soon: true }
 * Section:  { id, title, body?, compare?, table?, callout? (one or an array) }
 * compare:  { sel: { file, lang }, pw: { file, lang }, segs: [[javaCode, typescriptCode, placeholder?], ...] }
 *           ("sel" is the Java side and "pw" the TypeScript side: names kept from the engine's first guide.)
 *           Each pair renders on one row so equivalent lines line up. Use '' when a side has no counterpart;
 *           the optional third item replaces the default "not needed / no equivalent" text.
 *           Langs: java (default left), ts (default right), shell, xml, json, yaml, text.
 * table:    rows of [task, javaCode, typescriptCode], or a string for a group heading.
 * callout:  { type: 'diff' | 'tip' | 'warn' | 'pw', title?, body }   ('pw' = "TypeScript-only")
 *
 * Code lives in template literals: write it flush-left, escape "${" as "\${" and backticks as "\`",
 * and avoid other backslashes.
 */
window.TOPICS = [
  ...window.TOPIC_GROUPS.gettingStarted, // content/getting-started.js
  ...window.TOPIC_GROUPS.core,           // content/core-language.js
  ...window.TOPIC_GROUPS.collections,    // content/collections.js
  ...window.TOPIC_GROUPS.oop,            // content/oop.js
  ...window.TOPIC_GROUPS.beyondJava,     // content/beyond-java.js
  ...window.TOPIC_GROUPS.errorsAsync,    // content/errors-async.js
  ...window.TOPIC_GROUPS.ecosystem,      // content/ecosystem.js
  ...window.TOPIC_GROUPS.reference,      // content/reference.js
];
