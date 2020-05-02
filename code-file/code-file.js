#!/usr/bin/env node

var fs = require("fs");
var tabReplacement = null;
var languages = { /* override extension value */
	js: "javascript"
};

var readFile = function(name, codeBlock) {
	var from = 1;
	var to = -1;
	
	/* hash present? */
	var hashIndex = name.lastIndexOf("#");
	if (hashIndex > -1) {
		var numbers = name.substring(hashIndex+1).split("-");
		from = parseInt(numbers[0]);
		to = numbers.length > 1 ? parseInt(numbers[1]) : from;
		name = name.substring(0, hashIndex);
	}
	
	/* read data */
	try {
		var data = fs.readFileSync(name).toString();
	} catch (e) {
		process.stderr.write("Error including '" + name + "': " + e.message + "\n");
		return;
	}
	
	/* pick lines */
	var lines = data.split("\n");
	if (to == -1) { to = lines.length; }
	lines = lines.slice(from-1, to);
	data = lines.join("\n");
	
	/* replace tabs? */
	if (tabReplacement !== null) { data = data.replace(/\t/g, tabReplacement); }
	
	/* return the result */
	codeBlock.c[1] = data;
	
	/* syntax from extension */
	var dotIndex = name.lastIndexOf(".");
	if (dotIndex > -1) {
		var extension = name.substring(dotIndex+1);
		var language = languages[extension] || extension;
		var classes = codeBlock.c[0][1];
		if (language && classes.indexOf(language) == -1) { classes.push(language); }
	}
}

var processCodeBlock = function(codeBlock) {
	var meta = codeBlock.c[0];
	var classes = meta[1];
	var namevals = meta[2];

	meta[2] = meta[2].filter(function(nameval) {
		var name = nameval[0];
		var value = nameval[1];
		if (name != "file") { return true; }

		readFile(value, codeBlock, classes);
		return false;
	});
	
	meta[1] = classes;
	meta[2] = namevals;
}

var walkArray = function(arr) {
	arr.forEach(walk);
}

var walkObject = function(obj) {
	if (obj.t == "CodeBlock") {
		processCodeBlock(obj);
		return;
	}
	
	for (var p in obj) {
		if (p == "tab-stop" && obj[p] && obj[p].t == "MetaString") {
			tabReplacement = new Array(parseInt(obj[p].c)+1).join(" ");
		}
		walk(obj[p]); 
	}
}

var walk = function(node) {
	if (node instanceof Array) { 
		walkArray(node); 
	} else if (typeof(node) == "object") { 
		walkObject(node); 
	}
}

var input = fs.readFileSync("/dev/stdin").toString();

var root = JSON.parse(input);
walk(root);

var output = JSON.stringify(root);
process.stdout.write(output);
