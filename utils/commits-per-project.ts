import { readStreamLine } from "./files";
import fs from "fs";

const LANGUAGE = "javascript";
const TYPES = ["train", "valid", "test"];

const repos = {};

let total = 0;

for (const TYPE of TYPES) {
  readStreamLine(
    `data/preprocessed/${LANGUAGE}/${TYPE}.commits.jsonl`,
    (line) => {
      const commit = JSON.parse(line);
      repos[commit.repo] = repos[commit.repo] ?? 0;
      repos[commit.repo]++;
      total++;
    },
    () => {
      console.log(repos);
      console.log(total);
      fs.writeFileSync(
        `output/analysis/commits-per-project.${TYPE}.json`,
        JSON.stringify(repos, null, 2)
      );
    }
  );
}
