import fs from "fs";
import { Commit } from "../commit.interface";

const SAMPLE = "from_0_to_46849";
const OUTPUT_DIR = "test";
const SAMPLES_DIR = "data/split-by-author";
const COMMITS_PER_AUTHOR = 4;
const NUM_OF_SAMPLES = 5;

const buffer = fs.readFileSync(`${SAMPLES_DIR}/${SAMPLE}.json`);

const content = JSON.parse(buffer.toString()) as any[];

let result: any[] = [];

result.forEach((commitAuthor) => {
  commitAuthor.commits = commitAuthor.commits.filter(
    (commit: Commit) =>
      commit.mods.length === 1 &&
      commit.mods[0].old_path === commit.mods[0].new_path
  );
});
result = content.filter(
  (commit) => commit.commits.length >= COMMITS_PER_AUTHOR
);
result.forEach((commitAuthor) => {
  commitAuthor.commits = commitAuthor.commits.slice(0, COMMITS_PER_AUTHOR);
});
result = result.slice(0, NUM_OF_SAMPLES);

result = result.map((commit) => ({
  author: commit.author,
  commits: commit.commits.map((commit: Commit) => ({
    diff: commit.mods[0].diff,
    message: commit.original_message,
  })),
}));

fs.writeFileSync(
  `${OUTPUT_DIR}/selection-author.json`,
  JSON.stringify(result, null, 2)
);
