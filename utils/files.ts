import fs from "fs";
import { Commit } from "../types/commit";

const SAMPLES_DIR = "data/batches";

export const getFiles = (dir?: string): fs.Dirent[] => {
  dir = dir || SAMPLES_DIR;

  let files = fs.readdirSync(dir, { withFileTypes: true });

  files = files.filter(
    (file) => !file.isDirectory() && file.name.includes("json")
  );

  return files;
};

export const getDataSize = (dir?: string): number => {
  dir = dir || SAMPLES_DIR;

  let sum = 0;

  for (const file of getFiles(dir)) {
    const data = JSON.parse(
      fs.readFileSync(`${dir}/${file.name}`).toString()
    ) as Commit[];
    sum += data.length;
  }

  return sum;
};

export const getFilesSize = (dir?: string): number[] => {
  dir = dir || SAMPLES_DIR;

  return getFiles(dir)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((file) => {
      const data = JSON.parse(
        fs.readFileSync(`${dir}/${file.name}`).toString()
      ) as Commit[];

      return data.length;
    });
};

export const readJsonl = <T = any>(
  path: string,
  callback: (data: T) => Promise<void> | void,
  callbackClose?: () => Promise<void> | void
) => {
  const readStream = fs.createReadStream(path);

  let buffer = "";

  readStream.on("end", () => {
    readStream.close();
    callbackClose?.();
  });

  readStream.on("data", (chunk) => {
    buffer += chunk;

    const incompletes = [];
    const pieces = buffer.split("\n");

    for (const piece of pieces) {
      try {
        const obj = JSON.parse(piece);
        callback(obj);
      } catch (err) {
        incompletes.push(piece);
      }
    }

    buffer = incompletes.splice(0).join("\n");
  });
};
