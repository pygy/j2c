# j2c-plugin-prefix-browser

This j2c plugin does client side vendor prefix insertion (and some polyfilling) for:

- properties and values (including flexbox).
- selectors,
- at-rules and at-rules parameters

See below for a detailed feature set.

Unlike Autoprefixer and the inline-style-prefixer, it relies on feature detection rather than browser sniffing. It weights ~3KB minified and gzipped.

You test it [live in your browser](https://cdn.rawgit.com/j2css/j2c/33e6ff611fa43b082f426512bde2e8c6a9c13193/plugins/prefix-browser/tests/index.html).

The plugin is well tested (385 assertions, many of which are `deepEquals` on nested objects) and has 100% branch coverage (which doesn't mean it is bug free, off course).


----

- [Usage](#usage)
- [Features](#features)
  - [Properties](#properties)
  - [Values](#values)
    - [Keywords](#keywords)
    - [Functions](#functions)
    - [Values that are property names](#values-that-are-property-names)
  - [Flexbox](#flexbox)
    - [Flexbox 2009 (`-moz-box`** and **`-webkit-box`)](#flexbox-2009--moz-box-and--webkit-box)
    - [Flexbox 2012 (`-ms-flexbox`)](#flexbox-2012--ms-flexbox)
    - [Final spec, prefixed (`-webkit-flex`)](#final-spec-prefixed--webkit-flex)
  - [Selectors](#selectors)
  - [At rules](#at-rules)
    - [At rules parameters (resolution and @supports)](#at-rules-parameters-resolution-and-supports)
- [What about the server side?](#what-about-the-server-side)
- [And what about speed?](#and-what-about-speed)
- [Thanks](#thanks)
- [License: MIT](license-mit)

----

## Usage

```BASH
$ npm install --save j2c-plugin-prefix-browser
#or
$ yarn add j2c-plugin-prefix-browser
```

```JS
import {prefixPlugin} from "j2c-plugin-prefix-browser"
import {J2c} from "j2c"

// alternatively

const prefixPlugin = require("j2c-plugin-prefix-browser").prefixPlugin
const J2c = require("j2c")

// anyways...

const j2c = new J2c(prefixPlugin())


j2c.sheet({
  "@keyframes foo": {
    from: {size: "100px"},
    to: {size: "200px"}
  }
})
```

```CSS
/* Assuming that it ran in an old Safari version: */

@-webkit-keyframes foo_j2c-xxx {
  from {
    size: 100px;
  }
  to {
    size: 200px;
  }
} 
```

## Features

Here's what supported, please file an issue if you see something missing.

### Properties

Properties that need a prefix will get one. Properties supported both with and without won't.

### Values

The following values can get a prefix:

#### Keywords

##### All properties:

=> **`initial`**

##### *`cursor:`*
    
=> **`grab`**, **`grabbing`**, **`zoom-in`**, **`zoom-out`**

##### *`display:`*

=> **`grid`**, **`inline-grid`** and the flexbox zoo (see below)

##### *`position:`*

=> **`sticky`**

##### *`width:`*, *`column-width:`, `height:`, `max-height:`, `max-width:`, `min-height:`, `min-width:`*

=> **`contain-floats`**, **`fill-available`**, **`fit-content`**, **`max-content`** and **`min-content`**

#### Functions

**`calc()`**, **`element()`**, **`cross-fade()`** and gradients are prefixed, even if they are nested in other functions or part of a list of values.

Prefixed gradients also have their angle changed from trigonometric to clockwise coordinates.

#### Values that are property names

**`transiton:`**, **`transition-property:`** and **`will-change:`** take properties as arguments. The latter are prefixed where needed.

### Flexbox

The plugin translates the final flexbox spec to its older versions as much as possible. Squigly arrows indicate an approximate mapping.

#### Flexbox 2009 (`-moz-box` and `-webkit-box`)

##### Properties

- `align-content` => `?` no mapping AFAIK please chime in if you know any)
- `align-self` => `?`
- **`align-items`** => **`-x-box-align`**
- **`flex`** => **`-x-box-flex`**
- `flex-basis` => `?`
- **`flex-direction`** => **`-x-box-direction`** + **`-x-box-orient`**
- **`flex-flow`** => **`-x-box-direction`** + **`-x-box-orient`** and/or **`-x-box-lines`**
- `flex-grow` => `?`
- `flex-shrink` => `?`
- **`flex-wrap`** => **`-x-box-lines`**
- **`justify-content`** => **`-x-box-pack`**
- **`order`** => **`-x-box-ordinal-group`**

##### Values

- **`flex`** => **`-x-box`**
- **`inline-flex`** => **`-x-inline-box`**
- **`column`** => **`block-axis`** + **`normal`** (respectively for `-x-box-orient` and `box-direction`)
- **`column-reverse`** => **`block-axis`** + **`reverse`**
- **`row`** => **`inline-axis`** + **`normal`**
- **`row-reverse`** => **`inline-axis`** + **`reverse`**
- **`flex-end`** => **`end`**
- **`flex-start`** => **`start`**
- **`nowrap`** => **`single`**
- **`space-around`** ~> **`justify`**
- **`space-between`** => **`justify`**
- **`wrap`** => **`multiple`**
- **`wrap-reverse`** ~> **`multiple`**

#### Flexbox 2012 (`-ms-flexbox`)

##### Properties

- **`align-content`** => **`-ms-flex-line-pack`**
- **`align-items`** => **`-ms-flex-align`**
- **`align-self`** => **`-ms-flex-item-align`**
- `flex` => `-ms-flex`
- **`flex-basis`** => **`-ms-preferred-size`**
- **`flex-direction`** => **`-ms-flex-direction`**
- **`flex-flow`** => **`-ms-flex-flow`**
- **`flex-grow`** => **`-ms-flex-positive`**
- **`flex-shrink`** => **`-ms-flex-negative`**
- `flex-wrap` => `-ms-flex-wrap`
- **`justify-content`** => **`-ms-flex-pack`**
- **`order`** => **`-ms-flex-order`**

##### Values

- **`flex`** => **`-ms-flexbox`**
- **`inline-flex`** => **`-ms-inline-flexbox`**
- `column` => `column`
- `column-reverse` => `column-reverse`
- `row` => `row`
- `row-reverse` => `row-reverse`
- **`flex-end`** => **`end`**
- **`flex-start`** => **`start`**
- **`space-around`** => **`distribute`**
- **`space-between`** => **`justify`**
- `wrap` => `wrap`
- `wrap-reverse` => `wrap-reverse`

#### Final spec, prefixed (`-webkit-flex`)

No special treatment is necessary, prefixes are applied normally where needed.

### Selectors

- **`:any-link`** => **`:-x-any-link`**
- **`:read-only`** => **`:-x-read-only`**
- **`:read-write`** => **`:-x-read-write`**
- **`::selection`** => **`::-x-selection`**
- **`:fullscreen`** => **`:-x-fullscreen`** or **`:-x-fullscreen`**
- **`::backdrop`** => **`::-x-backdrop`**
- **`::placeholder`** => **`::-x-placeholder`**, **`:-x-placeholder`:, `::-x-input-placeholder`** or **`:-x-input-placeholder`**

The `:-webkit-scrollbar` pseudo-element/pseudo-class family not implemented since it is webkit-only and not on a standard track AFAIK.

### At rules

**`@keyframes`**, **`@document`** and **`@viewport`** get a prefix where needed.

#### At rules parameters (resolution and @supports)

```CSS
@media (min-resolution: 2dppx){}
```

(resp. `max-resolution` and `resolution`) can be converted to one of the following, when appropriate:

```CSS
@media (-webkit-min-device-pixel-ratio:2){}

@media (min--moz-device-pixel-ratio:2){}

@media (-o-device-pixel-ratio 20/10){}

@media (min-resolution: 192dpi){} // Mostly IE
```

The parameters of **`@supports`** have also their properties and values prefixed automatically.

## What about the server side?

The plugin supports a way to bypass the detection code and provide `fixers` objects manually, but these would have to be constructed, either from the caniuse.com data set and cross-checking it by using our detector code with a service like SauceLabs, BrowserStack or Browserling.

That scheme would only work when the server knows the user agent. The plugin doesn't support inserting more than one prefix, or keeping the originals as Autoprefixer and inline-style-prefixer do. Thankfully, for that case (and until a proper DB is constructed), Autoprefixer can be used as a fallback.

## And what about speed?

The plugin is designed to be as fast as possible. Most of the feature detection is performed upfront to enable the fastest operation possible while applying prefixes. Allocations and branches are kept to a bare minimum after initialization (the prefixes are applied once and then cached). No objects beside strings are created while prefixing (with one exception when `flex-flow` has to be translated to the 2009 equivalent, the value is `.split(' ')` into an array.). Some tweaks are still possible, benchmarks will be needed.

## Thanks

Many thanks to [Lea Verou](https://github.com/LeaVerou/) for [PrefixFree](http://leaverou.github.io/prefixfree/) from which most of the feature detection code originates, [Robin Frischmann](https://github.com/rofrischmann) for the [inline-style-prefixer](https://github.com/rofrischmann/inline-style-prefixer/) whose plugin folder was an inspiration, [Andrey Sitnik](https://github.com/ai) for the [Autoprefixer](https://github.com/postcss/autoprefixer) which is also a resource I've used while building this, and [Ben Briggs]() who's always been helpful in the PostCSS-related chats.

Thanks as well to all the folks that hang out in the gitter channel for keeping my motivation up.

## License: MIT