import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://192.168.1.80:3000",
      "http://192.168.1.122:3000",
      "https://btkdevkh-chatbot-ai-react.netlify.app",
    ],
  })
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/chat", async (req, res) => {
  const { message, questions } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  let responseText = "";

  const conversations = questions.map((msg) => {
    return {
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    };
  });

  conversations.push({ role: "user", content: message });

  // const completion = await openai.chat.completions.create({
  //   model: "gpt-4o-mini",
  //   messages: conversation,
  // });
  // responseText = completion.choices[0].message.content;

  const response = await openai.responses.create({
    model: "gpt-5-mini",
    tools: [{ type: "web_search" }],
    input: conversations,
  });

  responseText = response.output_text;

  if (responseText.trim() === "") {
    responseText =
      "Je suis désolé, je n'ai pas pu générer une réponse à votre question. Pouvez-vous reformuler ou poser une autre question ?";
  }

  res.json({ answer: responseText });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
