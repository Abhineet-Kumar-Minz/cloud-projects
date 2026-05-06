require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./src/config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

connectDB();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',   require('./src/routes/auth'));
app.use('/api/tasks',  require('./src/routes/tasks'));
app.use('/api/upload', require('./src/routes/upload'));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Socket.io Chat
io.on('connection', (socket) => {
  socket.on('join_room', (room) => socket.join(room));

  socket.on('send_msg', ({ room, message, user }) => {
    io.to(room).emit('receive_msg', { message, user, time: new Date() });
  });

  socket.on('disconnect', () => console.log('user disconnected'));
});

server.listen(5000, () => console.log('Server running on port 5000'));