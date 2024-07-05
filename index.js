require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const session = require('./session');
const PORT = process.env.PORT || 200;
const baseAPIURL = process.env.BASE_API_URL || "/api/v1/diwata/";
const gameId = process.env.GAME_ID;
const currencyId = process.env.CURRENCY_ID;

app.use(express.json());

async function getWalletIdForHolder(holderId) {
    try {
        const response = await axios.get(`https://api.lootlocker.io/admin/game/${gameId}/wallet/holder/${holderId}`, {
            headers: {
                'x-auth-token': sessionToken
            }
        });

        if (response.status === 200) {
            return response.data.id;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}

async function creditBalance(walletId, amount) {
    try {
        const response = await axios.post(`https://api.lootlocker.io/admin/game/${gameId}/balances/credit`, {
            wallet_id: walletId,
            currency_id: currencyId,
            amount: amount.toString()
        },
        {
            headers: {
                'x-auth-token': sessionToken,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            return response.data;
        } else {
            return null;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

async function debitBalance(walletId, amount) {
    try {
        const response = await axios.post(`https://api.lootlocker.io/admin/game/${gameId}/balances/debit`, {
            wallet_id: walletId,
            currency_id: currencyId,
            amount: amount.toString()
        },
        {
            headers: {
                'x-auth-token': sessionToken,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            return response.data;
        } else {
            return null;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

async function getPlayerIdByUsername(username) {
    try {
        const response = await axios.get(`https://api.lootlocker.io/admin/game/${gameId}/player/search?query=${username}`,
        {
            headers: {
                'x-auth-token': sessionToken,
            }
        });

        if (response.status === 200) {
            let playerId = null;
            response.data.players.forEach(player => {
                if(player.name == username)
                {
                    playerId = player.player_id
                }
            });
            return playerId;
        } else {
            return null;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

async function getPlayerUlidByPlayerId(playerId) {
    try {
        const response = await axios.get(`https://api.lootlocker.io/admin/v1/game/${gameId}/player/${playerId}`,
        {
            headers: {
                'x-auth-token': sessionToken,
            }
        });

        if (response.status === 200) {
            return response.data.player.ulid;
        } else {
            return null;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

async function createWallet(playerUlid) {
    try {
        const response = await axios.post(`https://api.lootlocker.io/admin/game/${gameId}/wallet`, {
            holder_id: playerUlid,
            holder_type: "player"
        },
        {
            headers: {
                'x-auth-token': sessionToken,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            return response.data.wallet_id;
        } else {
            return null;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

session.startSession().then(response => {
    if (response) {
        sessionToken = response.token;
        console.log('session started, token: ', sessionToken);
    } else {
        console.log('error starting session');
    }
});

app.get(`${baseAPIURL}gift/gold`, async (req, res) => {
    const { sender, receiver, amount } = req.query;
    console.log('sender: ', sender);
    console.log('receiver: ', receiver);
    try {
        const senderPlayerId = await getPlayerIdByUsername(sender);
        console.log('senderPlayerId: ', senderPlayerId);
        const senderPlayerUlid = await getPlayerUlidByPlayerId(senderPlayerId);
        console.log('senderPlayerUlid: ', senderPlayerUlid);
        let senderWalletId = await getWalletIdForHolder(senderPlayerUlid);
        if(senderWalletId == null)
        {
            senderWalletId = await createWallet(senderPlayerUlid);
        }
        console.log('senderWalletId: ', senderWalletId);

        const receiverPlayerId = await getPlayerIdByUsername(receiver);
        console.log('receiverPlayerId: ', receiverPlayerId);
        const receiverPlayerUlid = await getPlayerUlidByPlayerId(receiverPlayerId);
        console.log('receiverPlayerUlid: ', receiverPlayerUlid);
        let receiverWalletId = await getWalletIdForHolder(receiverPlayerUlid);
        if(receiverWalletId == null)
        {
            receiverWalletId = await createWallet(receiverPlayerUlid);
        }
        console.log('receiverWalletId: ', receiverWalletId);

        const senderStatus = await debitBalance(senderWalletId, amount);
        const receiverStatus = await creditBalance(receiverWalletId, amount);

        const response = {
            sender: senderStatus,
            receiver: receiverStatus
        };
        res.json(response);
    } catch (error) {
        console.error('Error in /gift/gold:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});