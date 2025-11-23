import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

app.post("/improve", async (req, res) => {
  try {
    const { imageBase64, prompt } = req.body;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).send("Missing API key");

    const form = new FormData();
    form.append("model", "gpt-image-1");
    form.append("size", "1024x1536");
    form.append("prompt", prompt);

    const imgBuffer = Buffer.from(imageBase64.split(",")[1], "base64");
    form.append("image", imgBuffer, "input.png");

    const r = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      body: form
    });

    const data = await r.json();
    res.json(data);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log("RUNNING on", port));
