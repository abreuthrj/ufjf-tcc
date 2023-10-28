import fs from "fs";
import { getDataSize, getFiles, getFilesSize } from "../utils/files";
import { Commit } from "../commit.interface";
import { SAMPLES_DIR } from "../constants";

console.log("Calculating total data size");

const FILES_SIZE = getFilesSize("data/context-commits");
const TOTAL_DATA = FILES_SIZE.reduce((prev, cur) => prev + cur, 0);
const NUM_COMMITS = 1000;

console.log("Total data:", TOTAL_DATA);

const indexes = Array(TOTAL_DATA)
  .fill(1)
  .map((_, i) => i);

const sorted: number[] = [];

const sort = () => {
  const random = Math.floor(Math.random() * indexes.length);
  sorted.push(...indexes.splice(random, 1));
};

for (let i = 0; i < NUM_COMMITS; i++) {
  sort();
}
sorted.sort((a, b) => a - b);

fs.writeFileSync("output/random-indexes.txt", sorted.join("\n"));

let filenames = getFiles("data/context-commits").map((f) => f.name);
filenames.sort((a, b) => a.localeCompare(b));
let splitters = FILES_SIZE;

splitters.forEach((val, idx, arr) => {
  if (idx > 0) {
    arr[idx] += arr[idx - 1];
  }
});

let currentSplitter = -1;
let commits: Commit[] = [];
let selecteds: Commit[] = [];
for (const idx of sorted) {
  if (currentSplitter === -1 || idx > splitters[currentSplitter]) {
    currentSplitter++;

    commits = JSON.parse(
      fs
        .readFileSync(`data/context-commits/${filenames[currentSplitter]}`)
        .toString()
    ) as Commit[];
  }

  let fixer = 0;
  if (currentSplitter > 0) {
    fixer = splitters[currentSplitter - 1] + 1;
  }

  if (commits[idx - fixer]) {
    selecteds.push(commits[idx - fixer]);
  } else {
    console.log(
      "Arquivo:",
      filenames[currentSplitter],
      "Index:",
      idx,
      "; Index ajustado:",
      idx - fixer,
      "; Valor de ajuste:",
      fixer,
      "; CurrentSplitter:",
      currentSplitter
    );
  }
}

console.log("Selected length: ", selecteds.length);

fs.writeFileSync("data/selected-commits.json", JSON.stringify(selecteds));
