import type { CodeLanguage } from "@/data/csharp-course";

/**
 * A dependency-free syntax highlighter, sized for teaching snippets rather
 * than for an editor. It tokenises line by line and returns plain data, so
 * the renderer can build React elements — nothing is ever injected as HTML.
 *
 * Multi-line constructs (block comments, raw string literals) are not tracked
 * across lines on purpose: the course snippets do not use them, and the
 * line-independent approach keeps this small and impossible to get stuck in.
 */

export type TokenType =
  | "comment"
  | "string"
  | "keyword"
  | "type"
  | "number"
  | "plain";

export type Token = { text: string; type: TokenType };

const CSHARP_KEYWORDS = [
  "abstract", "as", "async", "await", "base", "bool", "break", "byte", "case",
  "catch", "char", "checked", "class", "const", "continue", "decimal",
  "default", "delegate", "do", "double", "else", "enum", "event", "explicit",
  "extern", "false", "finally", "fixed", "float", "for", "foreach", "get",
  "global", "goto", "if", "implicit", "in", "init", "int", "interface",
  "internal", "is", "lock", "long", "nameof", "namespace", "new", "not",
  "null", "object", "operator", "out", "override", "params", "partial",
  "private", "protected", "public", "readonly", "record", "ref", "required",
  "return", "sbyte", "sealed", "set", "short", "sizeof", "stackalloc",
  "static", "string", "struct", "switch", "this", "throw", "true", "try",
  "typeof", "uint", "ulong", "unchecked", "unsafe", "ushort", "using",
  "var", "virtual", "void", "volatile", "when", "where", "while", "yield",
];

const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "JOIN", "INNER", "LEFT", "RIGHT", "OUTER", "ON",
  "GROUP", "BY", "ORDER", "HAVING", "LIMIT", "OFFSET", "INSERT", "INTO",
  "VALUES", "UPDATE", "SET", "DELETE", "CREATE", "TABLE", "INDEX", "ALTER",
  "DROP", "AS", "AND", "OR", "NOT", "NULL", "DISTINCT", "COUNT", "SUM", "ASC",
  "DESC",
];

/** Alternation source for a keyword list, longest-first so "int" cannot
    win over "interface". */
function keywordPattern(words: string[]): string {
  return [...words].sort((a, b) => b.length - a.length).join("|");
}

const PATTERNS: Record<CodeLanguage, RegExp> = {
  csharp: new RegExp(
    [
      String.raw`(?<comment>\/\/.*$)`,
      // """ opens/closes a raw string; the ordinary forms cover $"", @"" and chars
      String.raw`(?<string>"""|[@$]{0,2}"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')`,
      String.raw`(?<number>\b\d[\d_]*(?:\.\d+)?[fdmMLu]?\b)`,
      String.raw`(?<keyword>\b(?:${keywordPattern(CSHARP_KEYWORDS)})\b)`,
      // Convention, not analysis: PascalCase means a type or a member
      String.raw`(?<type>\b[A-Z][A-Za-z0-9_]*\b)`,
    ].join("|"),
    "gm"
  ),
  bash: new RegExp(
    [
      String.raw`(?<comment>#.*$)`,
      String.raw`(?<string>"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')`,
      // Flags read as the "keyword" of a command line
      String.raw`(?<keyword>(?:^|\s)--?[A-Za-z][\w-]*)`,
      String.raw`(?<number>\b\d+(?:\.\d+)*\b)`,
    ].join("|"),
    "gm"
  ),
  json: new RegExp(
    [
      String.raw`(?<string>"(?:[^"\\]|\\.)*")`,
      String.raw`(?<number>\b-?\d+(?:\.\d+)?\b)`,
      String.raw`(?<keyword>\b(?:true|false|null)\b)`,
    ].join("|"),
    "gm"
  ),
  xml: new RegExp(
    [
      String.raw`(?<comment><!--.*?-->)`,
      String.raw`(?<string>"(?:[^"\\]|\\.)*")`,
      String.raw`(?<keyword><\/?[A-Za-z][\w.-]*|\/?>)`,
      String.raw`(?<type>\b[A-Za-z][\w.-]*(?==))`,
    ].join("|"),
    "gm"
  ),
  sql: new RegExp(
    [
      String.raw`(?<comment>--.*$)`,
      String.raw`(?<string>'(?:[^'\\]|\\.)*')`,
      String.raw`(?<keyword>\b(?:${keywordPattern(SQL_KEYWORDS)})\b)`,
      String.raw`(?<number>\b\d+(?:\.\d+)?\b)`,
    ].join("|"),
    "gim"
  ),
  // Dockerfiles, YAML, and the plain-text diagrams: comments only
  text: new RegExp(String.raw`(?<comment>#.*$)`, "gm"),
};

function tokenizeLine(line: string, language: CodeLanguage): Token[] {
  const pattern = PATTERNS[language];
  // Shared regex objects are stateful with the g flag; reset before each line.
  pattern.lastIndex = 0;

  const tokens: Token[] = [];
  let cursor = 0;

  for (const match of line.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      tokens.push({ text: line.slice(cursor, index), type: "plain" });
    }

    const groups = match.groups ?? {};
    const type =
      (Object.keys(groups).find((key) => groups[key] !== undefined) as
        | TokenType
        | undefined) ?? "plain";

    tokens.push({ text: match[0], type });
    cursor = index + match[0].length;
  }

  if (cursor < line.length) {
    tokens.push({ text: line.slice(cursor), type: "plain" });
  }

  // An empty line still needs a token so it takes up a row.
  return tokens.length > 0 ? tokens : [{ text: "", type: "plain" }];
}

/** One array of tokens per line of source. */
export function tokenize(code: string, language: CodeLanguage = "csharp"): Token[][] {
  return code.replace(/\t/g, "    ").split("\n").map((line) => tokenizeLine(line, language));
}

/** Token colours, tuned for the dark violet page background. */
export const TOKEN_CLASS: Record<TokenType, string> = {
  comment: "text-slate-500 italic",
  string: "text-amber-300/90",
  keyword: "text-violet-300",
  type: "text-sky-300",
  number: "text-emerald-300",
  plain: "text-slate-200",
};
