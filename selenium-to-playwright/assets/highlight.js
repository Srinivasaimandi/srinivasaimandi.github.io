/* Tiny, dependency-free syntax highlighter for the languages used in this guide:
 * java, ts, shell, xml, text. Good enough for teaching snippets — not a full parser. */
(function () {
  'use strict';

  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const span = (cls, s) => `<span class="tk-${cls}">${esc(s)}</span>`;
  const words = s => new Set(s.trim().split(/\s+/));

  const KEYWORDS = {
    java: words(`abstract boolean break byte case catch char class continue default do double else
      enum extends final finally float for if implements import instanceof int interface long new
      null package private protected public return short static super switch this throw throws
      true false try var void while`),
    ts: words(`as async await break case catch class const continue default delete do else export
      extends false finally for from function if import in instanceof interface let new null of
      return static super switch this throw true try type typeof undefined var void while yield`),
  };

  function tokenize(code, re, classify) {
    let out = '';
    let last = 0;
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(code))) {
      if (m[0] === '') { re.lastIndex++; continue; }
      out += esc(code.slice(last, m.index)) + classify(m, code, re.lastIndex);
      last = re.lastIndex;
    }
    return out + esc(code.slice(last));
  }

  // 1 comment | 2 string | 3 annotation | 4 number | 5 identifier | 6 regex literal
  const CLIKE = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|(@[A-Za-z][\w.]*)|(\b\d[\d_]*(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(\/(?![/*\s])(?:\\.|[^/\\\n])+\/[dgimsuy]*)/g;

  function clike(lang) {
    const kw = KEYWORDS[lang];
    return (m, code, end) => {
      if (m[1]) return span('com', m[0]);
      if (m[2]) return span('str', m[0]);
      if (m[3]) return lang === 'java' ? span('ann', m[0]) : esc(m[0]);
      if (m[4]) return span('num', m[0]);
      if (m[5]) {
        const w = m[5];
        if (kw.has(w)) return span('kw', w);
        if (/^[A-Z][A-Z0-9_]+$/.test(w)) return span('num', w);   // CONSTANTS
        if (/^[A-Z]/.test(w)) return span('type', w);            // Types
        if (/^\s*\(/.test(code.slice(end, end + 8))) return span('fn', w);
        return esc(w);
      }
      return span('str', m[0]);                                  // regex literal
    };
  }

  // 1 comment | 2 string | 3 flag | 4 command (first word on a line)
  const SHELL = /(#[^\n]*)|("[^"\n]*"|'[^'\n]*')|((?<=\s)--?[A-Za-z][\w-]*)|(^[\w.@-]+)/gm;
  const shell = m =>
    m[1] ? span('com', m[0]) :
    m[2] ? span('str', m[0]) :
    m[3] ? span('num', m[0]) : span('fn', m[0]);

  // 1 comment | 2 open bracket + 3 tag name | 4 close bracket | 5 string | 6 ${property}
  const XML = /(<!--[\s\S]*?-->)|(<\/?)([\w.:-]+)|(\/?>)|("[^"]*")|(\$\{[^}]+\})/g;
  const xml = m =>
    m[1] ? span('com', m[0]) :
    m[2] ? esc(m[2]) + span('kw', m[3]) :
    m[4] ? esc(m[0]) :
    m[5] ? span('str', m[0]) : span('num', m[0]);

  // 1 comment | 2 indent/dash + 3 key | 4 string | 5 ${{ expression }}
  const YAML = /(#[^\n]*)|(^[ \t-]*)([\w./-]+)(?=:(?:\s|$))|("[^"\n]*"|'[^'\n]*')|(\$\{\{[^}]*\}\})/gm;
  const yaml = m =>
    m[1] ? span('com', m[0]) :
    m[3] ? esc(m[2]) + span('kw', m[3]) :
    m[4] ? span('str', m[0]) : span('fn', m[0]);

  window.highlight = function (code, lang) {
    switch (lang) {
      case 'yaml': return tokenize(code, YAML, yaml);
      case 'java': return tokenize(code, CLIKE, clike('java'));
      case 'ts': return tokenize(code, CLIKE, clike('ts'));
      case 'shell': return tokenize(code, SHELL, shell);
      case 'xml': return tokenize(code, XML, xml);
      default: return esc(code);
    }
  };
})();
