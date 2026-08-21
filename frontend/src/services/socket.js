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

// Create socket but don't auto-connect — we delay first connection
// so Render's free-tier server has time to wake up after a cold start.
export const socket = io(getSocketUrl(), {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 3,        // Don't spam retries
  reconnectionDelay: 5000,        // 5s between attempts
  reconnectionDelayMax: 15000,    // Cap at 15s
  timeout: 15000,
  withCredentials: true,
  transports: ['websocket', 'polling']  // Prefer WebSocket first
});

// Delay initial connection by 4 seconds to allow Render cold-start to finish
setTimeout(() => {
  socket.connect();
}, 4000);

