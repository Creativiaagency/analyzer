export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    // 1. Prompt desde la URL (tu index lo manda así)
    const url = new URL(req.url);
    const prompt =
      url.searchParams.get("prompt") ||
      "Mejorá el anuncio manteniendo producto, logo y textos...";

    // 2. Validar API KEY
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key missing" }), { status: 500 });
    }

    // 3. Recibir imagen como BLOB (tu front la envía así)
    const buffer = await req.arrayBuffer();
    if (!buffer || buffer.byteLength === 0) {
      return new Response(JSON.stringify({ error: "No image received" }), { status: 400 });
    }

    // 4. Convertirlo en un PNG válido para OpenAI
    const file = new File([buffer], "input.png", { type: "image/png" });

    // 5. Armar FormData EXACTO como lo pide OpenAI
    const form = new FormData();
    form.append("model", "gpt-image-1");
    form.append("image", file, "input.png");
    form.append("prompt", prompt);
    form.append("size", "1024x1536");

    // 6. Llamar a OpenAI
    const r = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });

    const data = await r.json();

    // 7. Manejo de errores reales
    if (!r.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || "OpenAI error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 8. Normalizar EXACTO AL FORMATO QUE TU FRONT ESPERA
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) {
      return new Response(JSON.stringify({ error: "No valid image returned." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        data: [
          { b64_json: b64 }
        ]
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
