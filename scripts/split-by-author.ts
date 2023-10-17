import fs from "fs";
import { Commit } from "../commit.interface";
import { getFiles } from "../utils/files";
import { SAMPLES_DIR } from "../constants";

const OUTPUT_DIR = "data/split-by-author";

for (const file of getFiles()) {
  const buffer = fs.readFileSync(`${SAMPLES_DIR}/${file.name}`);

  const content = JSON.parse(buffer.toString()) as Commit[];

  const authors: Record<number, Commit[]> = {};

  content.forEach((commit) => {
    if (!authors[commit.author]) {
      authors[commit.author] = [];
    }

    authors[commit.author].push(commit);
  });

  const result = Object.entries(authors).map(([author, commits]) => ({
    author,
    commits,
  }));

  fs.writeFileSync(
    `${OUTPUT_DIR}/${file.name}`,
    JSON.stringify(result, null, 2)
  );

  console.log(`Processed file: ${file.name}`);
}
