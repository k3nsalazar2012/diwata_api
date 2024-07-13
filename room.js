const crypto = require('crypto');

const { db, updateGold, updateBothGold, getGoldValueByType } = require('./database');

let treasure = null;;
let creature = null;
let person = null;

const SPAWN_TYPE = Object.freeze ({
    TREASURE: 1,
    CREATURE: 2,
    PERSON: 3
});

const OP_CODE = Object.freeze({
    CONNECT: 1,
    CLAIM: 2,
    UPDATE: 3,
    FOURTH_CODE: 4,
    FIFTH_CODE: 5
});

async function initializeClient() {
    const response = {
        op_code: OP_CODE.CONNECT,
        treasure: treasure,
        creature: creature,
        person: person
    }

    return JSON.stringify(response);
}

async function spawnTreasureIfNull() {
    if(treasure !== null) return;
    const gold = await getGoldValueByType('world-gold');
    if(gold >= 1) {
        console.log(`treasure spawned`);
        updateGold('world-gold', -1);

        const previousTreasure = treasure == null ? null : treasure;

        treasure = new Collectible(1, generateInstanceId(), SPAWN_TYPE.TREASURE, "Treasure", getRandomNumber(previousTreasure == null ? 0 : previousTreasure.spawn_point));
    }
}

async function spawnCreatureIfNull() {
    if(creature !== null) return;
}

async function spawnPersonIfNull() {
    if(person !== null) return;
}

class Collectible {
    constructor(id, instanceId, type, name, spawn_point) {
        this.id = id;
        this.instanceId = instanceId;
        this.type = type;
        this.name = name;
        this.spawn_point = spawn_point;
    }
}

function generateInstanceId() {
    return crypto.randomBytes(4).toString('hex');
}

function getRandomNumber(previousNumber) {
    let newNumber;
    do {
        newNumber = Math.floor(Math.random() * 10);
    } while (newNumber === previousNumber);
    return newNumber;
}

module.exports = { initializeClient, spawnTreasureIfNull, spawnCreatureIfNull, spawnPersonIfNull };