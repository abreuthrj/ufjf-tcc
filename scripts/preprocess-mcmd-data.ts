import fs from "fs";
import dotenv from "dotenv";
import { readJsonl } from "../utils/files";

dotenv.config();

const LANGUAGE = process.env.LANGUAGE;

const SETS = ["test", "train", "valid"];

try {
  fs.mkdirSync(`CoRec/data/mcmd/${LANGUAGE}`, { recursive: true });
} catch (err) {}

for (const set of SETS) {
  const writeDiffStream = fs.createWriteStream(
    `CoRec/data/mcmd/${LANGUAGE}/${set}.diff`
  );
  const writeMsgStream = fs.createWriteStream(
    `CoRec/data/mcmd/${LANGUAGE}/${set}.msg`
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
