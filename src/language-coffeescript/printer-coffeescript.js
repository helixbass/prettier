"use strict";

const privateUtil = require("../common/util");
const embed = require("./embed");

const doc = require("../doc");
const docBuilders = doc.builders;
const {
  concat,
  group,
  hardline,
  ifBreak,
  indent,
  join,
  line,
  softline
} = docBuilders;

const util = require("util");

function genericPrint(path, options, print) {
  // console.log(util.inspect(path, { depth: 10 }));
  const n = path.getValue();

  if (!n) {
    return "";
  }

  if (typeof n === "string") {
    return n;
  }

  let parts = [];
  switch (n.type) {
    case "File":
      return path.call(print, "program");
    case "Program":
      parts.push(
        path.call(bodyPath => {
          return printStatementSequence(bodyPath, options, print);
        }, "body")
      );

      if (n.body.length) {
        parts.push(hardline);
      }

      return concat(parts);
    case "ExpressionStatement":
      return path.call(print, "expression");
    case "ArrayExpression":
      parts.push(
        group(
          concat([
            "[",
            indent(
              concat([
                softline,
                printArrayItems(path, options, "elements", print)
              ])
            ),
            softline,
            "]"
          ])
        )
      );
      return concat(parts);
    case "Identifier":
      return concat([n.name]);
    case "MemberExpression":
      return concat([
        path.call(print, "object"),
        printMemberLookup(path, options, print)
      ]);
    case "FunctionExpression":
      parts.push(group(printFunctionParams(path, print, options)));

      parts.push(n.bound ? "=>" : "->");

      const body = path.call(bodyPath => print(bodyPath), "body");

      return group(concat([concat(parts), " ", body]));
    case "BlockStatement":
      const naked = path.call(bodyPath => {
        return printStatementSequence(bodyPath, options, print);
      }, "body");

      const shouldInline = n.body.length === 1;
      if (shouldInline) {
        parts.push(naked);
      } else {
        parts.push(indent(concat([hardline, naked])));
      }

      return concat(parts);
    case "NumericLiteral":
      return privateUtil.printNumber(n.extra.raw);
    case "StringLiteral":
      return nodeStr(n, options);
  }
}

function printFunctionParams(path, print, options) {
  const fun = path.getValue();

  if (!(fun.params && fun.params.length)) {
    return concat([]); // TODO: is this the right way to return "empty"?
  }

  let printed = path.map(print, "params");

  return concat([
    "(",
    indent(concat([softline, join(concat([ifBreak("", ","), line]), printed)])),
    softline,
    ") "
  ]);
}

function printOptionalToken(path) {
  const node = path.getValue();
  if (!node.optional) {
    return "";
  }
  return "?";
}

function printMemberLookup(path, options, print) {
  const property = path.call(print, "property");
  const n = path.getValue();
  const optional = printOptionalToken(path);

  return concat([optional, ".", property]);
}

function printStatementSequence(path, options, print) {
  const printed = [];

  const bodyNode = path.getNode();

  path.map((stmtPath, i) => {
    const stmt = stmtPath.getValue();

    if (!stmt) {
      return;
    }

    const stmtPrinted = print(stmtPath);
    const parts = [];

    parts.push(stmtPrinted);

    printed.push(concat(parts));
  });

  return join(hardline, printed);
}

function printArrayItems(path, options, printPath, print) {
  const printedElements = [];
  let separatorParts = [];

  path.each(childPath => {
    printedElements.push(concat(separatorParts));
    printedElements.push(print(childPath));

    separatorParts = [ifBreak("", ","), line];
  }, printPath);

  return concat(printedElements);
}

function nodeStr(node, options) {
  const raw = rawText(node);
  return privateUtil.printString(raw, options);
}

function rawText(node) {
  return node.extra ? node.extra.raw : node.raw;
}

const clean = (ast, newObj) => {};

module.exports = {
  print: genericPrint,
  embed,
  massageAstNode: clean
};
