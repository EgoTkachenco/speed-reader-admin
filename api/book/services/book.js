"use strict";
const fs = require("fs");
const path = require("path");
const readline = require("readline");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  async findOneText({ id }, { _start = 0, _limit = -1, size = 40 }) {
    if (!id) throw new Error("id required");

    const book = await strapi.query("book").findOne({ id });
    if (!book) throw new Error("Book not found");

    const filepath = path.join(__dirname, "../../../public", book.file.url);
    // const result = await getFileLines(filepath, _start, _limit);
    const result = await strapi.services["book-file"].getFileFormatedText(
      filepath,
      _start,
      _limit,
      size
    );
    return result;
  },
};

async function getFileLines(path_to_file, start, lines) {
  lines = Number(lines);
  if (isNaN(lines)) lines = -1;

  start = Number(start);
  if (isNaN(start)) start = 0;

  let rl = readline.createInterface({
    input: fs.createReadStream(path_to_file),
  });
  let current_line = 0;
  let result = [];

  for await (const line of rl) {
    if (current_line >= start) result.push(line);
    current_line++;
    if (lines !== -1 && current_line > start + lines) return result;
  }

  return result;
}
