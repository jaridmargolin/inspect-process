# inspect-process [![Build Status](https://travis-ci.org/jaridmargolin/inspect-process.svg?branch=master)](https://travis-ci.org/jaridmargolin/inspect-process) [![Coverage Status](https://coveralls.io/repos/github/jaridmargolin/inspect-process/badge.svg?branch=master)](https://coveralls.io/github/jaridmargolin/inspect-process?branch=master)

Dead simple debugging for node.js using chrome-devtools.

<img src="https://cldup.com/EKt_O0lK-F.gif" width="100%">

Node added support for v8-inspector in [v6.3.0](https://github.com/nodejs/node/blob/master/doc/changelogs/CHANGELOG_V6.md#6.3.0) but launching the debugger for a given process is still a little clumsy. **inspect-process** is a small wrapper built on the shoulders of giants to make working with the v8-inspector dead simple.

`npm install -g inspect-process`


## Usage

**Inspecting a file**

```
$ inspect [PATH_TO_FILE]
```

**Inspecting an executable**

*smart enough to debug executables (ex: `inspect mocha`)*

```
$ inspect [EXECUTABLE]
```

## Tests

**Install Dependencies**

```
npm install
```

**Run**

```
npm test
```

## License

The MIT License (MIT) Copyright (c) 2016 Jarid Margolin

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.