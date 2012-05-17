// =============================================================================
// Log
// -----------------------------------------------------------------------------
// what: a wrapper for console.log()
// how:  log('inside coolFunc', this, arguments);
// more: paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/

window.log = function f(){log.history = log.history || []; log.history.push(arguments); if(this.console) { var args = arguments, newarr; try { args.callee = f.caller } catch(e) {}; newarr = [].slice.call(args); if (typeof console.log === 'object') log.apply.call(console.log, console, newarr); else console.log.apply(console, newarr);}};

// =============================================================================
// Chaps
// -----------------------------------------------------------------------------
// what: make it safe to use console.log
// how:  use console.log() to your heart's content, rest easy.
// more: https://github.com/h5bp/html5-boilerplate/blob/master/js/plugins.js

(function(a){function b(){}for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){a[d]=a[d]||b;}})
(function(){try{console.log();return window.console;}catch(a){return (window.console={});}}());

