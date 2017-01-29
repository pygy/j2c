// Derived from Lea Verou's PrefixFree

// TODO: http://caniuse.com/#feat=css-media-resolution

import {supportedMedia, supportedRule} from './core.js'

export function detectAtrules(fixers) {
  if (fixers.prefix === '') return
  var atrules = {
    'keyframes': 'name',
    'viewport': null,
    'document': 'regexp(".")'
  }

  // build a map of {'@ruleX': '@-prefix-ruleX'}
  for(var atrule in atrules) {
    var test = atrule + ' ' + (atrules[atrule] || '')
    if (!supportedRule('@' + test) && supportedRule('@' + fixers.prefix + test)) {

      fixers.hasAtrules = true
      fixers.atrules['@' + atrule] = '@' + fixers.prefix + atrule
    }
  }

  // Standard
  fixers.hasDppx = supportedMedia('resolution', '1dppx')
  // Webkit
  fixers.hasPixelRatio = supportedMedia(fixers.prefix + 'device-pixel-ratio', '1')
  // Opera
  fixers.hasPixelRatioFraction = supportedMedia(fixers.prefix + 'device-pixel-ratio', '1/1')

  if (fixers.hasPixelRatio || fixers.hasPixelRatioFraction) {
    fixers.properties['resolution'] = fixers.prefix + 'device-pixel-ratio'
    fixers.properties['min-resolution'] = fixers.prefix + 'min-device-pixel-ratio'
    fixers.properties['max-resolution'] = fixers.prefix + 'max-device-pixel-ratio'
    if (supportedMedia('min-' + fixers.prefix + 'device-pixel-ratio', '1')) {
      // Mozilla/Firefox tunred a vendor prefix into a vendor infix
      fixers.properties['min-resolution'] = 'min-' + fixers.prefix + 'device-pixel-ratio'
      fixers.properties['max-resolution'] = 'max-' + fixers.prefix + 'device-pixel-ratio'
    }
  }
}