import {blankFixers, browserDetector, finalizeFixers} from './fixers.js'

var commonFixers

export function initBrowser() { // exported for the test suite.
  commonFixers = blankFixers()
  if (typeof getComputedStyle === 'function') browserDetector(commonFixers)
  finalizeFixers(commonFixers)
}
initBrowser()

export function prefixPlugin(){
  var fixers = commonFixers
  var cache = []
  return {
    set: {
      setPrefixDb: function(f) {
        if (cache.indexOf(f) === -1) {
          finalizeFixers(f)
          cache.push(f)
        }
        fixers = f
        return prefixPlugin
      }
    },
    filter: function(next) {
      return {
        atrule: function(rule, kind, params, hasBlock) {
          next.atrule(
            fixers.hasAtrules && fixers.atrules[rule] || rule,
            kind,
            (
              rule === '@media'    ? fixers.fixAtMediaParams(params) :
              rule === '@supports' ? fixers.fixAtSupportsParams(params) :
              params
            ),
            hasBlock
          )
        },
        decl: function decl(property, value) {
          if (typeof property !== 'string' || property.charAt(0) === '-') return next.decl(property, value)

          if (!(typeof value === 'string' || typeof value === 'number')){
            return next.decl(fixers.properties[property] || fixers.fixProperty(property), value)
          }

          value = value + ''
          if (fixers.flexbox2009 && (property === 'flex-flow' || property === 'flex-direction')) {
            if (property === 'flex-flow') {
              value.split(' ').forEach(function(v){
                // recurse! The lack of `next.` is intentional.
                if (v.indexOf('wrap') > -1) decl('flex-wrap', v)
                else if(v !== '') decl('flex-direction', v)
              })
            } else { // (property === 'flex-direction')
              next.decl(fixers.properties['box-orient'], value.indexOf('column') > -1 ? 'block-axis' : 'inline-axis')
              next.decl(fixers.properties['box-direction'], value.indexOf('-reverse') > -1 ? 'reverse' : 'normal')
            }
          } else {
            next.decl(
              fixers.properties[property] || fixers.fixProperty(property),
              fixers.fixValue(value, property)
            )
          }
        },
        rule: function(selector) {
          next.rule(
            fixers.hasSelectors ? fixers.fixSelector(selector) : selector
          )
        }
      }
    }
  }
}
