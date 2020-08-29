import socketIOClient from 'socket.io-client';

const socket = socketIOClient('http://localhost:3333');

export default socket;
