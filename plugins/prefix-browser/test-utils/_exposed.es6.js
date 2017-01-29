// Once built as 'exposed.js' by '../scripts/build.js', this script
// exposes every relevant function from the plugin, including private
// ones, for testing.

export {blankFixers, finalizeFixers} from '../src/fixers.js'
export {prefixPlugin as createPrefixPlugin, initBrowser} from '../src/plugin.js'
export {
  init, finalize, cleanupDetectorUtils, hasCleanState,
  camelCase, deCamelCase,
  supportedProperty
} from '../src/detectors/core.js'
export {detectAtrules}    from '../src/detectors/atrules.js'
export {detectFunctions}  from '../src/detectors/functions.js'
export {
  detectKeywords, keywords,
  flex2009Props, flex2009Values,
  flex2012Props, flex2012Values
} from '../src/detectors/keywords.js'
export {detectPrefix}     from '../src/detectors/prefix.js'
export {detectSelectors}  from '../src/detectors/selectors.js'
