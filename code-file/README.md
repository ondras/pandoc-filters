# pandoc-code-file

This [pandoc](http://johnmacfarlane.net/pandoc/) filter inserts source code files into code block sections.

## Features
  - Normal include (`file=index.html`)
  - Uses file extension to create a corresponding syntax class
  - Include only a subset of lines (`file=index.html#123` or `file=index.html#1-5`)
  - Convert tabs to a given number of spaces (define a `tab-stop` numeric metadata value)

## Usage

You will need to have a working NodeJS setup.

### Input (file.md)

~~~
``` {file=index.html}
```
~~~

### Execute
```bash
$ echo < file.md | pandoc -t markdown --filter ./code-file.js
```

### Output
~~~
``` {.html}
This is <html>.
```
~~~
