# Change log

## v1.0.0 (WIP)

### Breaking changes
- The exported object is a factory, users have to create instances
  manually as `var j2c = new J2c(options)`.
- Local scope is now per instance rather than per sheet.
  - `j2c.sheet()` and `j2c.inline()` return plain strings rather than
    `String` objects.
  - `j2c.names` holds the local -> global mappings for use in the (v)DOM.
- Removed the partial auto-prefix insertion from the core. There's now a
  fully fledged prefix plugin for the browser, and Autoprefixer can be
  used on the server by using the PostCSS adapter.
- Revamped the plugin system.
  - Removed `$postprocess` plugins that were taking and returning the full
    buffer.
  - Introduced `filter` system that can patch values on the fly on their
    way between the compiler and the buffer.
  - Introduced `sink` plugin that allow to subvert the sheet building
    process to implement systems like Radium or Descartes.
  - Introduced `at` filters that can handle at-rules beside the ones that
    j2c supports out of the box.
- Revamped the poorly named `@extend` into `@adopt`, based on @tivac's
  Modular CSS `composes`. The semantics are too distant from either `@extend`
  or `composes` to use their name witout introducing potential confusion,
  hence the new name.

  So: `j2c.sheet({'@adopt .foo': ['.bar']})` where foo is a local class that
  adopts the behavior of the global `.bar`.

### Additions
- Added a namespace mechanism to scope the styles per component wihtout having to
  use BEM-like classes or having to create a distinct `j2c` instance for each
  component.
- Prefixed at-rules are treated like their unprefixed counterparts.
- Added `@local` as a counterpart to `@global`.
- Consecutive, identical selectors are deduped in the output. Using mixins
  won't cause duplicate selectors anymore.

### Fixes
- `& > &` with a selector list as parent will perform their cartesian product
  like SASS and LESS do.
- Robust parsing of selectors. Comas, ampersands and class-like parts
  in strings are now ignored by the compiler.

  ```JS
  j2c.sheet({'p':{'[foo="&,.bar"]': {color: 'red'}}})
  ```

  produces

  ```CSS
  p[foo="&,.bar"] {color:red}
  ```

  Whereas previous versions would produce

  ```CSS
  [foo="p,p.bar_j2c_ubv4pc_knzcqw_ngjme7_1usit1c_9"] {color: red;}
  ```

  Likewise, `':not(p, a, ul, li)'` (a CSS4 addition) will not be split.

### Size

2.4Kb mingzipped (+ ~700 bytes).

## v0.11.1 (2016-03-8) and v0.11.2 (2016-03-17)

- Patch bump to fix what `npm` installs by default (I erronously published `
  v1.0.0-x` on without `--tag next`, twice) Note to self, don't publish in
  the wee hours.

## v0.11.0

- Refactor the innards so that the source order is completely respected in
  the output, including conditional at-rules.
- Speed ++
- Autoprefix all animation-* and transition.
- Some error messages are now inserted in the result as -error-prefixed
  at-rules and :pseudo-classes.

## v0.10.0

- At long last allow element selectors without a prepended space at the top
  level
- Autoprefix animation and animation-name with -webkit- too like we do for
  `@keyframes`.
- Tweaks and cleanup

## v0.9.0

- Added @extend
- Internal change: switched to rollup for build.
- Dropped the inline-only version for now.

## v0.8.3

- Cosmetic release that fixed typos in the docs

## v0.8.2

- cleanup
- improve test suite
- update docs to reflect move to the `j2css` Github organization.

## v0.8.0

- docs cleanup (version bump for npmjs.com dislpay).

## v0.8.0

- classes and animations/@keyframes names are now localized by default in
  `j2c.sheet()`.
- introduced `@global{}` and `:global()` to reach global names
- dropped `j2c.scoped()` which is obsoleted by the above.
- dropped bulk auto-prefixing.
- better at-rules handling.
- support for autoDeCamelization of property-names.
- New signature for `j2c.sheet([namespace1, namespace2, ] source)` where
  `namespace` is an object with plain -> localized names for classes and
  animations.
- allow to create custom j2c instances that can be extended with plugins
  *[needs docs]*.
- Hardened the test suite.
- Bug fix: the source order is now respected in the output, with the caveat
  that, for nested selector, the children appear in source before the parent.

## v0.7.3

- Identical to `v0.7.2`. Somehow a bad commit ended up on NPM for that
  version.

## v0.7.2

- Fix regression: Vendor names were not in the corrrect order.

## pre-v0.7.2

Uncharted territory.