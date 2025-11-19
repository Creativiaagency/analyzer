export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return new Response(JSON.stringify({ error: 'API KEY missing' }), { status: 500 });
  }

  const form = await req.formData();
  const img = form.get('image');

  if (!img) {
    return new Response(JSON.stringify({ error: 'No image received' }), { status: 400 });
  }

  // 🔥 FIX FINAL: forzar formato válido para OpenAI
  const fixedImage = new File([await img.arrayBuffer()], 'input.png', { type: 'image/png' });

  const fd = new FormData();
  fd.append('model', 'gpt-image-1');
  fd.append('image', fixedImage);
  fd.append(
    'prompt',
    `Mejorá el anuncio manteniendo producto, logo y textos. Fotografía comercial premium, iluminación cinematográfica. Jerarquía visual clara. Sin inventar textos nuevos. Una sola imagen coherente lista para publicidad.`
  );
  fd.append('size', '1024x1536');

  const r = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
    },
    body: fd
  });

  const result = await r.json();
  return new Response(JSON.stringify(result), { status: r.status });
}
