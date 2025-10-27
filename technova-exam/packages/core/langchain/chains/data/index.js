import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { retriever } from "@technova/retriever";
import { standaloneQuestionTemplate, answerTemplate } from "@technova/templates";
import { combineDocuments } from "@technova/combinedocuments";
import { llm } from "@technova/llm";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";

const memory = new BufferMemory({
  memoryKey: "chat_history",
  returnMessages: true,
  inputKey: "question",
});

// 1. Konvertera frpgan till en standalone question
const standaloneQuestionChain = RunnableSequence.from([standaloneQuestionTemplate, llm, new StringOutputParser()]);

// 2. Använda standalone question för att söka kontext från databasen
const retrieverChain = RunnableSequence.from([
  (data) => {
    return data.standaloneQuestion;
  },
  retriever,
  combineDocuments,
]);

// 3. Använda kontexten och den ursprungliga frågan för att fråga språkmodellen
// const answerChain = RunnableSequence.from([
//     answerTemplate,
//     llm,
//     new StringOutputParser()
// ]);

const conversationChain = new ConversationChain({
  llm,
  prompt: answerTemplate,
  memory,
});

export const chain = RunnableSequence.from([
  {
    standaloneQuestion: standaloneQuestionChain,
    originalQuestion: new RunnablePassthrough(),
  },
  {
    context: retrieverChain,
    question: ({ originalQuestion }) => originalQuestion.question,
  },
  conversationChain,
]);
