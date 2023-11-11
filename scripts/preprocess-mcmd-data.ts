import fs from "fs";
import dotenv from "dotenv";
import { readJsonl } from "../utils/files";

dotenv.config();

const LANGUAGE = process.env.LANGUAGE;

const SETS = ["test", "train", "valid"];

try {
  fs.mkdirSync(`data/mcmd/${LANGUAGE}/processed`);
} catch (err) {}

for (const set of SETS) {
  const writeDiffStream = fs.createWriteStream(
    `data/mcmd/${LANGUAGE}/processed/${set}.diff`
  );
  const writeMsgStream = fs.createWriteStream(
    `data/mcmd/${LANGUAGE}/processed/${set}.msg`
  );

  readJsonl(
    `data/MCMD/${LANGUAGE}/${set}.jsonl`,
    async (data) => {
      writeDiffStream.write(data.diff);
      writeMsgStream.write(data.msg);
    },
    () => {
      writeDiffStream.close();
      writeMsgStream.close();
    }
  );
}
