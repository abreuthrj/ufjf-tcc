import fs from "fs";
import { readStreamLine } from "../utils/files";

const LANGUAGE = "javascript";
const TYPE = "test";
const SELECT_COMMIT_COUNT = 200;

const commits: any[] = [];

const selectRandom = () => {
  const selected: any[] = [];

  while (selected.length < SELECT_COMMIT_COUNT) {
    const commit = commits.splice(
      Math.floor(Math.random() * commits.length),
      1
    )[0];

    if (commit.diff) {
      selected.push(commit);
    }
  }

  fs.mkdirSync(`data/selected/${LANGUAGE}`, { recursive: true });
  const selectedStream = fs.createWriteStream(
    `data/selected/${LANGUAGE}/${TYPE}.selected.jsonl`
  );

  for (const commit of selected) {
    selectedStream.write(`${JSON.stringify(commit)}\n`);
  }

  selectedStream.close();
};

readStreamLine(
  `data/enriched/${LANGUAGE}/${TYPE}.enriched.jsonl`,
  (line) => {
    commits.push(JSON.parse(line));
  },
  selectRandom
);
