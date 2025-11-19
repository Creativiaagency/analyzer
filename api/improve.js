export const config = { runtime: 'edge' };

export default async function handler(req) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API KEY missing' }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Recibir la imagen
  const arrayBuffer = await req.arrayBuffer();
  const blob = new Blob([arrayBuffer]);

  // Leer el prompt desde la URL o usar uno por defecto
  const url = new URL(req.url);
  const prompt =
    url.searchParams.get("prompt") ||
    "Mejorá el anuncio manteniendo producto, logo y textos...";

  // Enviar a OpenAI
  const fd = new FormData();
  fd.append("model", "gpt-image-1");
  fd.append("image", blob, "input.png");
  fd.append("size", "1024x1536");
  fd.append("prompt", prompt);

  const r = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}` },
    body: fd
  });

  const data = await r.json();

  // Si OpenAI devuelve error, propagamos el status para que el front lo capture
  if (!r.ok) {
    return new Response(
      JSON.stringify({ error: data.error?.message || "OpenAI error" }),
      {
        status: r.status || 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  // Respuesta normal: dejamos el objeto tal cual para data.data[0].b64_json
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
}
