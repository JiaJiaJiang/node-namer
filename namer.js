#!/usr/bin/env node

var commander=require("commander");
const fs = require('fs');
const readline = require('readline');
const Path = require('path');
const ProgressBar = require('progress');

commander
.option('-R, --recursive', 'Match child directories recursively.')
.option('-f, --filter <regexp>', 'Filter for finding target files (default: value of --match).',parseRegExp)
.option('-r, --replace <replacement>', 'Replacement string.',String,'')
.option('-m, --match <regexp>', 'Regexp for matching strings to be replaced.',parseRegExp,"/.*/")
.option('-l, --list', 'Just list filtered files and directories.')
.option('--keep-order', 'Do not reorder the file list. By default the namer will reorder file names by their length.')
.option('--flat', 'Show flat file list instead of tree view.',false)
.option('-y, --yes', 'Do not ask for confirmation.')
.option('--no-folder', 'Do not change folder\'s name.')
.option('--no-file', 'Do not change file\'s name.')
.option('-e, --exclude [regexps...]', 'Define exclude filter regexp for relative path.');
commander.on('--help', function(){
console.log(
`

 This tool replaces matches(-m) to replacements(-r) on filtered(-f) files
    Regexps in the parameters can be with or without "//" surrounded(This can be used when you need regexp flags "i" or "g").
    You may need to add "\\" before some characters in your command environment.
    You may need to surround the regexp with \'\'(single quotes) if special character appears.
    The replacement will become the second parameter of \'string.replace\' function in javascript, so several special patterns can be used in it.

  Special javascript replacement patterns
    $$            Inserts a "$"
    $&            Inserts the matched substring
    $\`            Inserts the portion of the string that precedes the matched substring
    $\'            Inserts the portion of the string that follows the matched substring
    $n            Insert the nth submatch group, from 1 ot 100
  Extra replacement patterns
    #COUNTER      Inserts a counter number, which is the index of the file in the filter list (starts from 1)

  Path exclude
    Use "--exclude" option for defining path exclude filter regexp, can be multi-values devided by space.
	"-f" and "-m" are for file names only, this option filters the relative path of the target. 
	Relative path starts with "./" and the seperator is "/".

  Examples:

    #find files match /poi/ and replace /w.s/ with ''
        namer -f poi -m w.s

    #find files match /p(o+)i/ and replace /p(o+)i/ with '$1'(content matched in the brackets)
        namer -m 'p(o+)i' -r '$1'

    #find files match /aaaaaa/ig(ignore case and match the whole name) and replace /aaaaaa/ig with 'b'
        namer -m '/aaaaaa/ig' -r b

    #find some png files and re-number them
        namer -m '\.png$' -r '#COUNTER.png'

    #find files match /poi/ and replace /poi/ with 'poi2', exclude paths matche /.git/ or /node_modules/
        namer -m poi -r poi2 -e '.git' 'node_modules'
		
`
)
});

commander.parse();
const options = commander.opts();

//set match to find if not set
if(options.filter===undefined)options.filter=options.match;
console.log('Working dir:',`"${process.cwd()}"`);
console.log('filter:',options.filter,"  match:",options.match,"  replacement:",options.replace);

if(options.exclude){
	options.exclude=options.exclude.map(s=>parseRegExp(s));
	console.log('exclude filters: ',options.exclude);
}

const flatList=options.flat;
var replaceList=[];
var counter=0;
var workRoot='.';
//find files
findIn(workRoot);
console.log(`\n${counter} files found${!options.list?", "+replaceList.length+" names will be changed.":'.'}`);
if(replaceList.length===0 || options.list)process.exit(0);//no file to be renamed or in list mode
if(options.yes!==true){
	const rl = readline.createInterface({
	  input: process.stdin,
	  output: process.stdout
	});
	function ask(){
		rl.question('Confirm?  y/yes (control+c or "no" to exit)\n',(input)=> {
			if(input==='y'||input==='yes'){
				startReplace();
			}else if(!(input==='n'||input==='no')){
				console.log(`unrecogonized answer "${input}"`);
				ask();
				return;
			}
			rl.close();
		});
	}
	ask();
}else{startReplace();}

//funcitons
function findIn(dir){
	//match files
	try{
		var dirItems=fs.readdirSync(dir);
	}catch(e){
		console.error('Failed to scan '+dir,`[${e.message}]`);
		return;
	}
	//order the list
	if(options.keepOrder!==true){
		sort(dirItems);
	}
	let r;
	let tabs=(r=dir.match(new RegExp(`/`,'g')))?r.length:0;
	let dirLogged=false;
	dirItems.forEach(function(name){
		if(name==='.'||name==='..')return;
		let fpath=`${dir}/${name}`;
		if(options.exclude){
			for(let regexp of options.exclude){
				if(regexp.test(fpath))return;
			}
		}
		try{
			var stat=fs.statSync(fpath);
		}catch(e){
			console.error('Failed to get stat of '+fpath,`[${e.message}]`);
			return;
		}
		if((!options.folder&&stat.isDirectory()) || (!options.file&&stat.isFile())){}
		else if(name.match(options.filter)){
			counter++;
			if(counter===1){
				console.log("List:");
			}
			var newName=name.replace(options.match,options.replace).replace(/\#COUNTER/g,counter);
			if(name!==newName){
				let indent=flatList?'':('|   '.repeat(tabs));
				if(!dirLogged){
					console.log(indent+'[Dir: '+dir+']');
					dirLogged=true;
				}
				console.log(`${indent}|   <${name}>`);
				if(!options.list){
					console.log(`${indent}|    → ${newName}`);
					replaceList.push([Path.join(dir,name),Path.join(dir,newName)]);
				}
			}
		}
		if(stat.isDirectory()&&options.recursive){
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
	var bar = new ProgressBar('Renaming [:bar] :current/:total', { total: replaceList.length,width:999 });
	let updateBar=()=>bar.tick({current:changed+failed.length+skiped});
	//resort the list to rename child dirs first
	replaceList.sort((a,b)=>b[0].length-a[0].length).forEach(function(names){
		if(names[0]===names[1]){
			skiped++;
			updateBar();
			return;
		}
		try{
			fs.renameSync(names[0],names[1]);
			changed++;
		}catch(e){
			failed.push([names[0],names[1]]);
			console.error(e.message);
		}
		updateBar();
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
