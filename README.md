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
  -R, --recursive              Match child directories recursively.
  -f, --filter <regexp>        Filter for finding target files (default: value of --match).
  -r, --replace <replacement>  Replacement string. (default: "")
  -m, --match <regexp>         Regexp for matching strings to be replaced. (default: "/.*/")
  -l, --list                   Just list filtered files and directories.
  --keep-order                 Do not reorder the file list.
                               By default the namer will reorder file names by their length.
  --flat                       Show flat file list instead of tree view. (default: false)
  -y, --yes                    Do not ask for confirmation.
  --no-folder                  Do not change folder's name.
  --no-file                    Do not change file's name.
  -e, --exclude [regexps...]   Define exclude filter regexp for relative path.
  -h, --help                   display help for command


 This tool replaces matches(-m) to replacements(-r) on filtered(-f) files
    Regexps in the parameters can be with or without "//" surrounded, this can be used when you need regexp flags ("i" or "g" or both of them).
    You may need to add "\" before some characters in your command environment.
    You may need to surround the regexp with ''(single quotes) if special character appears.
    The replacement will become the second parameter of 'string.replace' function in javascript, so several special patterns can be used in it.

  Special javascript replacement patterns
    $$            Inserts a "$"
    $&            Inserts the matched substring
    $`            Inserts the portion of the string that precedes the matched substring
    $'            Inserts the portion of the string that follows the matched substring
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
        namer -m '.png$' -r '#COUNTER.png'

    #find files match /poi/ and replace /poi/ with 'poi2', exclude paths matche /.git/ or /node_modules/
        namer -m poi -r poi2 -e '.git' 'node_modules'
```
