# node-renamer

This is a renaming tool works with regexp.

## Install
```
npm i @luojia/filerenamer -g
```

## Usage

```	
Usage: renamer [options]

  Options:

    -f, --find <rexexp>          Regexp for finding target string (default: /.*/)
    -r, --replace <replacement>  Replacement string (default: )
    -m, --match <rexexp>         Regexp for matching files (default: the same as find)
    -y, --yes                    Do not ask for confirmation
    -h, --help                   output usage information
```

Regexps in the parameters can be with or without // warper(The wraper can be used when you need regexp flags "i" or "g").


The replacement will become the second parameter of string.replace function in javascript. So several special signs can be used.
See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter
    
There is an extra special replacement pattern "#COUNTER" which is a counter that shows the index of the matched file(starts from 1).

### Examples:

```shell
    renamer -m w.s -f poi                 #remove string matches /poi/ from names that matches /w.s/
    renamer -f p(o+)i -r "$1"             #(special replacement patterns)cut "p" and "i" sticks to the "o"s for files that can be matched
    renamer -f /aaaaaa/i -r b             #(ignore case)replace /aaaaaa/i mode to "b" for files that can be matched
    renamer -f some*pics\.png -r "#COUNTER.png" #change the names to numbers for some png files that can be matched
```