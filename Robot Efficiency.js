// SOLUTION 1: Closest Parcel First
function closestParcelRobot({place, parcels}, route) {
  if (route.length == 0) {
    // Find all parcels not yet picked up
    let available = parcels.filter(p => p.place != place);
    
    if (available.length == 0) {
      // All parcels picked up - deliver the first one
      let toDeliver = parcels[0];
      route = findRoute(roadGraph, place, toDeliver.address);
    } else {
      // Find the closest parcel to pick up
      let shortestRoute = null;
      let shortestDist = Infinity;
      
      for (let parcel of available) {
        let candidate = findRoute(roadGraph, place, parcel.place);
        if (candidate.length < shortestDist) {
          shortestDist = candidate.length;
          shortestRoute = candidate;
        }
      }
      route = shortestRoute;
    }
  }
  
  return {direction: route[0], memory: route.slice(1)};
}
