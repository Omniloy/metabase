import { Client } from "@langchain/langgraph-sdk";

export const createClient = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://assistants-prod-9c6885f051b75a548b0496804051487b.default.us.langgraph.app";
  const apiKey = "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"
  return new Client();
};
