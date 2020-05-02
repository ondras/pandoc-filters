#!/usr/bin/env node

var fs = require("fs");
var exec = require("child_process").exec;
var format = "png";

var _lock = 0;
var input = fs.readFileSync("/dev/stdin").toString();
var root = JSON.parse(input);

var lock = function() { // once for every external program run
	_lock++;
}

var unlock = function() { // parsing and/or command finished
	_lock--;
	if (_lock) { return; }

	var output = JSON.stringify(root);
	process.stdout.write(output);
}

var processImage = function(image) {
	var meta = image.c[1];
	var src = meta[0];
	
	if (src.match(/(^|:)\/\//)) { return; } // web link
	var parts = src.split(".");
	var ext = parts.pop();
	if (ext != "dot") { return; }
	
	try {
		var srcTime = fs.statSync(src).mtime.getTime();
	} catch (e) {
		process.stderr.write("Warning: image '" + src + "' is not reachable (" + e.message + ")\n");
		return;
	}

	parts.push(format);
	var target = parts.join(".");
	
	if (fs.existsSync(target) && fs.statSync(target).mtime.getTime() > srcTime) {
		meta[0] = target;
		process.stderr.write("Ignoring image '" + src + "', it has a newer '" + format + "' version\n");
		return;
	}

	var callback = function(error, stdout, stderr) {
		if (error) {
			process.stderr.write("Error converting '" + src + "' to '" + target + "': " + error);
		} else {
			meta[0] = target;
			process.stderr.write("Converted '" + src + "' to '" + target + "'\n");
		}
		unlock();
	}

	lock();
	exec("dot -Gdpi=150 -T" + format + " -o '" + target + "' '" + src + "'", callback);
	exec("dot -Tsvg -o '" + target + ".svg' '" + src + "'");
}

var walkArray = function(arr) {
	arr.forEach(walk);
}

var walkObject = function(obj) {
	if (obj.t == "Image") {
		processImage(obj);
		return;
	}
	
	for (var p in obj) { walk(obj[p]); }
}

var walk = function(node) {
	if (node instanceof Array) { 
		walkArray(node); 
	} else if (typeof(node) == "object") { 
		walkObject(node); 
	}
}

lock();
walk(root);
unlock();
