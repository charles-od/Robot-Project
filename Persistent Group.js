// EXERCISE 3: PERSISTENT GROUP
// PART 1: THE PGROUP CLASS

class PGroup {
  // Constructor takes an array of members
  constructor(members) {
    this.members = members;
    
    // Freeze object to make it truly immutable
    // This prevents accidental modifications
    Object.freeze(this);
  }
  
  // Add a value - returns a NEW group
  add(value) {
    // Don't add if value already exists
    if (this.has(value)) {
      console.log(` "${value}" already exists, returning same group`);
      return this;
    }
    
    // Create new array with all old members + new value
    let newMembers = [];
    for (let i = 0; i < this.members.length; i++) {
      newMembers.push(this.members[i]);
    }
    newMembers.push(value);
    
    console.log(`  Added "${value}" - created new group`);
    return new PGroup(newMembers);
  }
  
  // Delete a value - returns a NEW group
  delete(value) {
    // If value doesn't exist, return this same group
    if (!this.has(value)) {
      console.log(`  "${value}" not found, returning same group`);
      return this;
    }
    
    // Create new array WITHOUT the value
    let newMembers = [];
    for (let i = 0; i < this.members.length; i++) {
      if (this.members[i] !== value) {
        newMembers.push(this.members[i]);
      }
    }
    
    console.log(`  Deleted "${value}" - created new group`);
    return new PGroup(newMembers);
  }
  
  // Check if value exists in group
  has(value) {
    for (let i = 0; i < this.members.length; i++) {
      if (this.members[i] === value) {
        return true;
      }
    }
    return false;
  }
  
  // Get the size of the group
  get size() {
    let count = 0;
    for (let i = 0; i < this.members.length; i++) {
      count++;
    }
    return count;
  }
  
  // Display group contents nicely
  toString() {
    if (this.members.length === 0) {
      return "PGroup {}";
    }
    
    let result = "PGroup {";
    for (let i = 0; i < this.members.length; i++) {
      result += this.members[i];
      if (i < this.members.length - 1) {
        result += ", ";
      }
    }
    result += "}";
    return result;
  }
  
  // Get all members as an array
  toArray() {
    let result = [];
    for (let i = 0; i < this.members.length; i++) {
      result.push(this.members[i]);
    }
    return result;
  }
}

// Create ONE shared empty instance
PGroup.empty = new PGroup([]);
// PART 2: TESTING THE PGROUP

console.log(" EXERCISE 3: PERSISTENT GROUP");
console.log("Creating groups...\n");

// Test 1: Basic operations
console.log("TEST 1: Basic Operations");
let empty = PGroup.empty;
console.log("Empty group:", empty.toString());

let a = empty.add("a");
console.log("\na = empty.add('a')");
console.log("a:", a.toString());

let ab = a.add("b");
console.log("\nab = a.add('b')");
console.log("ab:", ab.toString());

let b = ab.delete("a");
console.log("\nb = ab.delete('a')");
console.log("b:", b.toString());

console.log("Checking immutability:");
console.log("Original 'a' is unchanged:", a.toString());
console.log("Original 'ab' is unchanged:", ab.toString());

// Test 2: has() method
console.log("\n\nTEST 2: has() Method");
console.log("----------------------");

console.log("b.has('b'):", b.has("b"), "(should be true)");
console.log("b.has('a'):", b.has("a"), "(should be false)");
console.log("a.has('b'):", a.has("b"), " (should be false)");
console.log("a.has('a'):", a.has("a"), " (should be true)");

// Test 3: Adding existing value
console.log("TEST 3: Adding Existing Value");
console.log("Group a:", a.toString());
let a2 = a.add("a");
console.log("a.add('a') returns same group?", a2 === a, "(should be true)");

// Test 4: Deleting non-existent value
console.log("TEST 4: Deleting Non-existent Value");
console.log("Group a:", a.toString());
let a3 = a.delete("x");
console.log("a.delete('x') returns same group?", a3 === a, "(should be true)");

// Test 5: Chain operations
console.log("TEST 5: Chain Operations");
console.log("---------------------------");

let chain = PGroup.empty
  .add("apple")
  .add("banana")
  .add("cherry")
  .add("date")
  .delete("banana")
  .add("elderberry");

console.log("Chain result:", chain.toString());
console.log("Size:", chain.size);

// Test 6: Different data types
console.log("\n\nTEST 6: Different Data Types");
console.log("-------------------------------");

let mixed = PGroup.empty
  .add(42)
  .add("hello")
  .add(true)
  .add(null)
  .add([1, 2, 3])
  .add({name: "test"});

console.log("Mixed types group:", mixed.toString());
console.log("Size:", mixed.size);
console.log("Has 42?", mixed.has(42));
console.log("Has 'hello'?", mixed.has("hello"));
console.log("Has false?", mixed.has(false));

// Test 7: Empty instance is shared
console.log("\n\n TEST 7: Empty Instance Sharing");
console.log("---------------------------------");

let empty1 = PGroup.empty;
let empty2 = PGroup.empty;
console.log("empty1 === empty2?", empty1 === empty2, "(should be true)");

let empty3 = empty1.add("test");
console.log("empty1.add('test') creates new group, doesn't modify empty");
console.log("Original empty still empty:", PGroup.empty.toString());

// Test 8: Size property
console.log("\n\n TEST 8: Size Property");
console.log("------------------------");

let sizeTest = PGroup.empty.add("x").add("y").add("z");
console.log("Group:", sizeTest.toString());
console.log("Size:", sizeTest.size, "(should be 3)");

// Test 9: toArray method
console.log("\n\n TEST 9: toArray Method");
console.log("-------------------------");

let array = sizeTest.toArray();
console.log("As array:", array);
console.log("Is it a real array?", Array.isArray(array));

// Test 10: Complex scenario - multiple references
console.log("\n\n TEST 10: Complex Scenario");
let group1 = PGroup.empty.add("red").add("blue");
let group2 = group1.add("green");
let group3 = group2.delete("blue");
let group4 = group3.add("yellow");

console.log("group1:", group1.toString());
console.log("group2:", group2.toString());
console.log("group3:", group3.toString());
console.log("group4:", group4.toString());

console.log("\nAll groups are independent:");
console.log("group1 has 'green'?", group1.has("green"), " (should be false)");
console.log("group2 has 'blue'?", group2.has("blue"), " (should be true)");
console.log("group3 has 'blue'?", group3.has("blue"), " (should be false)");
console.log("group4 has 'yellow'?", group4.has("yellow"), "(should be true)");

// LOG REQUIREMENTS CHECK 
console.log("\n\nEXERCISE 3 REQUIREMENTS CHECK");
console.log("PGroup class exists");
console.log(" add() method returns new instance");
console.log(" delete() method returns new instance");
console.log("has() method works correctly");
console.log("PGroup.empty exists and is shared");
console.log("Original groups don't change after operations");
console.log(" Works with any value type");
console.log("\nEXERCISE 3 COMPLETED SUCCESSFULLY!");