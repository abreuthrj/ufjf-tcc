import fs from "fs";
import { Commit } from "./commit.interface";
import { BATCH_SIZE } from "./constants";
import { getFiles } from "./utils/files";

const FILE = "../../database/CommitChronicle/train.jsonl";
const OUTPUT_DIR = "data/batches";

for (const file of getFiles(OUTPUT_DIR)) {
  fs.rmSync(`${OUTPUT_DIR}/${file.name}`, { force: true, recursive: true });
}

const stream = fs.createReadStream(FILE, { autoClose: true, emitClose: true });
let raw: Array<any> = [];
let permIndex = 0;
let buf = "";
let processed: Array<Commit> = [];

const writeBatchToFile = (end?: boolean) => {
  console.log("Processando lote:", raw.length);
  let index = 0;

  // Para cada trecho de texto lido, tenta transformar em objeto
  // caso não consiga, concatena ao final de 'buf'
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

  try {
    raw.splice(index - 1);
    let items: Array<Commit> = raw.splice(0);

    // Remove os commits com modificações em mais de um arquivo
    // e os commits de adição/remoção de arquivo
    items = items.filter(
      (commit) =>
        commit.mods.length === 1 &&
        commit.mods[0].new_path === commit.mods[0].old_path
    );

    processed.push(...items.splice(0));

    if (processed.length >= BATCH_SIZE || end) {
      const commits = processed.splice(0, BATCH_SIZE);
      const lastIndex = commits.length - 1 + permIndex;
      const commitsLength = commits.length;

      // Ordena os commits de acordo com o timestamp
      commits.sort((a, b) => a.timestamp - b.timestamp);

      fs.writeFileSync(
        `${OUTPUT_DIR}/from_${permIndex}_to_${lastIndex}.json`,
        JSON.stringify(commits)
      );

      permIndex += commitsLength;
    }

    console.log("Restante:", processed.length);
  } catch (err) {
    console.log("[ERRO]", err);
  }
};

stream.on("data", (chunk) => {
  let samples = chunk.toString().split("\n");
  raw.push(...samples);

  if (raw.length >= BATCH_SIZE) {
    writeBatchToFile();
  }
});

stream.on("end", () => {
  writeBatchToFile(true);
  console.log("[STREAM] Fim");
  process.exit(0);
});

stream.on("close", () => {
  writeBatchToFile();
  console.log("[STREAM] Fechada");
  process.exit(0);
});

stream.on("error", (error) => {
  console.log("[STREAM] Erro", error);
  process.exit(0);
});
