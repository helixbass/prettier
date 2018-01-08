"use strict";

const embed = require("./embed");

const util = require("util");

function genericPrint(path, options, print) {
  console.log(util.inspect(path, {colors: true, depth: 10}));
  return "";
}

const clean = (ast, newObj) => {

};

module.exports = {
	print: genericPrint,
	embed,
  massageAstNode: clean
};
