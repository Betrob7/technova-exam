import { useState, useRef } from "react";
import { chain } from "@technova/chains";

export const useChatLogic = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const question = inputRef.current.value;
    if (!question.trim()) return;

    setLoading(true);
    setMessages((prev) => [...prev, { text: question, role: "user" }]);
    inputRef.current.value = "";
    const answer = await chain.invoke({ question }, { configurable: { sessionId: "hejsan" } });

    setMessages((prev) => [...prev, { role: "assistant", text: answer.response || "Ingen respons." }]);

    setLoading(false);
  };

  return { messages, loading, handleSubmit, inputRef };
};
