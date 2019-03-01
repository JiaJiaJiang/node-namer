# node-namer

This is a renaming tool works with regexp.

## Install
```
npm i file-namer -g
```

## Usage

```	
Usage: namer [options]

  Options:

    -R, --recursive              Match child directories recursively
    -f, --filter <regexp>        Filter for finding target files (default: same as --match)
    -r, --replace <replacement>  Replacement string (default: "")
   -m, --match <regexp>         Regexp for matching strings to be replaced (default: "/.*/")
    --keep-order                 Do not reorder the file list. By default the namer will reorder file names by their length.
    -y, --yes                    Do not ask for confirmation
    -h, --help                   output usage information
```

This tool replaces matches to replacements on filtered files.

Regexps in the parameters can be with or without // warper(The wraper can be used when you need regexp flags "i" or "g").

You may need to add "\\" before some signs in your command environment.

The replacement will become the second parameter of string.replace function in javascript. So several special signs can be used.

### Patterns
```
Special javascript replacement patterns
    $$            Inserts a "$"
    $&            Inserts the matched substring
    $`            Inserts the portion of the string that precedes the matched substring
    $'            Inserts the portion of the string that follows the matched substring
    $n            Inserts the nth submatch group, from 1 ot 100
Extra replacement patterns
    #COUNTER      Inserts a counter number which is the index of the file in the match list (starts from 1)
```

### Examples:

```shell
    namer -m w.s -f poi                        #remove string not matches /w.s/ in which file name matches /poi/
    namer -f "p(o+)i" -r "$1"                  #(special replacement patterns)cut "p" and "i" sticks to the "o"s for files that can be matched
    namer -f /aaaaaa/i -r b                    #(ignore case)replace /aaaaaa/i mode to "b" for files that can be matched
    namer -f some.*pics\\.png -r "#COUNTER.png"#change the names to numbers for some png files that can be matched
```
