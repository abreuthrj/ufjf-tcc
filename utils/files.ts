import fs from "fs";

const SAMPLES_DIR = "data/batches";

export const getFiles = (): fs.Dirent[] => {
  let files = fs.readdirSync(SAMPLES_DIR, { withFileTypes: true });

  files = files.filter(
    (file) => !file.isDirectory() && file.name.includes("json")
  );

  return files;
};
