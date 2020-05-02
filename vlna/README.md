# vlna

This [pandoc](http://johnmacfarlane.net/pandoc/) filter inserts non-breaking spaces after one-letter prepositions, according to czech typographic rules.

## Usage

```bash
$ echo "Petr a Pavel. A i Jarda." | pandoc -t latex --filter ./vlna.js

Petr a~Pavel. A~i~Jarda.
```

You will need to have a working NodeJS setup.