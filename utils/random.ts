import { readStreamLine } from "./files";
import fs from "fs";

export const selectRandomLinesFromFile = (
  path: string,
  lines: number,
  callback: (randomLines: number[]) => void
) => {
  const lineIndexes: number[] = [];

  readStreamLine(
    path,
    () => {
      lineIndexes.push(lineIndexes.length);
    },
    () => {
      const randomSet: number[] = [];

      for (let i = 0; i < lines; i++) {
        const randomIndex = Math.floor(Math.random() * lineIndexes.length);
        randomSet.push(...lineIndexes.splice(randomIndex, 1));
      }

      randomSet.sort((a, b) => a - b);

      fs.writeFileSync(
        `output/${path.replace(/\/|\./g, "-")}.txt`,
        randomSet.join("\n")
      );

      callback(randomSet);
    }
  );
};
