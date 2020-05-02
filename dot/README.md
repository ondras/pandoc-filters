# dot

This [pandoc](http://johnmacfarlane.net/pandoc/) filter scans for all image references that have the `dot` extension. For every image, it calls the `dot` program to convert it to a PNG version, adjusting the referenced extension accordingly.

## Usage

```bash
$ echo '![](test.dot)' | pandoc -t json --filter ./dot.js

```

You will need to have a working NodeJS setup, as well as the `graphviz` suite installed.
