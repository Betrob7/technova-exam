import { RunnableSequence, RunnablePassthrough, RunnableWithFallbacks } from "@langchain/core/runnables"; //för att bygga kedjor av steg
import { retriever } from "@technova/retriever"; //hämtar relevanta textstycken (chunks) från min Supabase-vectorstore
import { standaloneQuestionTemplate, answerTemplate } from "@technova/templates"; //mina promptmallar (standalone & answer)
import { combineDocuments } from "@technova/combinedocuments"; //slår ihop de hämtade chunksen till en sträng
import { llm } from "@technova/llm";
import { StringOutputParser } from "@langchain/core/output_parsers"; //ser till att LLM-output returneras som en ren sträng
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains"; //en färdig “LLM + prompt + memory”-kedja

const memory = new BufferMemory({
  memoryKey: "chat_history", //variabeln som används i prompten (MessagesPlaceholder("chat_history"))
  returnMessages: true, //gör så att historiken skickas som meddelandelista (inte bara text
  inputKey: "question", //anger vilket fält i inputen som ska ses som användarens fråga
});

//RunnableSequence i LangChain är som ett “flödesband” (pipeline) där du kan koppla ihop flera steg så att outputen från ett steg blir inputen till nästa

const standaloneQuestionChain = RunnableSequence.from([standaloneQuestionTemplate, llm, new StringOutputParser()]); //tar in användarens fråga och omvandlar till standalone question

const retrieverChain = RunnableSequence.from([
  (data) => {
    console.log("standaloneQuestion:", data.standaloneQuestion);
    return data.standaloneQuestion;
  },
  async (input) => {
    console.log("retriever input:", input);
    const result = await retriever.invoke(input);
    console.log("retriever output:", result);
    return result;
  },
  async (docs) => {
    console.log("combineDocuments input:", docs);
    const combined = await combineDocuments(docs);
    console.log("combineDocuments output:", combined);
    return combined;
  },
]);

const conversationChain = new ConversationChain({
  //skapar svaret till användaren
  llm,
  prompt: answerTemplate,
  memory,
});

const mainChain = RunnableSequence.from([
  {
    // Skapar en standalone question
    standaloneQuestion: standaloneQuestionChain,
    originalQuestion: new RunnablePassthrough(),
  },

  (data) => {
    console.log("Efter standaloneQuestionChain:", data);

    return data;
  },

  {
    // Hämtar context via retrieverChain
    context: retrieverChain,
    question: ({ originalQuestion }) => originalQuestion.question,
  },

  // Logga output efter retrieverChain
  (data) => {
    console.log("Efter retrieverChain:", data);
    return data;
  },

  conversationChain, // LLM + context + memory = genererar svar
]);

export const chain = new RunnableWithFallbacks({
  runnable: mainChain,
  fallbacks: [
    async (input) => {
      console.log("Huvudkedjan misslyckades, fallback aktiverad!");
      return { output_text: "Jag kunde tyvärr inte hämta ett svar just nu." };
    },
  ],
});
