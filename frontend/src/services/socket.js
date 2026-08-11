import { io } from 'socket.io-client';

const URL = window.location.origin.includes('localhost:3000')
  ? 'http://localhost:5000'
  : window.location.origin;

export const socket = io(URL, {
  autoConnect: true,
  reconnection: true,
});
