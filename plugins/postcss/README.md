# j2c-plugin-postcss

Use [PostCSS](https://github.com/postcss/postcss) synchronous filters with [j2c](http://j2c.py.gy) v1.x. For server-side usage.

Don't use this on the client side unless you want to bundle PostCSS itself with your app.

## Usage:

```JS
var j2c = require('j2c')
var j2cPostcss = require('j2c-plugin-postcss')
var autoprefixer = j2cPostcss(require('autoprefixer') /*, otherPostCSSPluginsHere */)

var j2c = new J2c(autoprefixer)
var css = j2c.sheet({
    /* Your nice sheet here */
})
```

## Installation:

```
$ npm install -s j2c-plugin-postcss
```

## License: MIT

Copyright © 2016 Pierre-Yves Gérardy

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
“Software”), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
