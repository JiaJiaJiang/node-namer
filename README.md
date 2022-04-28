# node-namer

This is a renaming tool works with regexp.

## Install
```
npm i file-namer -g
```

## Usage

```plain
Usage: namer [options]

  Options:

    -R, --recursive              Match child directories recursively
    -f, --filter <regexp>        Filter for finding target files (default: same as --match)
    -r, --replace <replacement>  Replacement string (default: )
    -m, --match <regexp>         Regexp for matching strings to be replaced (default: /.*/)
    --keep-order                 Do not reorder the file list. By default the namer will reorder file names by their length.
    --flat                       Show flat file list instead of tree view.
    -y, --yes                    Do not ask for confirmation
    --no-folder                  Do not change folder's name.
    --no-file                    Do not change file's name.
    -h, --help                   output usage information


 This tool replaces matches to replacements on filtered files
    Regexps in the parameters can be with or without // surrounded(This can be used when you need regexp flags "i" or "g").
    You may need to add "\" before some signs in your command environment.
    You may need to surround the regexp with '' if special sign appears.
    The replacement will become the second parameter of 'string.replace' function in javascript. So several special signs can be used.

  Special javascript replacement patterns
    $$            Inserts a "$"
    $&            Inserts the matched substring
    $`            Inserts the portion of the string that precedes the matched substring
    $'            Inserts the portion of the string that follows the matched substring
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
        namer -m '.png$' -r '#COUNTER.png'
    

```
