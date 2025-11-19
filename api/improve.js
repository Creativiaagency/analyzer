export const config = { runtime: 'edge' };

export default async function handler(req) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API KEY missing' }), { status: 500 });
  }

  // Recibir la imagen
  const arrayBuffer = await req.arrayBuffer();
  const blob = new Blob([arrayBuffer]);

  // Enviar a OpenAI
  const fd = new FormData();
  fd.append("model", "gpt-image-1");
  fd.append("image", blob, "input.png");
  fd.append("size", "1024x1536");

  const r = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}` },
    body: fd
  });

  const data = await r.json();

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
}
