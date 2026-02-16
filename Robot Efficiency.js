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

//PART 2: VILLAGE STATE

class VillageState {
  constructor(place, parcels) {
    this.place = place;
    this.parcels = parcels;
  }

  move(destination) {
    if (!roadGraph[this.place].includes(destination)) {
      return this;
    }
    
    let parcels = this.parcels.map(p => {
      if (p.place != this.place) return p;
      return {place: destination, address: p.address};
    }).filter(p => p.place != p.address);
    
    return new VillageState(destination, parcels);
  }
}

//PART 3: HELPER FUNCTIONS

function randomPick(array) {
  let choice = Math.floor(Math.random() * array.length);
  return array[choice];
}

VillageState.random = function(parcelCount = 5) {
  let parcels = [];
  let allPlaces = Object.keys(roadGraph);
  for (let i = 0; i < parcelCount; i++) {
    let address = randomPick(allPlaces);
    let place;
    do {
      place = randomPick(allPlaces);
    } while (place == address);
    
    parcels.push({place, address});
  }
  
  return new VillageState("Post Office", parcels);
};
function runRobot(state, robot, memory) {
  for (let turn = 0; ; turn++) {
    if (state.parcels.length == 0) {
      return turn;
    }  
    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;
    if (turn > 1000) return 1000;
  }
}

// PART 4:   PATHFINDING

function findRoute(graph, from, to) {
  let work = [{at: from, route: []}];
  
  for (let i = 0; i < work.length; i++) {
    let {at, route} = work[i];
    
    for (let place of graph[at]) {
      if (place == to) {
        return route.concat(place);
      }
      
      if (!work.some(w => w.at == place)) {
        work.push({at: place, route: route.concat(place)});
      }
    }
  }
}

// ========== PART 5: ORIGINAL ROBOTS (for comparison) ==========

const mailRoute = [
  "Alice's House", "Cabin", "Alice's House", "Bob's House",
  "Town Hall", "Daria's House", "Ernie's House",
  "Grete's House", "Shop", "Grete's House", "Farm",
  "Marketplace", "Post Office"
];

function routeRobot(state, memory) {
  if (memory.length == 0) {
    memory = mailRoute;
  }
  return {
    direction: memory[0],
    memory: memory.slice(1)
  };
}

function goalOrientedRobot({place, parcels}, route) {
  if (route.length == 0) {
    let parcel = parcels[0];
    
    if (parcel.place != place) {
      route = findRoute(roadGraph, place, parcel.place);
    } else {
      route = findRoute(roadGraph, place, parcel.address);
    }
  }
  
  return {
    direction: route[0],
    memory: route.slice(1)
  };
}

// ========== PART 6: COMPARE ROBOTS FUNCTION (FOR EXERCISE 2) ==========

function compareRobots(robot1, memory1, robot2, memory2) {
  console.log("\nCOMPARISON RESULTS");
  console.log("=====================");
  
  const numberOfTests = 100;
  let total1 = 0;
  let total2 = 0;
  
  for (let test = 1; test <= numberOfTests; test++) {
    // Create ONE village for both robots
    let testVillage = VillageState.random();
    
    // Deep copy for robot 1
    let village1 = new VillageState(testVillage.place, 
      testVillage.parcels.map(p => ({place: p.place, address: p.address})));
    
    // Deep copy for robot 2
    let village2 = new VillageState(testVillage.place, 
      testVillage.parcels.map(p => ({place: p.place, address: p.address})));
    
    let turns1 = runRobot(village1, robot1, memory1);
    let turns2 = runRobot(village2, robot2, memory2);
    
    total1 += turns1;
    total2 += turns2;
  }
  
  let avg1 = (total1 / numberOfTests).toFixed(2);
  let avg2 = (total2 / numberOfTests).toFixed(2);
  
  console.log(`Robot 1 average: ${avg1} turns`);
  console.log(`Robot 2 average: ${avg2} turns`);
  
  if (avg1 < avg2) {
    console.log(` Robot 1 is faster by ${(avg2 - avg1).toFixed(2)} turns`);
  } else if (avg2 < avg1) {
    console.log(` Robot 2 is faster by ${(avg1 - avg2).toFixed(2)} turns`);
  } else {
    console.log(` Robots are equally fast`);
  }
  
  return { avg1, avg2 };
}
//ROBOT A: Closest Parcel First
function closestParcelRobot({place, parcels}, route) {
  // Follow existing route
  if (route.length > 0) {
    return {
      direction: route[0],
      memory: route.slice(1)
    };
  }
  let bestRoute = null;
  let shortestDist = Infinity;
  for (let parcel of parcels) {
    let target;
    if (parcel.place != place) {
      target = parcel.place; // Need to pick up
    } else {
      target = parcel.address; // Need to deliver
    }
    
    let candidateRoute = findRoute(roadGraph, place, target);
    
    if (candidateRoute.length < shortestDist) {
      shortestDist = candidateRoute.length;
      bestRoute = candidateRoute;
    }
  }
  
  return {
    direction: bestRoute[0],
    memory: bestRoute.slice(1)
  };
}

