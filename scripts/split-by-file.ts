import fs from "fs";
import { Commit } from "../types/commit";
import { getFiles } from "../utils/files";
import { SAMPLES_DIR } from "../constants";

const OUTPUT_DIR = "data/split-by-file";

for (const file of getFiles(OUTPUT_DIR)) {
  fs.rmSync(`${OUTPUT_DIR}/${file.name}`, { force: true, recursive: true });
}

console.log("Separando commits por arquivo");
for (const file of getFiles()) {
  const buffer = fs.readFileSync(`${SAMPLES_DIR}/${file.name}`);

  let content = JSON.parse(buffer.toString()) as Commit[];

  const data: Record<string, Commit[]> = {};

  content.forEach((commit: Commit) => {
    const key = `${commit.repo}:${commit.mods[0].old_path}`;

    if (!data[key]) {
      data[key] = [];
    }

    data[key].push(commit);
  });

  fs.writeFileSync(`${OUTPUT_DIR}/${file.name}`, JSON.stringify(data));

  console.log(`Processado: ${file.name}`);
}
