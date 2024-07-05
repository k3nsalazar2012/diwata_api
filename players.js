const axios = require('axios');

async function getPlayerUlidFromPlayerId(playerId) {
    try {
        const response = await axios.get(`https://api.lootlocker.io/server/players/lookup/name?player_id=${playerId}`, {
            headers: {
                'x-auth-token': sessionToken
            }
        });

        if (response.status === 200) {
            return response.data.players[0].ulid;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}

module.exports = { getPlayerUlidFromPlayerId };