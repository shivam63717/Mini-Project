
import { Server } from 'socket.io';
import http from 'http';

export function initWebSocket(server: http.Server) {
  const io = new Server(server, {
    cors: { origin: process.env.CORS_ORIGIN || '*', credentials: true }
  });

  io.on('connection', (socket) => {
    socket.emit('connected', { id: socket.id });

    socket.on('subscribe', (channel: string) => {
      socket.join(channel);
      socket.emit('subscribed', { channel });
    });

    socket.on('ping', () => socket.emit('pong'));

    socket.on('disconnect', () => {
      // cleanup hooks
    });
  });

  function broadcastUpdate(channel: string, payload: unknown) {
    io.to(channel).emit('update', payload);
  }

  return { io, broadcastUpdate };
}