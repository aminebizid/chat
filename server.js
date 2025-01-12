const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3001 });

function simulateStreamingResponse(ws, message) {
  ws.send(JSON.stringify({ type: 'stream-start' }));

  const response = `Here's a markdown formatted response to your message: "${message}"

## Features Demonstrated

1. **Bold text** and *italic text*
2. \`Inline code\` formatting
3. Lists (like this one!)

### Code Block Example
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

> This is a blockquote showing markdown capabilities.

You can also add [links](https://example.com) and other markdown features.`;

  let currentIndex = 0;
  
  const streamInterval = setInterval(() => {
    if (currentIndex >= response.length) {
      clearInterval(streamInterval);
      ws.send(JSON.stringify({ type: 'stream-end' }));
      return;
    }
    
    const chunk = response.slice(currentIndex, currentIndex + 3);
    ws.send(JSON.stringify({ content: chunk }));
    currentIndex += 3;
  }, 50);
}

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (data) => {
    const message = JSON.parse(data);
    simulateStreamingResponse(ws, message.message);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});