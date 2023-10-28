import fs from "fs";
import { Commit } from "../commit.interface";

const SAMPLE = "from_0_to_46849";
const OUTPUT_DIR = "test";
const SAMPLES_DIR = "data/batches";
const NUM_OF_SAMPLES = 5;

const buffer = fs.readFileSync(`${SAMPLES_DIR}/${SAMPLE}.json`);

const content = JSON.parse(buffer.toString()) as Commit[];

let result: any[] = [];

result = content.filter(
  (commit) =>
    commit.mods.length === 1 &&
    commit.mods[0].new_path === commit.mods[0].old_path
);
result = result.filter(
  (commit, index) =>
    index ===
    result.findIndex(
      (search) => search.mods[0].new_path === commit.mods[0].new_path
    )
);
result = result.slice(0, NUM_OF_SAMPLES);

result = result.map((commit) => ({
  diff: commit.mods[0].diff,
  message: commit.original_message,
  file: commit.mods[0].new_path,
}));

fs.writeFileSync(`${OUTPUT_DIR}/selection.json`, JSON.stringify(result));
