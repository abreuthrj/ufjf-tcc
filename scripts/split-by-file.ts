import fs from "fs";
import { Commit } from "../commit.interface";
import { getFiles } from "../utils/files";
import { SAMPLES_DIR } from "../constants";

const OUTPUT_DIR = "data/split-by-file";

for (const file of getFiles()) {
  const buffer = fs.readFileSync(`${SAMPLES_DIR}/${file.name}`);

  let content = JSON.parse(buffer.toString()) as Commit[];

  const data: Record<string, Commit[]> = {};

  content = content.filter(
    (commit) =>
      commit.mods.length === 1 &&
      commit.mods[0].old_path === commit.mods[0].new_path
  );
  content.forEach((commit: Commit) => {
    const key = `${commit.repo}:${commit.mods[0].old_path as string}`;

    if (!data[key]) {
      data[key] = [];
    }

    data[key].push(commit);
  });

  const result = Object.entries(data).map(([file, commits]) => ({
    file,
    commits,
  }));

  fs.writeFileSync(
    `${OUTPUT_DIR}/${file.name}`,
    JSON.stringify(result, null, 2)
  );

  console.log(`Processed file: ${file.name}`);
}
