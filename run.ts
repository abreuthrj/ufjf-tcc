import dotenv from "dotenv";
import fs from "fs";
import { Commit } from "./commit.interface";
import { gpt } from "./utils/gpt";

dotenv.config();

const PROMPT = `Given the following output from git diff, write a commit message:

$diff`;

const PROMPT_SPLIT = `Given the output of a git diff command and examples of git messages, write a new message for that diff:

$diff

$history`;

const PROMPTS = [
  { id: "raw", prompt: PROMPT, input: [] as any[], data: [] as any[] },
  {
    id: "split-by-file",
    prompt: PROMPT_SPLIT,
    input: [] as any[],
    data: [] as any[],
  },
  {
    id: "split-by-author",
    prompt: PROMPT_SPLIT,
    input: [] as any[],
    data: [] as any[],
  },
  {
    id: "split-by-author_file",
    prompt: PROMPT_SPLIT,
    input: [] as any[],
    data: [] as any[],
  },
];

const getPrompt = (prompt: string, commit: Commit): string => {
  // Definir estratégia
  return "";
};

const process = async (prompt: string, input: Commit[]): Promise<string[]> => {
  const result: string[] = [];

  for (const commit of input) {
    const response = await gpt(getPrompt(prompt, commit));
    result.push(response);
  }

  return result;
};

const run = async () => {
  for (const { id, prompt, input, data } of PROMPTS) {
    const result = await process(prompt, input);

    data.push(result);
    fs.writeFileSync(`generated/${id}.json`, JSON.stringify(data));
  }
};

run();
