import http from 'node:http';
import app from './app';

// Use the port provided by Azure, or fallback to 8080
const port = process.env.PORT || 8080;
const server = http.createServer(app);

server.listen(port, () => {
  console.info(`Listening on http://localhost:${port}`);
});

export default server;
