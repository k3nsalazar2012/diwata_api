require('dotenv').config();
const axios = require('axios');
const currencyId = process.env.CURRENCY_ID;

async function creditBalance(walletId, amount) {
    try {
        const response = await axios.post(`https://api.lootlocker.io/server/balances/credit`, {
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
        const response = await axios.post(`https://api.lootlocker.io/server/balances/debit`, {
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

async function getWalletIdForHolder(holderId) {
    try {
        const response = await axios.get(`https://api.lootlocker.io/server/wallet/holder/${holderId}`, {
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

async function createWallet(playerUlid) {
    try {
        const response = await axios.post(`https://api.lootlocker.io/server/wallet`, {
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

module.exports = { creditBalance, debitBalance, getWalletIdForHolder, createWallet };