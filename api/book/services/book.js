"use strict";
const fs = require("fs");
const path = require("path");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  async findOneText({ id }, { _start = 0, _limit = -1 }) {
    if (!id) throw new Error("id required");

    const book = await strapi.query("book").findOne({ id });
    if (!book) throw new Error("Book not found");

    const filepath = path.join(__dirname, "../../../public", book.file.url);
    const content = fs.readFileSync(filepath, "utf-8");

    return content.split(" ").slice(_start, _limit);
  },
};
