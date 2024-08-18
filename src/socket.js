const { initializeWhatsApp, getClient, sendMessage } = require('./whatsapp');

function setupSocket(io) {
    io.on('connection', (socket) => {
        const sessionId = socket.handshake.auth.sessionId; // Assuming sessionId is passed as a query parameter

        if (!sessionId) {
            socket.emit('error', 'Session ID is required');
            return;
        }

        if (!getClient(sessionId)) {
            // Initialize a new WhatsApp session if it doesn't exist
            initializeWhatsApp(sessionId, io);
        }

        socket.join(sessionId); // Join the room for this session

        socket.on('disconnect', () => {
            console.log(`User disconnected from session ${sessionId}`);
        });
    });
}

module.exports = setupSocket;
