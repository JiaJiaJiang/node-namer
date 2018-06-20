#!/usr/bin/env node

var commander=require("commander");
const fs = require('fs');
const readline = require('readline');
const Path = require('path');

commander
.option('-f, --find <rexexp>', 'Regexp for finding target string',parseRegExp,/.*/)
.option('-r, --replace <replacement>', 'Replacement string',String,'')
.option('-m, --match <rexexp>', 'Regexp for matching files (default: the same as find)',parseRegExp)
.option('-y, --yes', 'Do not ask for confirmation');
commander.on('--help', function(){
	console.log();
	console.log('    Regexps in the parameters can be with or without // warper(The wraper can be used when you need regexp flags "i" or "g").');
	console.log('    The replacement will become the second parameter of string.replace function in javascript. So several special signs can be used.\nSee https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter');
	console.log('    There is an extra special replacement pattern "#COUNTER" which is a counter that shows the index of the matched file(starts from 1).');
	console.log('  Examples:');
	console.log();
	console.log('    renamer -m w.s -f poi                 #remove string matches /poi/ from names that matches /w.s/');
	console.log('    renamer -f "p(o+)i" -r "$1"             #(special replacement patterns)cut "p" and "i" sticks to the "o"s for files that can be matched');
	console.log('    renamer -f /aaaaaa/i -r b             #(ignore case)replace /aaaaaa/i mode to "b" for files that can be matched');
	console.log('    renamer -f some*pics\\.png -r "#COUNTER.png" #change the names to numbers for some png files that can be matched');
	console.log();
});


commander.parse(process.argv);

//set match to find if not set
if(commander.match===undefined)commander.match=commander.find;
console.log('match:',commander.match,"  find:",commander.find,"  replacement:",commander.replace);

var replaceList=[];
var cwd=process.cwd();
var counter=0;
//match files
var dirList=fs.readdirSync(cwd);
console.log("Match list:");
dirList.forEach(function(name){
	if(name==='.'||name==='..')return;
	if(name.match(commander.match)){
		counter++;
		var newName=name.replace(commander.find,commander.replace).replace(/\#COUNTER/g,counter);
		console.log(name,"		>		"+newName);
		replaceList.push([name,newName]);
	}
});
console.log('\n');
if(replaceList.length===0){
	console.log("no files matched");
	return;
}else{
	console.log(replaceList.length+"matches found.");
}
if(commander.yes!==true){
	const rl = readline.createInterface({
	  input: process.stdin,
	  output: process.stdout
	});
	rl.question('Confirm?    (control+c to exit)\n',()=> {
		startReplace();
		rl.close();
	});
}else{startReplace();}


//funcitons

function parseRegExp(str){
	var reg,exp,flags;
	if(reg=str.match(/^\/(.+)\/([ig]*)$/)){
		exp=reg[1];
		flags=reg[2];
	}else{
		exp=str;
		flags='';
	}
	var r=new RegExp(exp,flags);
	return r;
}
function startReplace(){
	var success=0,failed=0;
	replaceList.forEach(function(names){
		try{
			fs.renameSync(Path.resolve(cwd,names[0]),Path.resolve(cwd,names[1]));
			success++;
		}catch(e){
			failed++;
			console.error(e.message);
		}
	});
	console.log("Finished. "+success+"succeeded,"+failed+"failed");
	// process.exit(0);
}