import fs from "fs";
import { Commit } from "../commit.interface";
import { SAMPLES_DIR } from "../constants";
import { getFiles } from "../utils/files";

const OUTPUT_DIR = "data/split-by-author_file";

for (const file of getFiles()) {
  const buffer = fs.readFileSync(`${SAMPLES_DIR}/${file.name}`);

  const content = JSON.parse(buffer.toString()) as Commit[];

  const author_file: Record<string, Commit[]> = {};

  content.forEach((commit) => {
    commit.mods.forEach((modification) => {
      if (!modification.old_path && !modification.new_path) {
        return;
      }

      const key = `${
        (modification.new_path || modification.old_path) as string
      }:${commit.author}`;

      if (!author_file[key]) {
        author_file[key] = [];
      }

      author_file[key].push(commit);
    });
  });

  fs.writeFileSync(
    `${OUTPUT_DIR}/${file.name}`,
    JSON.stringify(author_file, null, 2)
  );

  console.log(`Processed file: ${file.name}`);
}
