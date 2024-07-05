require('dotenv').config();
const axios = require('axios');
const serverKey = process.env.SERVER_KEY;

async function startSession() {
    try {
        const response = await axios.post('https://api.lootlocker.io/server/session', {
            game_version: '1.0.0.0',
        }, {
        headers: {
            'LL-Version': '2021-03-01',
            'Content-Type': 'application/json',
            'x-server-key': serverKey
        }
        });

        if (response.status === 200) {
            return response.data;
        } else {
            return null;
        }
    } catch (error) {
        console.error('error starting session:', error);
        return null;
    }
}

async function maintainSession(sessionToken) {
    try {
        const response = await axios.get('https://api.lootlocker.io/server/ping',
        {
            headers: 
            {
                'LL-Version': '2021-03-01',
                'x-auth-token': sessionToken
            }
        });

        if (response.status === 200) {
            console.log('session maintained: ', response.data);
            return response.data;
        } else {
            return null;
        }
    } catch (error) {
        console.error('error maintaining session:', error);
        return null;
    }
}

module.exports = { startSession, maintainSession };