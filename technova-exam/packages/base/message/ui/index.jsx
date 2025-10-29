import "./index.css";

export const Message = ({ text, role }) => {
  const isUser = role === "user";

  return (
    <article className={`message message--${isUser ? "user" : "assistant"}`}>
      {!isUser && <img src="../../../../public/robotrex.svg" alt="Robot avatar" className="message__avatar" />}

      <section className="message__bubble">
        <span className="message__sender">{role}</span>
        <p className="message__content">{text}</p>
      </section>
    </article>
  );
};
