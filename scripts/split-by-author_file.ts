import fs from "fs";
import { Commit } from "../commit.interface";
import { SAMPLES_DIR } from "../constants";
import { getFiles } from "../utils/files";

const OUTPUT_DIR = "data/split-by-author_file";

for (const file of getFiles(OUTPUT_DIR)) {
  fs.rmSync(`${OUTPUT_DIR}/${file.name}`, { force: true, recursive: true });
}

console.log("Separando commits por autor e arquivo");
for (const file of getFiles()) {
  const buffer = fs.readFileSync(`${SAMPLES_DIR}/${file.name}`);

  const content = JSON.parse(buffer.toString()) as Commit[];

  const author_file: Record<string, Commit[]> = {};

  content.forEach((commit) => {
    commit.mods.forEach((modification) => {
      const key = `${modification.old_path}:${commit.author}`;

      if (!author_file[key]) {
        author_file[key] = [];
      }

      author_file[key].push(commit);
    });
  });

  fs.writeFileSync(`${OUTPUT_DIR}/${file.name}`, JSON.stringify(author_file));

  console.log(`Processado: ${file.name}`);
}
