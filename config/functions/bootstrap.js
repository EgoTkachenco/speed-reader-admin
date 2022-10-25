"use strict";
const fs = require("fs");
const path = require("path");
const readline = require("readline");

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#bootstrap
 */

module.exports = () => {
  addWordsCountToBooks();
};

async function addWordsCountToBooks() {
  const files = await strapi.plugins.upload.services.upload.fetchAll();
  console.log(`Fetched ${files.lenght} files`);
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.ext !== ".txt" || file.formats["book-words-size"]) continue;
    console.log("Updating ", file.name);
    const fileData = { formats: file.formats };
    const { lines_count, words_count } = await getFileLinesCount(
      path.join(__dirname, "../../public", file.url)
    );
    fileData.formats["book-size"] = lines_count;
    fileData.formats["book-words-size"] = words_count;
    console.log(
      `Calculated.\n Lines Count: ${lines_count}, Words Count: ${words_count}`
    );
    await strapi.query("file", "upload").update({ id: file.id }, fileData);
  }
}

async function getFileLinesCount(path_to_file) {
  let rl = readline.createInterface({
    input: fs.createReadStream(path_to_file),
  });
  let current_line = 0;
  let words_count = 0;

  for await (const line of rl) {
    current_line++;
    words_count += line.trim().split(" ").length;
  }
  return { lines_count: current_line, words_count };
}
