require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { db, updateGold, updateBothGold, getGoldValueByType } = require('./database');
const session = require('./session');
const balances = require('./balances');
const players = require('./players');
const inventory = require('./inventory');
const auth = require('./auth');
const { initializeClient, spawnTreasureIfNull } = require('./room');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 200;
const baseAPIURL = process.env.BASE_API_URL || "/api/v1/diwata/";
const SERVER_KEY = process.env.SERVER_KEY;

app.use(express.json());

session.startSession().then(response => {
    if (response) {
        sessionToken = response.token;
        console.log('session started, token: ', sessionToken);
        spawnTreasureIfNull();
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


wss.on('connection', async (ws, req) => {
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const clientKey = urlParams.get('serverKey');

    if (clientKey !== SERVER_KEY) {
        ws.close();
        console.log('Connection closed due to invalid server key');
        return;
    }

    console.log('New client connected');

    const initializeReponse = await initializeClient();
    ws.send(initializeReponse);

    ws.on('message', (message) => {
        //console.log(`Received: ${message}`);
        //ws.send(`You said: ${message}`);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

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

app.get(`${baseAPIURL}gold/world`, async (req, res) => {
    const serverKey = req.headers['x-server-key'];
    if (serverKey !== SERVER_KEY) {
        return res.sendStatus(403);
    }

    try {
        const value = await getGoldValueByType('world-gold');
        if (value !== null) {
            res.json({ type: 'world-gold', value: value });
        } else {
            res.status(404).json({ error: 'Gold type not found' });
        }
    } catch (err) {
        console.error('Error fetching world-gold value:', err);
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
});
  
app.get(`${baseAPIURL}gold/pot`, async (req, res) => {
    const serverKey = req.headers['x-server-key'];
    if (serverKey !== SERVER_KEY) {
        return res.sendStatus(403);
    }

    try {
        const value = await getGoldValueByType('pot-gold');
        if (value !== null) {
            res.json({ type: 'pot-gold', value: value });
        } else {
            res.status(404).json({ error: 'Gold type not found' });
        }
    } catch (err) {
        console.error('Error fetching pot-gold value:', err);
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
});

app.get(`${baseAPIURL}activity/rest`, (req, res) => {
    const serverKey = req.headers['x-server-key'];
    if (serverKey !== SERVER_KEY) {
        return res.sendStatus(403);
    }

    const amount = 2.5;
    updateGold('world-gold', amount)
        .then(updatedValue => {
            res.json({ status: 'success', activity: 'rest' });
        })
        .catch(err => {
            console.error('Error updating world-gold:', err);
            res.status(500).json({ error: 'An unexpected error occurred' });
        });
});

app.get(`${baseAPIURL}activity/bless`, (req, res) => {
    const serverKey = req.headers['x-server-key'];
    if (serverKey !== SERVER_KEY) {
        return res.sendStatus(403);
    }
    
    const amount = 2.5;
    updateGold('world-gold', amount)
        .then(updatedValue => {
            res.json({ status: 'success', activity: 'bless' });
        })
        .catch(err => {
            console.error('Error updating world-gold:', err);
            res.status(500).json({ error: 'An unexpected error occurred' });
        });
});

app.get(`${baseAPIURL}activity/help/person`, (req, res) => {
    const serverKey = req.headers['x-server-key'];
    if (serverKey !== SERVER_KEY) {
        return res.sendStatus(403);
    }
    
    const amount = 2.5;
    updateGold('world-gold', amount)
        .then(updatedValue => {
            res.json({ status: 'success', activity: 'help person' });
        })
        .catch(err => {
            console.error('Error updating world-gold:', err);
            res.status(500).json({ error: 'An unexpected error occurred' });
        });
});

app.get(`${baseAPIURL}activity/help/creature`, (req, res) => {
    const serverKey = req.headers['x-server-key'];
    if (serverKey !== SERVER_KEY) {
        return res.sendStatus(403);
    }
    
    const amount = 2.5;
    updateGold('world-gold', amount)
        .then(updatedValue => {
            res.json({ status: 'success', activity: 'help creature' });
        })
        .catch(err => {
            console.error('Error updating world-gold:', err);
            res.status(500).json({ error: 'An unexpected error occurred' });
        });
});

app.get(`${baseAPIURL}activity/rank`, (req, res) => {
    const serverKey = req.headers['x-server-key'];
    if (serverKey !== SERVER_KEY) {
        return res.sendStatus(403);
    }
    
    const worldAmount = 2;
    const potAmount = 1;

    updateBothGold(worldAmount, potAmount)
        .then(([updatedWorldValue, updatedPotValue]) => {
            res.json({
                status: 'success',
                activity: 'join daily rank'
            });
        })
        .catch(err => {
            console.error('Error updating gold values:', err);
            res.status(500).json({ error: 'An unexpected error occurred' });
        });
});

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});