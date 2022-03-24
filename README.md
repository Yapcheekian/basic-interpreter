## WHAT
Build an interpreter from scratch

Examples
```bash
npm install -g syntax-cli

syntax-cli --grammar parser/eva-grammar.bnf --mode LALR1 --parse '42' --tokenize

syntax-cli --grammar parser/eva-grammar.bnf --mode LALR1 --output parser/evalParser.js
```
