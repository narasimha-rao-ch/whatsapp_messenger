const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const setupSocket = require('./socket');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const router = require('./router.js');

const cors = require('cors');
app.use(cors({ origin: '*' }));

setupSocket(io);
app.use(router);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
