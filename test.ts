import fs from "fs";
import { gpt } from "./utils/gpt";
import { isAxiosError } from "axios";
import {
  PROMPT_RAW,
  TEST_FORMAT,
  PROMPT_HISTORY,
  PROMPT_RAW_FILENAME,
} from "./constants";

const test = async (input: string, file: string, original: string) => {
  const message = await gpt(input);
  fs.writeFileSync(
    `test/${file}`,
    TEST_FORMAT.replace("$input", input)
      .replace("$output", message)
      .replace("$original", original),

    {
      flag: "a",
    }
  );
};

// Test raw
const testRaw = async () => {
  const OUTPUT_FILE = "raw.txt";
  const selection = JSON.parse(
    fs.readFileSync("test/selection.json").toString()
  );

  for (const commit of selection) {
    const input = PROMPT_RAW.replace("$diff", commit.diff).replace(
      "$filename",
      commit.file
    );

    try {
      await test(input, OUTPUT_FILE, commit.message);
    } catch (err: any) {
      if (isAxiosError(err)) {
        console.log("[ERROR]", err.response?.data);
      } else {
        console.log("[ERROR]", err);
      }

      return;
    }
  }
};

// Test for raw filename
const testRawFilename = async () => {
  const OUTPUT_FILE = "raw-with-filename.txt";
  const selection = JSON.parse(
    fs.readFileSync("test/selection.json").toString()
  );

  for (const commit of selection) {
    const input = PROMPT_RAW_FILENAME.replace("$diff", commit.diff).replace(
      "$filename",
      commit.file
    );

    try {
      await test(input, OUTPUT_FILE, commit.message);
    } catch (err: any) {
      if (isAxiosError(err)) {
        console.log("[ERROR]", err.response?.data);
      } else {
        console.log("[ERROR]", err);
      }

      return;
    }
  }
};

// Test for author
const testAuthor = async () => {
  const OUTPUT_FILE = "author.txt";
  const selection = JSON.parse(
    fs.readFileSync("test/selection-author.json").toString()
  );

  for (const {
    author,
    commits: [commit, ...history],
  } of selection) {
    const input = PROMPT_HISTORY.replace("$diff", commit.diff).replace(
      "$history",
      history.map((h: any) => h.message).join("\n")
    );

    try {
      await test(input, OUTPUT_FILE, commit.message);
    } catch (err: any) {
      if (isAxiosError(err)) {
        console.log("[ERROR]", err.response?.data);
      } else {
        console.log("[ERROR]", err);
      }

      return;
    }
  }
};

// Test for file
const testFile = async () => {
  const OUTPUT_FILE = "file.txt";
  const selection = JSON.parse(
    fs.readFileSync("test/selection-file.json").toString()
  );

  for (const {
    file,
    commits: [commit, ...history],
  } of selection) {
    const input = PROMPT_HISTORY.replace("$diff", commit.diff).replace(
      "$history",
      history.map((h: any) => h.message).join("\n")
    );

    try {
      await test(input, OUTPUT_FILE, commit.message);
    } catch (err: any) {
      if (isAxiosError(err)) {
        console.log("[ERROR]", err.response?.data);
      } else {
        console.log("[ERROR]", err);
      }

      return;
    }
  }
};

// testRaw()
// testRawFilename()
// testAuthor();
// testFile();
