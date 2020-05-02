#!/usr/bin/env node

/*
 * Adds non-breaking spaces after one-letter prepositions (Czech typography feature). 
 * We are looking for a particular pattern: Str (one-letter), Space, Str.
 */

var NBSP = String.fromCharCode(160);
var RE = /^[ksvzouai]$/i;

var tryErasing = function(arr, index) {
	if (index+2 >= arr.length) { return; } /* not good */

	var next = arr[index+1];
	var nnext = arr[index+2];
	if (next.t != "Space" || nnext.t != "Str") { return; } /* not good */

	/* voila! */
	arr[index].c += NBSP + nnext.c;
	arr.splice(index+1, 2);

	if (nnext.c.match(RE)) { tryErasing(arr, index); } /* try continuing, we added a single letter again */
}

var walkArray = function(arr) {
	for (var i=0;i<arr.length;i++) {
		var item = arr[i];
		if (item.t == "Str" && item.c.match(RE)) { /* suitable letter... */
			tryErasing(arr, i);
		} else {
			walk(item);
		}
	}
}

var walkObject = function(obj) {
	for (var p in obj) { walk(obj[p]); }
}

var walk = function(node) {
	if (node instanceof Array) { 
		walkArray(node); 
	} else if (typeof(node) == "object") { 
		walkObject(node); 
	}
}

var input = require("fs").readFileSync("/dev/stdin").toString();

var root = JSON.parse(input);
walk(root);

var output = JSON.stringify(root);
process.stdout.write(output);
