"use strict";

const createError = require("../common/parser-create-error");

function parse(text, parsers, opts) {
  // Inline the require to avoid the module if we don't use it
  const coffeescript = require("coffeescript");

  const coffeescriptOptions = {
    nodes: true
  };

  let ast = coffeescript.compile(text, coffeescriptOptions);

  // TODO: Any cleanup of the AST?

  return ast;
}

module.exports = parse;
