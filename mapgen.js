const MAP_WIDTH = 10;
const MAP_HEIGHT = 10;

const BUILDING_TYPES = [
    { 
        name: "House",
        icon: 0
    },
    { 
        name: "Hospital",
        icon: 1,
        spawnChance: 10
    },
    { 
        name: "Power Station",
        icon: 2,
        spawnChance: 20
    },
    {
        name: "Secret Lab",
        icon: 3,
        spawnChance: 5
    }
];

// Defaults to first building
const DEFAULT_BUILDING = BUILDING_TYPES[0];

const sumOfSpawnChances = BUILDING_TYPES.reduce((sum, building) => {
    return building.spawnChance ? sum + building.spawnChance : sum;
}, 0);
if (sumOfSpawnChances > 100) {
    console.error("WARNING - Spawn Chances sum to more than 100%");
}

function randomBuilding() {
    const value = Math.random() * 100;
    let cumulative = 0;
    for (let index = 0; index < BUILDING_TYPES.length; index++) {
        const building = BUILDING_TYPES[index];
        if (!building.spawnChance) {
            continue;
        }
        
        if (value < building.spawnChance + cumulative) {
            return building;
        }
        cumulative += building.spawnChance;
    }

    return DEFAULT_BUILDING;
}

function generateMap() {
    console.log("Generating map...");
    const map = {
        width: MAP_WIDTH,
        height: MAP_HEIGHT,
        tiles: Array(MAP_HEIGHT * MAP_WIDTH)
    }

    for (let x = 0; x < map.width; x++) {
        for (let y = 0; y < map.height; y++) {
            map.tiles[x + (map.width * y)] = {
                threat: 0,
                type: randomBuilding(),
                secure: false
            };
        }
    }

    return map;
}

exports.generateMap = generateMap;
