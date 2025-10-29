import "./index.css";
import { Message } from "@technova/message";
import { Loading } from "@technova/loading";
import { useChatLogic } from "@technova/usechat";

export const Chat = () => {
  const { messages, loading, handleSubmit, inputRef } = useChatLogic(); //hämtar in logiken från usechat hooken

  const messageComponents = messages.map((message, index) => <Message text={message.text} role={message.role} key={index} />);

  return (
    <section className="chat">
      <section className="chat__messages">
        {messageComponents}
        {loading && <Loading />}
      </section>

      <form className="chat__form" onSubmit={handleSubmit}>
        <input type="text" className="chat__input" ref={inputRef} />
        <button className="chat__btn">Skicka</button>
      </form>
    </section>
  );
};
