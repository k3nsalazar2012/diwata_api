require('dotenv').config();
const express = require('express');
const app = express();
const session = require('./session');
const balances = require('./balances');
const players = require('./players');
const PORT = process.env.PORT || 200;
const baseAPIURL = process.env.BASE_API_URL || "/api/v1/diwata/";

app.use(express.json());

session.startSession().then(response => {
    if (response) {
        sessionToken = response.token;
        console.log('session started, token: ', sessionToken);
    } else {
        console.log('error starting session');
    }
});

app.post(`${baseAPIURL}gift/gold`, async(req, res) => {
    try {
        const {sender_id, receiver_id, amount} = req.body;

        const senderUlid = await players.getPlayerUlidFromPlayerId(sender_id);
        const receiverUlid = await players.getPlayerUlidFromPlayerId(receiver_id);

        if(senderUlid == null || receiverUlid == null) {
            res.status(500).json({ error: 'An unexpected error occurred' });
        }

        const senderWalletId = await balances.getWalletIdForHolder(senderUlid);
        if(senderWalletId == null)
            senderWalletId = await balances.createWallet(senderUlid);

        const receiverWalletId = await balances.getWalletIdForHolder(receiverUlid);
        if(receiverWalletId == null)
            receiverWalletId = await balances.createWallet(receiverUlid);

        const senderStatus = await balances.debitBalance(senderWalletId, amount + 1);
        const receiverStatus = await balances.creditBalance(receiverWalletId, amount);

        const response = {
            sender: senderStatus,
            receiver: receiverStatus
        }        

        res.json(response);
    }
    catch(error) {
        console.error('Error in /gift/gold:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});