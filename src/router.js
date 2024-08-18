const express = require('express');
const rotuer = new express.Router();
const multer = require('multer')
const upload = multer();

const { getClient, sendMessage } = require('./whatsapp');

rotuer.get('/', (req, res) => {
    res.send('Whatsapp Service');
});


rotuer.post('/send-message', upload.single('file'), (req, res) => {
    try {
        const sessionId = req.body.sessionId;
        const phoneNumber = req.body.phoneNumber;
        const message = req.body.message;
        const file = req.file;

        const client = getClient(sessionId);
        if (!client) {
            res.status(500).send({
                message: "Internal Error Occured, Whatsapp not started, Plz try again...",
            });
        }
        
        // console.log("client", client);

        sendMessage(client, phoneNumber, message, file).then(status => {
            if (status) {
                res.status(200).send({
                    message: 'Message sent successfully',
                })
            }
        }).catch(error => {
            console.log("send-message error", error);
            res.status(500).send({
                message: error,
            });
        })

    } catch (error) {
        console.log("send-message error", error);
        res.status(500).send({
            message: error,
        });

    }
})

// get all chats
rotuer.get('/get-all-chats', (req, res) => {
    const sessionId = Number(req.query.sessionId);
    const client = getClient(sessionId);
    if (!client) {
        return res.status(500).send({
            message: "Internal Error Occured, Plz try again...",
        });
    }

    client.getChats().then(chats => {
        const chatList = chats.map(chat => ({
            id: chat.id,
            name: chat.name,
            isGroup: chat.isGroup,
        }));

        res.status(200).json(chatList);
    }).catch(error => {
        res.status(500).json({
            mesage: 'Internal Error Occured: ' + error
        });
    });
});

module.exports = rotuer