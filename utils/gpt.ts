import axios, { AxiosError } from "axios";
import dotenv from "dotenv";

dotenv.config();

export const gpt = async (prompt: string): Promise<string> => {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo-0613",
      messages: [{ role: "user", content: prompt }],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GPT_ACCESS_KEY}`,
      },
    }
  );

  return response.data?.choices?.[0]?.message?.content ?? "";
};
