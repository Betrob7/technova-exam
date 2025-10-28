import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables"; //för att bygga kedjor av steg
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
    return data.standaloneQuestion; //plockar bara ut texten
  },
  retriever, //söker i din Supabase-vectorstore efter relevanta dokumentchunks
  combineDocuments, //slår ihop dessa chunks till en enda textsträng (context)
]);

const conversationChain = new ConversationChain({
  //skapar svaret till användaren
  llm,
  prompt: answerTemplate,
  memory,
});

export const chain = RunnableSequence.from([
  {
    standaloneQuestion: standaloneQuestionChain, //skapar en standalone question
    originalQuestion: new RunnablePassthrough(), //orginalfrågan sparas
  },
  {
    context: retrieverChain, //retrieverChain söker upp FAQ-info baserat på standaloneQuestion
    question: ({ originalQuestion }) => originalQuestion.question, //question sätts till originaltexten från användaren
  },
  conversationChain, //LLM + context + memory → genererar ett svar.
]);