// ROBOT B: Delivery Priority Robot
function deliveryPriorityRobot({place, parcels}, route) {
  if (route.length > 0) {
    return {
      direction: route[0],
      memory: route.slice(1)
    };
  }
    let toDeliver = [];
  let toPickup = [];
  
  for (let parcel of parcels) {
    if (parcel.place == place) {
      toDeliver.push(parcel); // We have it - deliver it
    } else {
      toPickup.push(parcel); // Need to pick it up
    }
  }
  
  // PRIORITY 1: Deliver parcels we're carrying
  if (toDeliver.length > 0) {
    // Finding the closest delivery
    let bestRoute = null;
    let shortestDist = Infinity;
    
    for (let parcel of toDeliver) {
      let route = findRoute(roadGraph, place, parcel.address);
      if (route.length < shortestDist) {
        shortestDist = route.length;
        bestRoute = route;
      }
    }
    
    return {
      direction: bestRoute[0],
      memory: bestRoute.slice(1)
    };
  }
  
  // PRIORITY 2: Pick up teh parcels
  if (toPickup.length > 0) {
    let bestRoute = null;
    let shortestDist = Infinity;
    
    for (let parcel of toPickup) {
      let route = findRoute(roadGraph, place, parcel.place);
      if (route.length < shortestDist) {
        shortestDist = route.length;
        bestRoute = route;
      }
    }
    
    return {
      direction: bestRoute[0],
      memory: bestRoute.slice(1)
    };
  }
  
  // Fallback
  return {
    direction: roadGraph[place][0],
    memory: []
  };
}

// ----- ROBOT C: Smart Batch Robot -----
function batchRobot({place, parcels}, route) {
  if (route.length > 0) {
    return {
      direction: route[0],
      memory: route.slice(1)
    };
  }
  
  // Group parcels by location
  let deliveries = {};
  let pickups = {};
  
  for (let parcel of parcels) {
    if (parcel.place == place) {
      // This parcel needs delivery
      if (!deliveries[parcel.address]) {
        deliveries[parcel.address] = [];
      }
      deliveries[parcel.address].push(parcel);
    } else {
      // This parcel needs pickup
      if (!pickups[parcel.place]) {
        pickups[parcel.place] = [];
      }
      pickups[parcel.place].push(parcel);
    }
  }
  
  // If we have deliveries, go to the closest delivery address
  if (Object.keys(deliveries).length > 0) {
    let bestRoute = null;
    let shortestDist = Infinity;
    
    for (let address in deliveries) {
      let route = findRoute(roadGraph, place, address);
      if (route.length < shortestDist) {
        shortestDist = route.length;
        bestRoute = route;
      }
    }
    
    return {
      direction: bestRoute[0],
      memory: bestRoute.slice(1)
    };
  }
  
  // Otherwise, go to the location with the most pickups
  let bestLocation = null;
  let maxParcels = 0;
  let bestRoute = null;
  let shortestDist = Infinity;
  
  for (let location in pickups) {
    let count = pickups[location].length;
    let route = findRoute(roadGraph, place, location);
    
    // Prefer locations with more parcels AND shorter routes
    let score = count * 10 - route.length;
    
    if (score > maxParcels) {
      maxParcels = score;
      bestLocation = location;
      bestRoute = route;
    }
  }
  
  if (bestRoute) {
    return {
      direction: bestRoute[0],
      memory: bestRoute.slice(1)
    };
  }
  
  // Ultimate fallback
  return {
    direction: roadGraph[place][0],
    memory: []
  };
}

// PART 8: RUNNING ALL COMPARISONS FOR EXERCISE 2
console.log("EXERCISE 2: ROBOT EFFICIENCY");

// First, establish baseline with original robots
console.log("BASELINE COMPARISON (Original Robots)");
compareRobots(routeRobot, [], goalOrientedRobot, []);

// Now test our improved robots
console.log("TESTING IMPROVED ROBOTS");

console.log("Closest Parcel Robot vs Goal-Oriented Robot:");
compareRobots(closestParcelRobot, [], goalOrientedRobot, []);

console.log("Delivery Priority Robot vs Goal-Oriented Robot:");
compareRobots(deliveryPriorityRobot, [], goalOrientedRobot, []);

console.log("Batch Robot vs Goal-Oriented Robot:");
compareRobots(batchRobot, [], goalOrientedRobot, []);

// Head 2 Head between our best robots
console.log("CHAMPIONSHIP ROUND");
console.log("Batch Robot vs Delivery Priority Robot:");
compareRobots(batchRobot, [], deliveryPriorityRobot, []);

console.log("Batch Robot vs Closest Parcel Robot:");
compareRobots(batchRobot, [], closestParcelRobot, []);

// Bonus: See if any robot beats all others
console.log("FINAL JUDGEMENT: Batch Robot vs ALL others");

function ultimateComparison() {
  console.log("Comparing ALL robots (50 runs each):");
  
  let robots = [
    {name: "Route Robot", func: routeRobot, memory: []},
    {name: "Goal Robot", func: goalOrientedRobot, memory: []},
    {name: "Closest Robot", func: closestParcelRobot, memory: []},
    {name: "Priority Robot", func: deliveryPriorityRobot, memory: []},
    {name: "Batch Robot", func: batchRobot, memory: []}
  ];
  
  let results = [];
  let testCount = 50;
  
  for (let robot of robots) {
    let total = 0;
    
    for (let test = 0; test < testCount; test++) {
      let village = VillageState.random();
      total += runRobot(village, robot.func, robot.memory);
    }
    
    let avg = (total / testCount).toFixed(2);
    results.push({name: robot.name, avg: parseFloat(avg)});
    console.log(`${robot.name}: ${avg} turns`);
  }
  
  results.sort((a, b) => a.avg - b.avg);
  console.log(`WINNER: ${results[0].name} with ${results[0].avg} turns!`);
}

ultimateComparison();

console.log("FINALLY, THE TEST HAS BEEN COMPLETED ");