import { io } from 'socket.io-client';

// Derive Socket.IO backend host from VITE_SOCKET_URL or VITE_API_URL
const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
  }
  return 'http://localhost:5000';
};

export const socket = io(getSocketUrl(), {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  timeout: 20000,
  withCredentials: true,
  transports: ['polling', 'websocket']
});
