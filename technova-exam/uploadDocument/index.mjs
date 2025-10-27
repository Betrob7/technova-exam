import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OllamaEmbeddings } from "@langchain/ollama";
import { createClient } from "@supabase/supabase-js";
import { readFile } from "fs/promises";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import "dotenv/config";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

try {
  const text = await readFile(`${process.cwd()}/technova.txt`, "utf-8");

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 400,
    separators: ["\n\n", "\n", " ", ""],
    chunkOverlap: 80,
  });

  const splittedText = await textSplitter.createDocuments([text]);

  const supabaseClient = createClient(SUPABASE_URL, SUPABASE_API_KEY);

  await SupabaseVectorStore.fromDocuments(
    splittedText,
    new OllamaEmbeddings({
      model: "llama3.1:8b",
    }),
    {
      client: supabaseClient,
      tableName: "documents",
    }
  );

  console.log("SUCCESS");
} catch (error) {
  console.log("ERROR:", error.message);
}
