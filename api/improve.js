export const config = { runtime: 'edge' };

export default async function handler(req) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'API KEY missing' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    // Recibir la imagen desde el front
    const arrayBuffer = await req.arrayBuffer();
    const blob = new Blob([arrayBuffer]);

    // Leer el prompt desde la URL (?prompt=...)
    const url = new URL(req.url);
    const prompt =
      url.searchParams.get("prompt") ||
      "Mejorá el anuncio manteniendo producto, logo y textos. Fotografía comercial premium, iluminación cinematográfica y composición limpia. No inventar textos nuevos.";

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

    // Si OpenAI devuelve error, lo propagamos como error HTTP
    if (!r.ok) {
      return new Response(
        JSON.stringify({ error: data.error?.message || "OpenAI error" }),
        {
          status: r.status || 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Normalizamos la respuesta para que el front SIEMPRE tenga data.data[0].b64_json
    const b64 = data?.data?.[0]?.b64_json || null;

    if (!b64) {
      return new Response(
        JSON.stringify({ error: "La API no devolvió una imagen válida." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({
        data: [
          { b64_json: b64 }
        ]
      }),
      {
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
