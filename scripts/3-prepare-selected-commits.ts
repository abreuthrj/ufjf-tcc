import { readStreamLine } from "../utils/files";
import fs from "fs";

const LANGUAGE = "javascript";
const TYPE = "test";
const FILE_RATE = 0.5;
const HISTORY_SIZE = 5;

const commits = [];

fs.mkdirSync(`data/processed/${LANGUAGE}`, { recursive: true });
const writeStream = fs.createWriteStream(
  `data/processed/${LANGUAGE}/${TYPE}.processed.jsonl`
);

let diffTokens = 0;
let historyTokens = 0;

const prepare = (commit) => {
  commit.authorHistory = commit.authorHistory ?? [];
  commit.fileHistory = commit.fileHistory ?? [];
  commit.authorFileHistory = commit.authorFileHistory ?? [];
  commit.files = commit.files.map((file) => file.filename);

  commits.forEach((search) => {
    if (!search?.msg) {
      return;
    }
    if (commit.sha === search.sha) {
      return;
    }
    if (commit.time < search.time) {
      return;
    }

    let hasAuthor = false;
    if (commit.author === search.author && commit.repo === search.repo) {
      hasAuthor = true;
      commit.authorHistory.push(search.msg);
    }

    let containingFiles = 0;
    for (const searchFile of search.files) {
      if (commit.files.includes(searchFile.filename)) {
        containingFiles++;
      }
    }

    let hasFile = false;
    if (commit.files.length * FILE_RATE <= containingFiles) {
      hasFile = true;
      commit.fileHistory.push(search.msg);
    }

    if (hasAuthor && hasFile) {
      commit.authorFileHistory.push(search.msg);
    }
  });

  commit.authorHistory = commit.authorHistory.slice(-HISTORY_SIZE);
  commit.fileHistory = commit.fileHistory.slice(-HISTORY_SIZE);
  commit.authorFileHistory = commit.authorFileHistory.slice(-HISTORY_SIZE);

  diffTokens += commit.diff.split(" ").length;
  historyTokens += commit.authorHistory.join(" ").split(" ").length;
  historyTokens += commit.fileHistory.join(" ").split(" ").length;
  historyTokens += commit.authorFileHistory.join(" ").split(" ").length;

  writeStream.write(`${JSON.stringify(commit)}\n`);
};

const evaluateCost = () => {
  console.log("Diff tokens: ", diffTokens);
  console.log("History tokens: ", historyTokens);
  console.log("Input tokens: ", diffTokens + historyTokens);
};

readStreamLine(
  `data/enriched/${LANGUAGE}/${TYPE}.enriched.jsonl`,
  (line) => {
    commits.push(JSON.parse(line));
  },
  () => {
    readStreamLine(
      `data/selected/${LANGUAGE}/${TYPE}.selected.jsonl`,
      (line) => {
        prepare(JSON.parse(line));
      },
      evaluateCost
    );
  }
);
