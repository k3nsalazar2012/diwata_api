const axios = require('axios');

async function giftAsset(playerId, assetId) {
    try {
        const response = await axios.post(`https://api.lootlocker.io/server/player/${playerId}/inventory`, {
            asset_id: assetId,
        },
        {
            headers: {
                'LL-Version': '2021-03-01',
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

module.exports = { giftAsset };