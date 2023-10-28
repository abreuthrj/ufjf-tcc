import fs from "fs";
import { Commit } from "../commit.interface";
import { getFiles } from "../utils/files";
import { SAMPLES_DIR } from "../constants";

const OUTPUT_DIR = "data/split-by-author";

for (const file of getFiles(OUTPUT_DIR)) {
  fs.rmSync(`${OUTPUT_DIR}/${file.name}`, { force: true, recursive: true });
}

for (const file of getFiles()) {
  const buffer = fs.readFileSync(`${SAMPLES_DIR}/${file.name}`);

  const content = Object.values(
    JSON.parse(buffer.toString()) as Record<string, Commit>
  );

  const authors: Record<number, string[]> = {};

  content.forEach((commit) => {
    if (!authors[commit.author]) {
      authors[commit.author] = [];
    }

    authors[commit.author].push(commit.hash);
  });

  fs.writeFileSync(
    `${OUTPUT_DIR}/${file.name}`,
    JSON.stringify(authors, null, 2)
  );

  console.log(`Processed file: ${file.name}`);
}
