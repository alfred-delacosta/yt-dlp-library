export async function readSseStream(response, onChunk) {
  const stream = response.data;
  const reader = stream.pipeThrough(new TextDecoderStream()).getReader();
  let text = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    text += value;
    onChunk?.(text);
  }
  return text;
}

export function parseProgressPercent(log) {
  if (!log) return null;
  const matches = String(log).match(/(\d{1,3}(?:\.\d+)?)%/g);
  if (!matches?.length) return null;
  const last = parseFloat(matches[matches.length - 1]);
  if (Number.isNaN(last)) return null;
  return Math.min(100, Math.max(0, last));
}
