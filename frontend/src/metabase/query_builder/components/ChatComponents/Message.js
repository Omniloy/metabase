import React from "react";

const Message = ({ message }) => {
  const isUser = message.sender === "user";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        marginBottom: "16px",
        alignItems: isUser ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: isUser ? "#E1FFE1" : "#FFF",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            width: "70%",
            wordWrap: "break-word",
          }}
        >
          <strong
            style={{ color: "#333", display: "block", marginBottom: "4px" }}
          >
            {/* {isUser ? "You" : "Server"} */}
          </strong>
          <span style={{ color: "#333" }}>{message.text}</span>
        </div>
      </div>
    </div>
  );
};

export default Message;
