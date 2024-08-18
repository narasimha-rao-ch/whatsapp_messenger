const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const sessions = {};  // Object to hold multiple client sessions

function initializeWhatsApp(sessionId, io) {
    const client = new Client({
        authStrategy: new LocalAuth({
            clientId: sessionId,
            dataPath: 'sessions'
        })
    });

    client.on('qr', (qr) => {
        qrcode.toDataURL(qr, (err, url) => {
            io.to(sessionId).emit('qr', url); // Emit QR code to specific session
        });
    });

    client.on('ready', () => {
        io.to(sessionId).emit('ready'); // Notify the session when the client is ready
        console.log(`Client ${sessionId} is ready`);
    });

    client.on('authenticated', () => {
        io.to(sessionId).emit('authenticated'); // Notify the session when the client is ready
        console.log(`Client ${sessionId} is authenticated`);
    });

    client.on('auth_failure', () => {
        console.log(`Authentication failed for session ${sessionId}, restarting...`);
        client.initialize();
    });

    client.initialize();
    sessions[sessionId] = client; // Save the client session

    return client;
}

function getClient(sessionId) {
    if (!sessions[sessionId]) {
        return null;
    }

    return sessions[sessionId];
}

async function sendMessage(client, number, message, file) {
    let messageItem = '';

    if (file) {
        const media = new MessageMedia(file.mimetype, file.buffer.toString('base64'));
        if(message) {
            messageItem = await client.sendMessage(number, media, { caption: message })
        } else {
            messageItem = await client.sendMessage(number, media )
        }
    } else {
        messageItem = await client.sendMessage(number, message)
    }
    return messageItem;
}

module.exports = { initializeWhatsApp, getClient, sendMessage };
