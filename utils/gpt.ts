import axios, { AxiosError } from "axios";
import dotenv from "dotenv";

dotenv.config();

export const gpt = async (prompt: string): Promise<string> => {
  console.log("[GPT] Prompting");
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: process.env.GPT_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 30,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GPT_ACCESS_KEY}`,
      },
    }
  );

  return response.data?.choices?.[0]?.message?.content ?? "";
};
