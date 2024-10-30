const fs = require("fs");
const readline = require("readline");

module.exports = {
  async getFileFormatedText(path_to_file, start, limit, row_size) {
    let rl = readline.createInterface({
      input: fs.createReadStream(path_to_file),
    });
    const book_formater = new BookFormater(row_size);
    let i = 0;
		for await (let line of rl) {
			book_formater.handleNewLine(line);
      // if (i >= +start) book_formater.handleNewLine(line);
			// if (i > +start + +limit) break;
      i++;
    }

    return book_formater.get_text().slice(start, +start + +limit);
  },
};

/*
	formater should handle new line format it and add new rows in text
*/
class BookFormater {
  line_size = 50; // default line size
  text = null;
  tail = null;

  constructor(line_size) {
    this.line_size = line_size;
    this.text = [];
    this.tail = [];
  }

  handleNewLine(line) {
    // add line break for empty line
    if (line.trim().length === 0) {
      return this.addEmptyLine();
    }
    // make line centered
    if (line.length > 1 && line.startsWith("  ")) {
      return this.addCenteredLine(line);
    }

    return this.addLine(line);
  }

	addEmptyLine() {
		if (this.tail.length > 0) {
			// finish row with tail
			this.text.push(this.tail.join(" "));
			this.tail = [];
		}
		this.text.push('');
  }

  addCenteredLine(line) {
    if (this.tail.length > 0) this.text.push(this.tail.join(" "));
    this.tail = [];

    let text = line.trim().split(" ");

    for (let i = 0; i < text.length; i++) {
      if ([...this.tail, text[i]].join(" ").length < this.line_size) {
        this.tail.push(text[i]);
      } else {
        const spaces_size = Math.floor(
          (this.line_size - this.tail.join(" ").length) / 2
        );
        const centered_line = new Array(spaces_size)
          .fill(" ")
          .join("")
          .concat(this.tail.join(" "));
        this.tail = [text[i]];
        this.text.push(centered_line);
      }
    }
    if (this.tail.length > 0) {
      const spaces_size = Math.floor(
        (this.line_size - this.tail.join(" ").length) / 2
      );
      const centered_line = new Array(spaces_size)
        .fill(" ")
        .join("")
        .concat(this.tail.join(" "));
      this.tail = [];
      this.text.push(centered_line);
    }
  }

  addLine(line = "") {
    let text = [...this.tail, ...line.split(" ")];
    let row = [];
    for (let i = 0; i < text.length; i++) {
      const word = text[i];
      if ([...row, word].join(" ").length < this.line_size) {
        row.push(word);
        continue;
      }
      this.text.push(row.join(" "));
      row = [word];
    }
    this.tail = row;
  }

  get_text_size() {
    return this.text.length;
  }

  get_text() {
    return this.text;
  }
}
