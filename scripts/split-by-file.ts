import fs from "fs";
import { Commit } from "../commit.interface";
import { getFiles } from "../utils/files";
import { SAMPLES_DIR } from "../constants";

const OUTPUT_DIR = "data/split-by-file";

// Limpa todos os arquivos da pasta
for (const file of getFiles(OUTPUT_DIR)) {
  fs.rmSync(`${OUTPUT_DIR}/${file.name}`, { force: true, recursive: true });
}

for (const file of getFiles()) {
  const buffer = fs.readFileSync(`${SAMPLES_DIR}/${file.name}`);

  let content = Object.values(
    JSON.parse(buffer.toString()) as Record<string, Commit>
  );

  const data: Record<string, string[]> = {};

  // Para cada modificação de cada commit, cria uma chave com o nome do arquivo
  // referenciando o commit. Caso o arquivo tenha mudado de nome,
  // referencia o commit para ambos nomes
  content.forEach((commit: Commit) => {
    commit.mods.forEach((mod) => {
      if (mod.old_path) {
        const key = `${commit.repo}:${mod.old_path}`;
        if (!data[key]) {
          data[key] = [];
        }
        data[key].push(commit.hash);
      }

      if (mod.new_path && mod.new_path !== mod.old_path) {
        const key = `${commit.repo}:${mod.new_path}`;
        if (!data[key]) {
          data[key] = [];
        }
        data[key].push(commit.hash);
      }
    });
  });

  fs.writeFileSync(`${OUTPUT_DIR}/${file.name}`, JSON.stringify(data, null, 2));

  console.log(`Processed file: ${file.name}`);
}
