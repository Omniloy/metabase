import React from "react";
import Message from "./Message";

const ChatMessageList = ({ messages }) => {
  return (
    <div
      style={{
        flexGrow: 1,
        padding: "16px",
        backgroundColor: "#F7F7F7",
        borderRadius: "12px 12px 0 0",
        overflowY: "auto",
      }}
    >
      {messages.map((message, index) => (
        <Message key={message.id || index} message={message} />
      ))}
    </div>
  );
};

export default ChatMessageList;
