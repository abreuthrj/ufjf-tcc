import { readStreamLine } from "../utils/files";
import fs from "fs";

const repos = {};

let total = 0;

readStreamLine(
  `data/preprocessed/javascript/train.commits.jsonl`,
  (line) => {
    const commit = JSON.parse(line);
    repos[commit.repo] = repos[commit.repo] ?? 0;
    repos[commit.repo]++;
    total++;
  },
  () => {
    console.log(repos);
    console.log(total);
    fs.writeFileSync("output.json", `${JSON.stringify(repos)}\n`);
  }
);
