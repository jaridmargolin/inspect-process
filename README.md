# inspect-process

[![Build Status](https://travis-ci.org/jaridmargolin/inspect-process.svg?branch=master)](https://travis-ci.org/jaridmargolin/inspect-process) [![Coverage Status](https://coveralls.io/repos/github/jaridmargolin/inspect-process/badge.svg?branch=master)](https://coveralls.io/github/jaridmargolin/inspect-process?branch=master) [![NPM inspect-process package](https://img.shields.io/npm/v/inspect-process.svg)](https://npmjs.org/package/inspect-process)

> A small wrapper built on the shoulders of giants to make working with the v8-inspector dead simple.

<img src="https://cldup.com/EKt_O0lK-F.gif" width="100%">

### Why?

Node added support for v8-inspector in [v6.3.0](https://github.com/nodejs/node/blob/master/doc/changelogs/CHANGELOG_V6.md#6.3.0) but launching the debugger for a given process is still a little clumsy. **inspect-process** solves the following problems:

* Opening and refreshing devtools - A new instance is launched each time a process is launched.
* Unable to debug executables - Looks up path to executables such as mocha, grunt, by looking in PATH prior to resolving as a file.
* 'Unable to open devtools socket: address already in use' - Finds an open port prior to starting the inspector. Begins searching for available ports starting at the node default inspector port, `9229`.
* Requiring `debug-brk` - Bypasses the user requirement of setting this flag by ensuring devtools is connected prior to advancing. Just set your debug break points, and `inspect-process` will be able to pick it up.

Behind the scenes **inspect-process** attempts to normalize your experience by:

* Hiding the noisy output broadcast by the default `--inspect` flag. You don't need to worry about attaching,detaching, and cleaning up. Just inspect.
* Automatically forcing color output; plays nicely with any module utilzing `supports-color`.

### How is this different from node-inspector?

**inspect-process** is only a small wrapper around the native `--inspect` functionaltiy provided by node. The key differences between utilizing `--inspect` and `node-inspector` can be found in [this comment by pavelfeldman](https://github.com/nodejs/node/pull/6792#issuecomment-219756916)


## Usage

Install this globally and you'll have access to the `inspect` command anywhere on your system.

```
npm install -g inspect-process
```

**Inspecting a file**

```
$ inspect index.js
```

**Inspecting an executable**

```
$ inspect grunt
```

**Passing arguments to process**

Just pass your arguments after the process.

```
inspect index.js --argument=val
```

**Passing arguments to node**

Arguments are passed to the process just as if you were utilizing the node CLI.

```
inspect --harmony index.js
```

### Options

**--debug-exception** Pause debuuger on exceptions. [boolean]

**--log-level**: The level to display logs at. [string] (choices: "silly", "verbose", "info")


## Tests

**Install Dependencies**

```
npm install
```

**Run**

```
npm test
```


## Known Issues

### Child Processes

Inspecting a child process is not currently possible (and most likely never will be). Unfortunately **inspect-process** can not force child processes to spawn with the necessary `--inspect` flag. 

This is clear when looking at all of the provided mocha examples. The actual `mocha` executable is a wrapper that spawns `_mocha` (done in order to allow passing flags to the node process). In order to use mocha with **inspect-process**, we have to bypass that first indirection and use the `_mocha` exectuable directly: `inspect _mocha`.

If you have control of the source code responsible for spawning the child process, it is technically possible to still utilize **inspect-process** by working with [programatic api](https://github.com/jaridmargolin/inspect-process/blob/master/lib/index.js), however this is not recommended for most use cases.


## License

The MIT License (MIT) Copyright (c) 2016 Jarid Margolin

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
