import { readStreamLine } from "./files";
import {
  PROMPT,
  PROMPT_AUTHOR,
  PROMPT_FILE,
  PROMPT_FILE_AUTHOR,
} from "./prompts";
import fs from "fs";

const LANGUAGE = "javascript";
const TYPE = "test";

const PRICING_1K_INPUT_TOKEN = 0.01;
const PRICING_1K_OUTPUT_TOKEN = 0.03;
const ESTIMATED_OUTPUT_TOKEN_PER_PROMPT = 30;

const costs = [];

readStreamLine(
  `data/3-processed/${LANGUAGE}/${TYPE}.processed.jsonl`,
  (line) => {
    const commit = JSON.parse(line);

    const [authorHistory, fileHistory, authorFileHistory] = [
      commit.authorHistory.join("\n"),
      commit.fileHistory.join("\n"),
      commit.authorFileHistory.join("\n"),
    ];

    const prompts = [
      PROMPT.replace("$diff", commit.diff),
      PROMPT_AUTHOR.replace("$diff", commit.diff).replace(
        "$history",
        authorHistory
      ),
      PROMPT_FILE.replace("$diff", commit.diff).replace(
        "$history",
        fileHistory
      ),
      PROMPT_FILE_AUTHOR.replace("$diff", commit.diff).replace(
        "$history",
        authorFileHistory
      ),
    ];

    const inputTokens = prompts.join(" ").split(" ").length * 1.3;

    costs.push({ inputTokens });
  },
  () => {
    const [inputTokens, outputTokens] = [
      costs.reduce((prev, cur) => prev + cur.inputTokens, 0),
      costs.reduce(
        (prev, cur) => prev + ESTIMATED_OUTPUT_TOKEN_PER_PROMPT * 4,
        0
      ),
    ];

    const [inputCost, outputCost] = [
      (PRICING_1K_INPUT_TOKEN / 1000) * inputTokens,
      (PRICING_1K_OUTPUT_TOKEN / 1000) * outputTokens,
    ];

    console.log("Commits:", costs.length);
    console.log("Input Tokens:", inputTokens);
    console.log("Input Cost:", "$", parseFloat(inputCost.toFixed(2)));
    console.log("Estimated Output Tokens:", outputTokens);
    console.log(
      "Estimated Output Cost:",
      "$",
      parseFloat(outputCost.toFixed(2))
    );
    console.log(
      "Estimated Total Cost:",
      "$",
      parseFloat((inputCost + outputCost).toFixed(2))
    );

    fs.writeFileSync(
      `output/gpt/cost-evaluation.txt`,
      `Commits: ${costs.length}
Input Tokens: ${inputTokens}
Input Cost: $${inputCost.toFixed(2)}
Estimated Output Tokens: ${outputTokens}
Estimated Output Cost: $${outputCost.toFixed(2)}
Estimated Total Cost: $${(inputCost + outputCost).toFixed(2)}
`
    );
  }
);
