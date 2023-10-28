import fs from "fs";
import { Commit } from "./commit.interface";
import { BATCH_SIZE } from "./constants";
import { getFiles } from "./utils/files";

const FILE = "../../database/CommitChronicle/train.jsonl";
const OUTPUT_DIR = "data/batches";

// Limpa os arquivos existentes no diretório 'data/batches'
for (const file of getFiles(OUTPUT_DIR)) {
  fs.rmSync(`${OUTPUT_DIR}/${file.name}`, { force: true, recursive: true });
}

const stream = fs.createReadStream(FILE, { autoClose: true, emitClose: true });
let raw: Array<any> = [];
let permIndex = 0;
let buf = "";
let processed: Array<Commit> = [];

const writeBatchToFile = (end?: boolean) => {
  console.log("Writting:", raw.length);
  let index = 0;

  // if (raw[index]) {
  // if (typeof raw[index] !== "string") {
  //   console.log(raw[index]);
  // }
  //   let str = raw[index].toString();
  //   console.log(`First: ${str.substr(0, 20)} ... ${str.substr(-20)}`);
  // }
  // if (raw[raw.length - 1]) {
  //   let str = raw[raw.length - 1].toString();
  //   console.log(
  //     `Last: ${str.substr(0, 20)} ... ${str.substr(str.length - 20)}`
  //   );
  // }

  // Para cada texto no array raw, tenta transformá-lo para JSON e processá-lo
  // pode ser que falhe caso o texo esteja incompleto, neste caso
  // acumula-se o texto ao final do buffer 'buf'
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

  // console.log(
  //   "Idx:",
  //   index,
  //   "; Buf:",
  //   `${buf.substring(0, 20)} ... ${buf.substring(buf.length - 20)}`
  // );

  try {
    raw.splice(index - 1);
    let items: Array<Commit> = raw.splice(0);

    console.log(items.length, !!buf.length, raw.length);

    // Remove os commits com modificações em mais de um arquivo
    // e os commits de adição/remoção (em que os caminhos mudam)
    items = items.filter(
      (commit) =>
        commit.mods.length === 1 &&
        commit.mods[0].new_path === commit.mods[0].old_path
    );

    processed.push(...items.splice(0));

    // Ordena os commits processados por timestamp e salva em um batch
    if (processed.length >= BATCH_SIZE || end) {
      const batch = processed.splice(0, BATCH_SIZE);
      const toIndex = batch.length - 1 + permIndex;
      const batchSize = batch.length;

      batch.sort((a, b) => a.timestamp - b.timestamp);

      const obj: Record<string, Commit> = {};

      do {
        const commit = batch.pop();
        obj[commit.hash] = commit;
      } while (batch.length > 0);

      fs.writeFileSync(
        `${OUTPUT_DIR}/from_${permIndex}_to_${toIndex}.json`,
        JSON.stringify(obj, null, 2)
      );

      permIndex += batchSize;
    }

    console.log("Processed:", processed.length);
  } catch (err) {
    console.log("[ERR]", err);
  }
};

// Para cada chunk lido, separa o texto nas quebras de linha e adiciona ao array raw
stream.on("data", (chunk) => {
  let samples = chunk.toString().split("\n");
  raw.push(...samples);

  if (raw.length >= BATCH_SIZE) {
    writeBatchToFile();
  }
});

stream.on("end", () => {
  writeBatchToFile(true);
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
