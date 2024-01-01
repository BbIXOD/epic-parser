// src/app.ts
import { Command } from "commander";
import { collect } from "metautil";

// src/reader.ts
import { createReadStream, statSync } from "fs";
async function* readStream(path, splitter = "\n") {
  const stream = createReadStream(path);
  let last = "";
  for await (const chunk of stream) {
    const splited = (last + chunk).split(splitter);
    for (let i = 0; i < splited.length - 1; i++) {
      yield splited[i];
    }
    last = splited[splited.length - 1];
  }
  if (last !== "")
    yield last;
}
async function* readStreamWithPersents(path, splitter = "\n") {
  const stream = readStream(path, splitter);
  const streamSize = statSync(path).size;
  let readSize = 0;
  for await (const chunk of stream) {
    readSize += chunk.length;
    yield { persent: streamSize / readSize * 100, content: chunk };
  }
}

// src/Parser.ts
var Parser = class {
  values;
  quantities;
  constructor() {
    this.values = /* @__PURE__ */ new Set();
    this.quantities = /* @__PURE__ */ new Map();
  }
  add(value) {
    if (this.values.has(value)) {
      this.quantities.set(value, this.quantities.get(value) + 1);
    } else {
      this.values.add(value);
      this.quantities.set(value, 1);
    }
  }
  getValues() {
    return this.values;
  }
  getQuantities() {
    return this.quantities;
  }
  getQuantityOf(value) {
    return this.quantities.has(value) ? this.quantities.get(value) : 0;
  }
  getByQuantity(min, max) {
    const result = [];
    for (const [key, value] of this.quantities) {
      if (value >= min && value <= max) {
        result.push(key);
      }
    }
    return result;
  }
};

// src/app.ts
var parser = new Parser();
var program = new Command();
var readFile = async (file, show, parser2) => {
  const stream = show ? readStreamWithPersents(file) : readStream(file);
  for await (const chunk of stream) {
    const data = show ? chunk.content : chunk;
    parser2.add(data.trim());
    console.log(parser2.getValues());
  }
};
var parse = (action, parser2) => async (files, show) => {
  const dc = collect(files);
  for (const file of files)
    dc.wait(file, readFile, file, show, parser2);
  await dc;
  console.log(action());
};
program.name("epic-parser").version("1.0.0").description("Fast file parsing program (and maybe more)");
program.command("unique").description("Get unique values").arguments("<files...>").option("-s", "--show", "Show progress").action(parse(parser.getValues.bind(parser), parser));
program.command("count").description("Get count for each unique value").arguments("<files...>").option("-s", "--show", "Show progress").action(parse(parser.getQuantities, parser));
program.command("amount").description("Get amount of given value").arguments("<files...>").requiredOption("-v, --value <value>", "Value to count").option("-s", "--show", "Show progress").action(parse(parser.getQuantityOf.bind(parser, program.opts().value), parser));
program.parse(process.argv);
