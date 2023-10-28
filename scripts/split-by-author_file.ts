import fs from "fs";
import { Commit } from "../commit.interface";
import { SAMPLES_DIR } from "../constants";
import { getFiles } from "../utils/files";

const OUTPUT_DIR = "data/split-by-author_file";

for (const file of getFiles(OUTPUT_DIR)) {
  fs.rmSync(`${OUTPUT_DIR}/${file.name}`, { force: true, recursive: true });
}

for (const file of getFiles()) {
  const buffer = fs.readFileSync(`${SAMPLES_DIR}/${file.name}`);

  const content = Object.values(
    JSON.parse(buffer.toString()) as Record<string, Commit>
  );

  const author_file: Record<string, string[]> = {};

  // Para cada modificação de cada commit, cria uma chave concatenando
  // o autor e o nome do arquivo, e referencia o commit
  // caso o arquivo tenha trocado de nome, referencia o commit em ambos nomes
  content.forEach((commit) => {
    commit.mods.forEach((mod) => {
      if (mod.old_path) {
        const key = `${commit.author}:${mod.old_path}`;
        if (!author_file[key]) {
          author_file[key] = [];
        }
        author_file[key].push(commit.hash);
      }

      if (mod.new_path && mod.old_path !== mod.new_path) {
        const key = `${commit.author}:${mod.new_path}`;
        if (!author_file[key]) {
          author_file[key] = [];
        }
        author_file[key].push(commit.hash);
      }
    });
  });

  fs.writeFileSync(
    `${OUTPUT_DIR}/${file.name}`,
    JSON.stringify(author_file, null, 2)
  );

  console.log(`Processed file: ${file.name}`);
}
