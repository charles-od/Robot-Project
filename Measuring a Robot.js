/*
This code defines a simulation of a robot delivering parcels in a village.
*/
const roads = [
  "Alice's House-Bob's House",   "Alice's House-Cabin",
  "Alice's House-Post Office",   "Bob's House-Town Hall",
  "Daria's House-Ernie's House", "Daria's House-Town Hall",
  "Ernie's House-Grete's House", "Grete's House-Farm",
  "Grete's House-Shop",          "Marketplace-Farm",
  "Marketplace-Post Office",     "Marketplace-Shop",
  "Marketplace-Town Hall",       "Shop-Town Hall"
];

function buildGraph(edges) {
  let graph = Object.create(null);
  function addEdge(from, to) {
    if (from in graph) {
      graph[from].push(to);
    } else {
      graph[from] = [to];
    }
  }
  for (let [from, to] of edges.map(r => r.split("-"))) {
    addEdge(from, to);
    addEdge(to, from);
  }
  return graph;
}

const roadGraph = buildGraph(roads);

// VILLAGE STATE CLASS
class VillageState {
  constructor(place, parcels) {
    this.place = place;
    this.parcels = parcels;
  }
  move(destination) {
    if (!roadGraph[this.place].includes(destination)) {
      return this;
    } else {
      let parcels = this.parcels.map(p => {
        if (p.place != this.place) return p;
        return {place: destination, address: p.address};
      }).filter(p => p.place != p.address);
      return new VillageState(destination, parcels);
    }
  }
}

// ====== RANDOM UTILITIES ======
function randomPick(array) {
  let choice = Math.floor(Math.random() * array.length);
  return array[choice];
}

VillageState.random = function(parcelCount = 5) {
  let parcels = [];
  for (let i = 0; i < parcelCount; i++) {
    let address = randomPick(Object.keys(roadGraph));
    let place;
    do {
      place = randomPick(Object.keys(roadGraph));
    } while (place == address);
    parcels.push({place, address});
  }
  return new VillageState("Post Office", parcels);
};

// ========== RANDOM ROBOT ==========
function randomRobot(state) {
  return {direction: randomPick(roadGraph[state.place])};
}

// ====== MAIL ROUTE ========
const mailRoute = [
  "Alice's House", "Cabin", "Alice's House", "Bob's House",
  "Town Hall", "Daria's House", "Ernie's House", "Grete's House",
  "Shop", "Grete's House", "Farm", "Marketplace", "Post Office"
];

// ========== ROUTE ROBOT ==========
function routeRobot(state, memory) {
  if (memory.length == 0) {
    memory = mailRoute;
  }
  return {direction: memory[0], memory: memory.slice(1)};
}

// ========== FIND ROUTE ==========
function findRoute(graph, from, to) {
  let work = [{at: from, route: []}];
  for (let i = 0; i < work.length; i++) {
    let {at, route} = work[i];
    for (let place of graph[at]) {
      if (place == to) return route.concat(place);
      if (!work.some(w => w.at == place)) {
        work.push({at: place, route: route.concat(place)});
      }
    }
  }
}


// ========== GOAL ORIENTED ROBOT ==========
function goalOrientedRobot({place, parcels}, route) {
  if (route.length == 0) {
    let parcel = parcels[0];
    if (parcel.place != place) {
      route = findRoute(roadGraph, place, parcel.place);
    } else {
      route = findRoute(roadGraph, place, parcel.address);
    }
  }
  return {direction: route[0], memory: route.slice(1)};
}

// ======== RUN ROBOT FUNCTION  ========
function runRobot(state, robot, memory) {
  for (let turn = 0;; turn++) {
    if (state.parcels.length == 0) {
      return turn;  // Return number of turns instead of logging
    }
    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;
  }
}

// ====== COMPARING ROBOTS =======
function compareRobots(robot1, memory1, robot2, memory2) {
  const iterations = 100;
  let total1 = 0;
  let total2 = 0;
  
  for (let i = 0; i < iterations; i++) {
    // Generate ONE task for both robots
    let task = VillageState.random();
    
    // Run robot 1
    let steps1 = runRobot(task, robot1, memory1);
    total1 += steps1;
    
    // Run robot 2 on SAME task
    let steps2 = runRobot(task, robot2, memory2);
    total2 += steps2;
  }
  
  console.log(`Robot 1 average: ${total1 / iterations} turns`);
  console.log(`Robot 2 average: ${total2 / iterations} turns`);
  console.log(`Difference: ${Math.abs(total1 - total2) / iterations} turns`);
  
  return {
    robot1Avg: total1 / iterations,
    robot2Avg: total2 / iterations
  };
}

// ========= TESTING THE ROBOTS ========
console.log("=== Comparing Route Robot vs Goal Oriented Robot ===");
compareRobots(routeRobot, [], goalOrientedRobot, []);

console.log("\n=== Comparing Random Robot vs Route Robot ===");
compareRobots(randomRobot, [], routeRobot, []);

console.log("\n=== Comparing Random Robot vs Goal Oriented Robot ===");
compareRobots(randomRobot, [], goalOrientedRobot, []);