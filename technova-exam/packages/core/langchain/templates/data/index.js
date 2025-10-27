import { PromptTemplate, ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

export const standaloneQuestionTemplate = PromptTemplate.fromTemplate(`
    Givet en fråga om TechNova AB, omformulera frågan till en standalone question som är tydlig och enkel att förstå.
    Fråga: {question},
    Standalone Question:    
`);

export const answerTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    `Du är en expert på allt som rör TechNova AB tack vare den tillhandahållna kontexten. 
        Du talar med en service inriktad, vänlig ton, mån om att lösa kundens problem. 
       Om frågan inte handlar om TechNova AB eller ligger utom ramarna för det som finns i den tillhandahållna kontexten, svara att du enbart svarar på frågor gällande TechNova AB: FAQ- & policydokument.`,
  ],
  new MessagesPlaceholder("chat_history"),
  [
    "user",
    `Kontext: {context}
        Fråga: {question}
        Svar:`,
  ],
]);
