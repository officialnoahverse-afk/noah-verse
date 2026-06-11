module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { prompt, negativePrompt, aspectRatio, duration, image, apiKey } = req.body;
  if (!apiKey || !apiKey.startsWith('r8_')) return res.status(401).json({ error: 'Invalid API key' });
  const modelId = image
  ? 'wavespeedai/wan-2.1-i2v-480p'
  : 'wavespeedai/wan-2.1-t2v-480p';
  const input = { prompt: prompt || 'cinematic video', negative_prompt: negativePrompt || 'blurry, low quality', aspect_ratio: aspectRatio || '16:9', num_frames: (parseInt(duration) || 5) * 16, num_inference_steps: 30, guidance_scale: 5 };
  if (image) input.image = image;
  try {
    const response = await fetch(`https://api.replicate.com/v1/models/${modelId}/predictions`, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', Prefer: 'respond-async' }, body: JSON.stringify({ input }) });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.detail || 'Replicate error' });
    return res.status(200).json(data);
  } catch (err) { return res.status(500).json({ error: err.message }); }
};
