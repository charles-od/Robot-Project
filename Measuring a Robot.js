function compareRobots(robot1, robot2, memory1, memory2) {
    let total1 = 0, total2 = 0; 
    const iterations =100;

    // Run 100 tasks
    for (let i = 0; i < iterations; i++) {
        

    // Generating one task for both robots
    let task = VillageState.random();

    // Run robot 1 on this task
    let state1 = task;
    let mem1 = memory1;
    let steps1 = 0;

    while (state1.parcels.length > 0) {
      let action1 = robot1(state1, mem1);
      state1 = state1.move(action1.direction);
      mem1 = action1.memory;
      steps1++;
    }
    total1 += steps1;

    // Run robot 2 on same task
    let state2 = task;
    let mem2 = memory2;
    let steps2 = 0;

    while (state2.parcels.length > 0) {
      let action2 = robot2(state2, mem2);
      state2 = state2.move(action2.direction);
      mem2 = action2.memory;
      steps2++;
    }

    total2 += steps2;
  }
// Calculating and displaying average steps for both robots
  console.log(`Robot 1 average steps: ${total1 / iterations} turns`);
  console.log(`Robot 2 average steps: ${total2 / iterations} turns`);
  
}
compareRobots(routeRobot, [], goalOrientedRobot, []);
