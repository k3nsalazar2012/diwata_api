require('dotenv').config();
const express = require('express');
const app = express();
const session = require('./session');
const balances = require('./balances');
const players = require('./players');
const inventory = require('./inventory');
const auth = require('./auth');

const PORT = process.env.PORT || 200;
const baseAPIURL = process.env.BASE_API_URL || "/api/v1/diwata/";
const SERVER_KEY = process.env.SERVER_KEY;

app.use(express.json());

session.startSession().then(response => {
    if (response) {
        sessionToken = response.token;
        console.log('session started, token: ', sessionToken);
    } else {
        console.log('error starting session');
    }
});

setInterval(async () => {
    try {
        await session.maintainSession(sessionToken);
        console.log('session maintained');
    } catch (error) {
        console.error('error maintaining session:', error);
    }
}, 3300000); 

app.get(`${baseAPIURL}auth/token`, (req, res) => {
    const serverKey = req.headers['x-server-key'];

    if (serverKey !== SERVER_KEY) {
        return res.sendStatus(403);
    }

    const token = auth.generateToken();
    res.json({ token: token });
});

app.post(`${baseAPIURL}gift/gold`, auth.authenticateToken, async(req, res) => {
    try {
        const {sender_id, receiver_id, amount} = req.body;

        if (!sender_id || !receiver_id || !amount) {
            return res.status(400).json({ error: 'Missing required fields in request body' });
        }

        const senderUlid = await players.getPlayerUlidFromPlayerId(sender_id);
        const receiverUlid = await players.getPlayerUlidFromPlayerId(receiver_id);

        if(senderUlid == null || receiverUlid == null) {
            res.status(500).json({ error: 'An unexpected error occurred' });
        }

        let senderWalletId = await balances.getWalletIdForHolder(senderUlid);
        if(senderWalletId == null)
            senderWalletId = await balances.createWallet(senderUlid);

        let receiverWalletId = await balances.getWalletIdForHolder(receiverUlid);
        if(receiverWalletId == null)
            receiverWalletId = await balances.createWallet(receiverUlid);

        const senderStatus = await balances.debitBalance(senderWalletId, amount);
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

app.post(`${baseAPIURL}gift/asset`, auth.authenticateToken, async(req, res) => {
    try {
        const { player_id, asset_id } = req.body;

        if (!player_id || !asset_id || !amount) {
            return res.status(400).json({ error: 'Missing required fields in request body' });
        }

        const status = await inventory.giftAsset(player_id, asset_id);
        const response = {
            status: status
        }
        res.json(response);
    }
    catch(error) {
        console.error('Error in /gift/asset:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});