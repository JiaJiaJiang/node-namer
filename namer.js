#!/usr/bin/env node

var commander=require("commander");
const fs = require('fs');
const readline = require('readline');
const Path = require('path');

commander
.option('-R, --recursive', 'Match child directories recursively')
.option('-f, --filter <regexp>', 'Filter for finding target files (default: same as --match)',parseRegExp)
.option('-r, --replace <replacement>', 'Replacement string',String,'')
.option('-m, --match <regexp>', 'Regexp for matching strings to be replaced',parseRegExp,"/.*/")
.option('--keep-order', 'Do not reorder the file list. By default the namer will reorder file names by their length.')
.option('-y, --yes', 'Do not ask for confirmation')
.option('--no-folder', 'Do not change folder\'s name.',false)
.option('--no-file', 'Do not change file\'s name.',false);
commander.on('--help', function(){
console.log(
`

 This tool replaces matches to replacements on filtered files
    Regexps in the parameters can be with or without // surrounded(This can be used when you need regexp flags "i" or "g").
    You may need to add "\\" before some signs in your command environment.
    You may need to surround the regexp with \'\' if special sign appears.
    The replacement will become the second parameter of \'string.replace\' function in javascript. So several special signs can be used.

  Special javascript replacement patterns
    $$            Inserts a "$"
    $&            Inserts the matched substring
    $\`            Inserts the portion of the string that precedes the matched substring
    $\'            Inserts the portion of the string that follows the matched substring
    $n            Insert the nth submatch group, from 1 ot 100
  Extra replacement patterns
    #COUNTER      Inserts a counter number which is the index of the file in the filter list (starts from 1)

  Examples:

    #find files match /poi/ and replace /w.s/ with ''
        namer -f poi -m w.s

    #find files match /p(o+)i/ and replace /p(o+)i/ with '$1'(content matched in the brackets)
        namer -m 'p(o+)i' -r '$1'

    #find files match /aaaaaa/ig(ignore case and match the whole name) and replace /aaaaaa/ig with 'b'
        namer -m '/aaaaaa/ig' -r b

    #find some png files and re-number them
        namer -m '\.png$' -r '#COUNTER.png'
		
`
)
});


commander.parse(process.argv);
//set match to find if not set
if(commander.filter===undefined)commander.filter=commander.match;
console.log('filter:',commander.filter,"  match:",commander.match,"  replacement:",commander.replace);

var replaceList=[];
var counter=0;
var workRoot='.';
//find files
console.log("Change list:");
findIn(workRoot);
console.log('\n');

console.log(counter+" files found, "+replaceList.length+" names will be changed.");
if(replaceList.length===0)return;
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
	try{
		var dirList=fs.readdirSync(dir);
	}catch(e){
		console.error('Failed to scan '+dir,`[${e.message}]`);
		return;
	}
	//order the list
	if(commander.keepOrder!==true){
		sort(dirList);
	}
	let r;
	let tabs=(r=dir.match(new RegExp(`\\${Path.sep}`,'g')))?r.length:0;
	let dirLogged=false;
	dirList.forEach(function(name){
		if(name==='.'||name==='..')return;
		let fpath=`${dir}/${name}`;
		try{
			var stat=fs.statSync(fpath);
		}catch(e){
			console.error('Failed to get stat of '+fpath,`[${e.message}]`);
			return;
		}
		if((!commander.folder&&stat.isDirectory()) || (!commander.file&&stat.isFile())){}
		else if(name.match(commander.filter)){
			counter++;
			var newName=name.replace(commander.match,commander.replace).replace(/\#COUNTER/g,counter);
			if(name!==newName){
				if(!dirLogged){
					console.log('|   '.repeat(tabs)+'[Dir: '+dir+']');
					dirLogged=true;
				}
				console.log(`${'|   '.repeat(tabs+1)}<${name}>`,`\n${'|   '.repeat(tabs+1)} → `+newName);
				replaceList.push([Path.join(dir,name),Path.join(dir,newName)]);
			}
		}
		if(stat.isDirectory()&&commander.recursive){
			findIn(fpath);
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
	var changed=0,failed=[],skiped=0;
	//resort the list to rename child dirs first
	replaceList.sort((a,b)=>b[0].length-a[0].length).forEach(function(names){
		if(names[0]===names[1]){
			skiped++;
			return;
		}
		try{
			fs.renameSync(names[0],names[1]);
			changed++;
		}catch(e){
			failed.push([names[0],names[1]]);
			console.error(e.message);
		}
	});
	console.log("Finished.");
	if(changed)console.log(changed+" changed");
	if(skiped)console.log(skiped+" skiped");
	if(failed.length){
		console.log(failed.length+" failed");
		console.log('Failed list:');
		for(let p of failed){
			console.log(p[0],'\n x-> '+p[1]);
		}
	}
}
