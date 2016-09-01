"use strict";

var RegexMap = require("./RegexMap");

var sample = {
		"hello": "Test 1: Plain string",
		"[a-z]{5}": "Test 2: Regex that matches earlier"
	};
	
var m = new RegexMap(sample);
console.log("Size of map: %d", m.size);

var test = "hello";
console.log("Test 1: " + (m.find(test) === sample[test]? "passed": "failed"));

test = "mdken";
console.log("Test 2: " + (m.find(test) === sample["[a-z]{5}"]? "passed": "failed"));

test = "2302";
var testValue = "Test 3: Add regex, number only";
m.add(/^[0-9]+$/, testValue);
console.log("Test 3: " + (m.find(test) === testValue? "passed": "failed"));

test = "34977mkn";
testValue = "Test 4: Item not found";
console.log("Test 4: " + (m.find(test) === null? "passed": "failed"));

test = "[]32nk";
testValue = "Test 5: Catch-all";
m.add(".*", testValue);
console.log("Test 5: " + (m.find(test) === testValue? "passed": "failed"));
