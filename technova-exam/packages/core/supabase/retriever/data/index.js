import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase"; //ett färdigt LangChain-objekt för att prata med Supabase som vektor-databas.
import { OllamaEmbeddings } from "@langchain/ollama"; //används för att generera embeddings (numeriska representationer av text).
import { client } from "@technova/client"; //Supabase-anslutningen

const embeddings = new OllamaEmbeddings({
  model: "llama3.1:8b",
});

const vectorStore = new SupabaseVectorStore(embeddings, {
  //Här skapas en anslutning till din vektorstore i Supabase. Embeddings: talar om hur texten ska omvandlas till vektorer.
  client: client,
  tableName: "documents",
  queryName: "match_documents", //det namn på den RPC-funktion (remote procedure) i Supabase som används för att söka
});

export const retriever = vectorStore.asRetriever(); //Gör om vectorStore till en retriever.
