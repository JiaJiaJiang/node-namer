#!/usr/bin/env node

var commander=require("commander");
const fs = require('fs');
const readline = require('readline');
const Path = require('path');

commander
.option('-R, --recursive', 'Match child directories recursively')
.option('-f, --filter <regexp>', 'Filter for finding target files',parseRegExp,/.*/)
.option('-r, --replace <replacement>', 'Replacement string',String,'')
.option('-m, --match <regexp>', 'Regexp for matching strings to be replaced (default: the same as filter)',parseRegExp)
.option('--keep-order', 'Do not reorder the file list. By default the namer will reorder file names by their length.')
.option('-y, --yes', 'Do not ask for confirmation');
commander.on('--help', function(){
	[
		'',
		'    Regexps in the parameters can be with or without // warper(The wraper can be used when you need regexp flags "i" or "g").',
		'    You may need to add "\\" before some signs in your command environment.',
		'    The replacement will become the second parameter of string.replace function in javascript. So several special signs can be used.',
		'',
		'  Special javascript replacement patterns',
		'    $$            Inserts a "$"',
		'    $&            Inserts the matched substring',
		'    $`            Inserts the portion of the string that precedes the matched substring',
		'    $\'            Inserts the portion of the string that follows the matched substring',
		'    $n            Insert the nth submatch group, from 1 ot 100',
		'  Extra replacement patterns',
		'    #COUNTER      Inserts a counter number which is the index of the file in the file list (starts from 1)',
		'',
		'  Examples:',
		'',
		'    namer -m w.s -f poi                        #remove string not matches /w.s/ in which file name matches /poi/',
		'    namer -f "p(o+)i" -r "$1"                  #(special replacement patterns)cut "p" and "i" sticks to the "o"s for files that can be matched',
		'    namer -f /aaaaaa/i -r b                    #(ignore case)replace /aaaaaa/i mode to "b" for files that can be matched',
		'    namer -f some*pics\\.png -r "#COUNTER.png"  #change the names to numbers for some png files that can be matched',
		'',
	].forEach(function(l){console.log(l)});
});


commander.parse(process.argv);

//set match to find if not set
if(commander.match===undefined)commander.match=commander.find;
console.log('match:',commander.match,"  find:",commander.find,"  replacement:",commander.replace);

var replaceList=[];
var counter=0;
var workRoot='.';
//find files
console.log("File list:");
findIn(workRoot);
console.log('\n');
if(replaceList.length===0){
	console.log("No files matched");
	return;
}else{
	console.log(replaceList.length+"files found.");
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
function findIn(dir){
	//match files
	var dirList=fs.readdirSync(dir);
	//order the list
	if(commander.keepOrder!==true){
		sort(dirList);
	}
	let r;
	let tabs=(r=dir.match(new RegExp(`\\${path.sep}`,'g')))?r.length:0;
	dirList.forEach(function(name){
		if(name==='.'||name==='..')return;
		let fpath=Path.resolve(dir,name);
		let stat=fs.statSync(fpath);
		if(stat.isDirectory()&&commander.recursive){
			findIn(fpath);
		}
		if(name.match(commander.find)){
			counter++;
			var newName=name.replace(commander.match,commander.replace).replace(/\#COUNTER/g,counter);
			console.log(`${'\t'.repeat(tabs)}| ${name}`,`\n${'\t'.repeat(tabs+1)}\\ `+newName);
			replaceList.push([Path.resolve(dir,name),Path.resolve(dir,newName)]);
		}
	});
}
function sort(list){
	for(var on=0;on<list.length;on++){
		for(var i=0;i<list.length;i++){
			var r=compare(list[i],list[on]);
			if(r<=0)continue;
			list.splice(i,0,list.splice(on,1)[0]);
		}
	}
}
function compare(pre,nxt){
	if(pre.length<nxt.length)return -1;
	if(pre.length==nxt.length){
		if(pre<nxt)return -1;
		if(pre==nxt)return 0;
		return 1;
	}
	return 1;
}
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
	var changed=0,failed=[],skiped=[];
	//resort the list to rename child dirs first
	replaceList.sort((a,b)=>b.length-a.length).forEach(function(names){
		if(names[0]===names[1]){
			skiped++;
			return;
		}
		try{
			fs.renameSync(paths[0],paths[1]);
			changed++;
		}catch(e){
			failed.push([paths[0],paths[1]]);
			console.error(e.message);
		}
	});
	console.log("Finished.");
	if(changed)console.log(changed+" changed");
	if(skiped)console.log(skiped+" skiped");
	if(failed){
		console.log(failed.length+" failed");
		console.log('Failed list:');
		for(let p of failed){
			console.log(p[0],'\n\t> '+p[1]);
		}
	}
}
