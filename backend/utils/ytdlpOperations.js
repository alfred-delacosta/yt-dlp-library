export const setSSEHeaders = (res) => {
  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable buffering in proxies like Nginx

  // Flush headers to establish connection
  res.flushHeaders();
};

export const sseProcessOutput = (req, res, ytdlpProcess) => {
  // Stream stdout as SSE events
  ytdlpProcess.stdout.on("data", (chunk) => {
    const message = chunk.toString();
    const formatted = message.replace("\r", "").trim();
    res.write(`data: ${formatted}\n\n`); // SSE format: each message ends with \n\n
  });

  // Stream stderr as SSE events (optional)
  ytdlpProcess.stderr.on("data", (chunk) => {
    const message = chunk.toString();
    const formatted = message.replace("\r", "").trim();
    res.write(`data: [ERROR]: ${formatted}\n\n`); // Prefix errors for clarity
  });

  // Handle spawn errors (e.g., command not found)
  ytdlpProcess.on("error", (err) => {
    console.log(`onError: ${message}`);
    res.write(`data: Error: ${err.message}\n\n`);
  });
};
