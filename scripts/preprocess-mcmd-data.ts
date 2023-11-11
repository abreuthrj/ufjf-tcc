import fs from "fs";
import dotenv from "dotenv";
import { readStreamLine } from "../utils/files";

dotenv.config();

const LANGUAGE = "javascript";

const PATH = `data/filtered_data/${LANGUAGE}/sort_time_train80_valid10_test10`;
const OUTPUT = `data/preprocessed/${LANGUAGE}`;
const SETS = ["test", "train", "valid"];
const LIMITS = [5373, 96704, 5372];

try {
  fs.mkdirSync(OUTPUT, { recursive: true });
} catch (err) {}

for (const [index, set] of Object.entries(SETS)) {
  const writeDiffStream = fs.createWriteStream(`${OUTPUT}/${set}.diff.txt`);

  // Le cada linha de diff e salva em outro arquivo
  let diffs = 0;
  readStreamLine(
    `${PATH}/${set}.diff.txt`,
    async (line, stream) => {
      if (diffs >= LIMITS[index]) {
        stream.close();
        return;
      }

      diffs++;
      writeDiffStream.write(`${line}\n`);
    },
    () => {
      writeDiffStream.close();
    }
  );

  const writeMsgStream = fs.createWriteStream(`${OUTPUT}/${set}.msg.txt`);

  // Le cada linha de mensagem de commit e salva em outro arquivo
  let msgs = 0;
  readStreamLine(
    `${PATH}/${set}.msg.txt`,
    async (line, stream) => {
      if (msgs >= LIMITS[index]) {
        stream.close();
        return;
      }

      msgs++;
      writeMsgStream.write(`${line}\n`);
    },
    () => {
      writeMsgStream.close();
    }
  );

  // Une os repositorios e shas em um só arquivo
  const commits = [];
  readStreamLine(
    `${PATH}/${set}.repo.txt`,
    (repo) => {
      commits.push({ repo });
    },
    () => {
      let index = 0;
      readStreamLine(
        `${PATH}/${set}.sha.txt`,
        (sha) => {
          commits[index].sha = sha;
          index++;
        },
        () => {
          const commitStream = fs.createWriteStream(
            `${OUTPUT}/${set}.commits.jsonl`
          );
          for (const commit of commits) {
            commitStream.write(`${JSON.stringify(commit)}\n`);
          }
          commitStream.close();
        }
      );
    }
  );
}
