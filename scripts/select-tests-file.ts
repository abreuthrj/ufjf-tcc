import fs from "fs";
import { Commit } from "../commit.interface";

const SAMPLE = "from_0_to_46849";
const OUTPUT_DIR = "test";
const SAMPLES_DIR = "data/split-by-file";
const COMMITS_PER_FILE = 4;
const NUM_OF_SAMPLES = 5;

const buffer = fs.readFileSync(`${SAMPLES_DIR}/${SAMPLE}.json`);

const content = JSON.parse(buffer.toString()) as any[];

let result: any[] = [];

result = content.filter((commit) => commit.commits.length >= COMMITS_PER_FILE);
result.forEach((commitFile) => {
  commitFile.commits = commitFile.commits.slice(0, COMMITS_PER_FILE);
});
result = result.slice(0, NUM_OF_SAMPLES);

result = result.map((commit) => ({
  file: commit.file,
  commits: commit.commits.map((commit: Commit) => ({
    diff: commit.mods[0].diff,
    message: commit.original_message,
  })),
}));

fs.writeFileSync(
  `${OUTPUT_DIR}/selection-file.json`,
  JSON.stringify(result, null, 2)
);
