"use strict";

const docBuilders = require("../doc").builders;
const concat = docBuilders.concat;
const hardline = docBuilders.hardline;

function embed(path, print, textToDoc, options) {
  return concat([path]);
}

module.exports = embed;
