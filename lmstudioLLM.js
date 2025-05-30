import fetch from "node-fetch";
import { ChatMessage, LLM } from "llamaindex";

export class LMStudioLLM extends LLM {
  constructor({ model = "deepseek-coder-v2-latest", url = "http://localhost:1234/v1/chat/completions" } = {}) {
    super();
    this.model = model;
    this.url = url;
  }

  async chat(messages) {
    const formatted = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await fetch(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages: formatted,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  }

  getChatMessagesPrompt(messages) {
    return messages.map((msg) => new ChatMessage(msg.role, msg.content));
  }
}
