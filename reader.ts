import fs from "fs";
import { Commit } from "./commit.interface";

const FILE = "../../database/CommitChronicle/train.jsonl";
const OUTPUT_DIR = "data/batches";
const BATCH_SIZE = 50000;

const stream = fs.createReadStream(FILE);
let raw: Array<any> = [];
let permIndex = 0;
let buf = "";
let processed: Array<Commit> = [];

const writeBatchToFile = () => {
  let index = 0;

  for (const line of raw) {
    try {
      raw[index] = JSON.parse(buf + line);
      const [rawDate, rawTime] = raw[index].date.split(" ");
      const [d, M, y] = rawDate.split(".");
      raw[index].timestamp = new Date(
        `${y}-${M}-${d}T${rawTime}.000Z`
      ).getTime();
      buf = "";
      index++;
    } catch (err) {
      buf += line;
    }
  }

  raw.splice(index);
  let items: Array<Commit> = raw.splice(0, index - 1);

  console.log(items.length, !!buf.length, raw.length);

  items = items.filter(
    (commit) =>
      commit.mods.length === 1 &&
      commit.mods[0].new_path === commit.mods[0].old_path
  );

  processed.push(...items);

  if (processed.length >= BATCH_SIZE) {
    processed.sort((a, b) => a.timestamp - b.timestamp);
    fs.writeFileSync(
      `${OUTPUT_DIR}/from_${permIndex}_to_${index + permIndex}.json`,
      JSON.stringify(processed, null, 2)
    );
    processed.splice(0);
  }

  permIndex += index;
};

stream.on("data", (chunk) => {
  raw.push(...chunk.toString().split("\n"));

  if (raw.length >= BATCH_SIZE) {
    writeBatchToFile();
  }
});

stream.on("end", () => {
  writeBatchToFile();
  console.log("[STREAM] End");
  process.exit(0);
});

stream.on("close", () => {
  writeBatchToFile();
  console.log("[STREAM] Close");
  process.exit(0);
});

stream.on("error", (error) => {
  console.log("[STREAM] Error", error);
  process.exit(0);
});
