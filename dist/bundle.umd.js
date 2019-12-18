!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t(e.TVNavigation={})}(this,function(e){"use strict";var t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},n={selector:"",straightOnly:!1,straightOverlapThreshold:.35,rememberSource:!1,disabled:!1,defaultElement:"",enterTo:"",leaveFor:null,restrict:"self-first",tabIndexIgnoreList:[],navigableFilter:null},r={4:"left",21:"left",37:"left",214:"left",205:"left",218:"left",5:"right",22:"right",39:"right",213:"right",206:"right",217:"right",29460:"up",19:"up",38:"up",211:"up",203:"up",215:"up",29461:"down",20:"down",40:"down",212:"down",204:"down",216:"down",29443:"enter",13:"enter",67:"enter",32:"enter",23:"enter",195:"enter"},o={left:"right",up:"down",right:"left",down:"up"},i="sn:",u="section-",a=0,s=!1,c=!1,f={},l=0,d="",v="",h=!1,p=Element.prototype.matches||Element.prototype.matchesSelector||Element.prototype.mozMatchesSelector||Element.prototype.webkitMatchesSelector||Element.prototype.msMatchesSelector||Element.prototype.oMatchesSelector||function(e){var t=(this.parentNode||this.document).querySelectorAll(e);return[].slice.call(t).indexOf(this)>=0};function g(e){var t=e.getBoundingClientRect(),n={left:t.left,top:t.top,right:t.right,bottom:t.bottom,width:t.width,height:t.height};return n.element=e,n.center={x:n.left+Math.floor(n.width/2),y:n.top+Math.floor(n.height/2)},n.center.left=n.center.right=n.center.x,n.center.top=n.center.bottom=n.center.y,n}function b(e,t,n){for(var r=[[],[],[],[],[],[],[],[],[]],o=0;o<e.length;o++){var i,u,a=e[o],s=a.center;if(i=s.x<t.left?0:s.x<=t.right?1:2,r[u=3*(s.y<t.top?0:s.y<=t.bottom?1:2)+i].push(a),-1!==[0,2,6,8].indexOf(u)){var c=n;a.left<=t.right-t.width*c&&(2===u?r[1].push(a):8===u&&r[7].push(a)),a.right>=t.left+t.width*c&&(0===u?r[1].push(a):6===u&&r[7].push(a)),a.top<=t.bottom-t.height*c&&(6===u?r[3].push(a):8===u&&r[5].push(a)),a.bottom>=t.top+t.height*c&&(0===u?r[3].push(a):2===u&&r[5].push(a))}}return r}function m(e,t,n,r){if(!(e&&t&&n&&n.length))return null;for(var o=[],i=0;i<n.length;i++){var u=g(n[i]);u&&o.push(u)}if(!o.length)return null;var a=g(e);if(!a)return null;var s,c=function(e){return{nearPlumbLineIsBetter:function(t){var n;return(n=t.center.x<e.center.x?e.center.x-t.right:t.left-e.center.x)<0?0:n},nearHorizonIsBetter:function(t){var n;return(n=t.center.y<e.center.y?e.center.y-t.bottom:t.top-e.center.y)<0?0:n},nearTargetLeftIsBetter:function(t){var n;return(n=t.center.x<e.center.x?e.left-t.right:t.left-e.left)<0?0:n},nearTargetTopIsBetter:function(t){var n;return(n=t.center.y<e.center.y?e.top-t.bottom:t.top-e.top)<0?0:n},topIsBetter:function(e){return e.top},bottomIsBetter:function(e){return-1*e.bottom},leftIsBetter:function(e){return e.left},rightIsBetter:function(e){return-1*e.right}}}(a),f=b(o,a,r.straightOverlapThreshold),l=b(f[4],a.center,r.straightOverlapThreshold);switch(t){case"left":s=[{group:l[0].concat(l[3]).concat(l[6]),distance:[c.nearPlumbLineIsBetter,c.topIsBetter]},{group:f[3],distance:[c.nearPlumbLineIsBetter,c.topIsBetter]},{group:f[0].concat(f[6]),distance:[c.nearHorizonIsBetter,c.rightIsBetter,c.nearTargetTopIsBetter]}];break;case"right":s=[{group:l[2].concat(l[5]).concat(l[8]),distance:[c.nearPlumbLineIsBetter,c.topIsBetter]},{group:f[5],distance:[c.nearPlumbLineIsBetter,c.topIsBetter]},{group:f[2].concat(f[8]),distance:[c.nearHorizonIsBetter,c.leftIsBetter,c.nearTargetTopIsBetter]}];break;case"up":s=[{group:l[0].concat(l[1]).concat(l[2]),distance:[c.nearHorizonIsBetter,c.leftIsBetter]},{group:f[1],distance:[c.nearHorizonIsBetter,c.leftIsBetter]},{group:f[0].concat(f[2]),distance:[c.nearPlumbLineIsBetter,c.bottomIsBetter,c.nearTargetLeftIsBetter]}];break;case"down":s=[{group:l[6].concat(l[7]).concat(l[8]),distance:[c.nearHorizonIsBetter,c.leftIsBetter]},{group:f[7],distance:[c.nearHorizonIsBetter,c.leftIsBetter]},{group:f[6].concat(f[8]),distance:[c.nearPlumbLineIsBetter,c.topIsBetter,c.nearTargetLeftIsBetter]}];break;default:return null}r.straightOnly&&s.pop();var d=function(e){for(var t=null,n=0;n<e.length;n++)if(e[n].group.length){t=e[n];break}if(!t)return null;var r=t.distance;return t.group.sort(function(e,t){for(var n=0;n<r.length;n++){var o=r[n],i=o(e)-o(t);if(i)return i}return 0}),t.group}(s);if(!d)return null;var v=null;if(r.rememberSource&&r.previous&&r.previous.destination===e&&r.previous.reverse===t)for(var h=0;h<d.length;h++)if(d[h].element===r.previous.target){v=d[h].element;break}return v||(v=d[0].element),v}function y(e){return"string"==typeof e?[].slice.call(document.querySelectorAll(e)):"object"===(void 0===e?"undefined":t(e))&&e.length?[].slice.call(e):"object"===(void 0===e?"undefined":t(e))&&1===e.nodeType?[e]:[]}function w(e,n){return"string"==typeof n?p.call(e,n):"object"===(void 0===n?"undefined":t(n))&&n.length?n.indexOf(e)>=0:"object"===(void 0===n?"undefined":t(n))&&1===n.nodeType&&e===n}function I(){var e=document.activeElement;if(e&&e!==document.body)return e}function E(e){e=e||{};for(var t=1;t<arguments.length;t++)if(arguments[t])for(var n in arguments[t])arguments[t].hasOwnProperty(n)&&void 0!==arguments[t][n]&&(e[n]=arguments[t][n]);return e}function B(e,t){Array.isArray(t)||(t=[t]);for(var n,r=0;r<t.length;r++)(n=e.indexOf(t[r]))>=0&&e.splice(n,1);return e}function x(e,t,r){if(!e||!t||!f[t]||f[t].disabled)return!1;if(e.offsetWidth<=0&&e.offsetHeight<=0||e.hasAttribute("disabled"))return!1;if(r&&!w(e,f[t].selector))return!1;if("function"==typeof f[t].navigableFilter){if(!1===f[t].navigableFilter(e,t))return!1}else if("function"==typeof n.navigableFilter&&!1===n.navigableFilter(e,t))return!1;return!0}function F(e){for(var t in f)if(!f[t].disabled&&w(e,f[t].selector))return t}function L(e){return y(f[e].selector).filter(function(t){return x(t,e)})}function T(e){var t=f[e].defaultElement;return t?("string"==typeof t&&(t=y(t)[0]),x(t,e,!0)?t:null):null}function k(e){var t=f[e]&&f[e].lastFocusedElement;return x(t,e,!0)?t:null}function P(e,t,n){var r=!(arguments.length>3&&void 0!==arguments[3])||arguments[3];console.log("[fireEvent] type: ",t,", cancelable: ",r);var o=document.createEvent("CustomEvent");return o.initCustomEvent(i+t,!0,r,n),e.dispatchEvent(o)}function S(e,t,n){if(!e)return!1;var r=I(),o=function(){r&&r.blur(),e.focus(),O(e,t)};if(h)return o(),!0;if(h=!0,c)return o(),h=!1,!0;if(r){var i={nextElement:e,nextSectionId:t,direction:n,native:!1};if(!P(r,"willunfocus",i))return h=!1,!1;r.blur(),P(r,"unfocused",i,!1)}var u={previousElement:r,sectionId:t,direction:n,native:!1};return P(e,"willfocus",u)?(e.focus(),P(e,"focused",u,!1),h=!1,O(e,t),!0):(h=!1,!1)}function O(e,t){t||(t=F(e)),t&&(f[t].lastFocusedElement=e,v=t)}function N(e,t){if("@"==e.charAt(0)){return 1==e.length?M():M(e.substr(1))}else{var n=y(e)[0];if(n){var r=F(n);if(x(n,r))return S(n,r,t)}}return!1}function M(e){var t=[],n=function(e){e&&t.indexOf(e)<0&&f[e]&&!f[e].disabled&&t.push(e)};e?n(e):(n(d),n(v),Object.keys(f).map(n));for(var r=0;r<t.length;r++){var o,i=t[r];if(o="last-focused"==f[i].enterTo?k(i)||T(i)||L(i)[0]:T(i)||k(i)||L(i)[0])return S(o,i)}return!1}function j(e,t){P(e,"navigatefailed",{direction:t},!1)}function C(e,t){if(f[e].leaveFor&&void 0!==f[e].leaveFor[t]){var n=f[e].leaveFor[t];if("string"==typeof n)return""===n?null:N(n,t);var r=F(n);if(x(n,r))return S(n,r,t)}return!1}function H(e,t,r){var i=t.getAttribute("data-sn-"+e);if("string"==typeof i)return!(""===i||!N(i,e))||(j(t,e),!1);var u={},a=[];for(var s in f)u[s]=L(s),a=a.concat(u[s]);var c,l=E({},n,f[r]);if("self-only"==l.restrict||"self-first"==l.restrict){var d=u[r];(c=m(t,e,B(d,t),l))||"self-first"!=l.restrict||(c=m(t,e,B(a,d),l))}else c=m(t,e,B(a,t),l);if(c){f[r].previous={target:t,destination:c,reverse:o[e]};var v=F(c);if(r!=v){var h,p=C(r,e);if(p)return!0;if(null===p)return j(t,e),!1;switch(f[v].enterTo){case"last-focused":h=k(v)||T(v);break;case"default-element":h=T(v)}h&&(c=h)}return S(c,v,e)}return!!C(r,e)||(j(t,e),!1)}function A(e){if(!(!l||c||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)){var t=function(){return e.preventDefault(),e.stopPropagation(),!1},n=I(),o=F(n),i=r[e.keyCode];if(i){if("enter"==i&&n&&o&&!P(n,"enter-down"))return t();if(!n&&(v&&(n=k(v)),!n))return M(),t();if(o)return P(n,"willmove",{direction:i,sectionId:o,cause:"keydown"})&&H(i,n,o),t()}}}function z(e){if(!(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)&&!c&&l&&"center"==r[e.keyCode]){var t=I();t&&F(t)&&(P(t,"enter-up")||(e.preventDefault(),e.stopPropagation()))}}function D(e){var t=e.target;if(t!==window&&t!==document&&l&&!h){var n=F(t);if(n){if(c)return void O(t,n);var r={sectionId:n,native:!0};P(t,"willfocus",r)?(P(t,"focused",r,!1),O(t,n)):(h=!0,t.blur(),h=!1)}}}function K(e){var t=e.target;if(t!==window&&t!==document&&!c&&l&&!h&&F(t)){var n={native:!0};P(t,"willunfocus",n)?P(t,"unfocused",n,!1):(h=!0,setTimeout(function(){t.focus(),h=!1}))}}var V={init:function(){s||(window.addEventListener("keydown",A),window.addEventListener("keyup",z),window.addEventListener("focus",D,!0),window.addEventListener("blur",K,!0),s=!0)},uninit:function(){window.removeEventListener("blur",K,!0),window.removeEventListener("focus",D,!0),window.removeEventListener("keyup",z),window.removeEventListener("keydown",A),V.clear(),a=0,s=!1},clear:function(){f={},l=0,d="",v="",h=!1},set:function(){var e,r;if("object"===t(arguments[0]))r=arguments[0];else{if("string"!=typeof arguments[0]||"object"!==t(arguments[1]))return;if(e=arguments[0],r=arguments[1],!f[e])throw new Error('Section "'+e+"\" doesn't exist!")}for(var o in r)void 0!==n[o]&&(e?f[e][o]=r[o]:void 0!==r[o]&&(n[o]=r[o]));e&&(f[e]=E({},f[e]))},add:function(){var e,n={};if("object"===t(arguments[0])?n=arguments[0]:"string"==typeof arguments[0]&&"object"===t(arguments[1])&&(e=arguments[0],n=arguments[1]),e||(e="string"==typeof n.id?n.id:function(){for(var e;e=u+String(++a),f[e];);return e}()),f[e])throw new Error('Section "'+e+'" has already existed!');return f[e]={},l++,V.set(e,n),e},remove:function(e){if(!e||"string"!=typeof e)throw new Error('Please assign the "sectionId"!');return!!f[e]&&(f[e]=void 0,f=E({},f),l--,!0)},disable:function(e){return!!f[e]&&(f[e].disabled=!0,!0)},enable:function(e){return!!f[e]&&(f[e].disabled=!1,!0)},pause:function(){c=!0},resume:function(){c=!1},focus:function(e,t){var n=!1;void 0===t&&"boolean"==typeof e&&(t=e,e=void 0);var r=!c&&t;if(r&&V.pause(),e)if("string"==typeof e)n=f[e]?M(e):N(e);else{var o=F(e);x(e,o)&&(n=S(e,o))}else n=M();return r&&V.resume(),n},move:function(e,t){if(e=e.toLowerCase(),!o[e])return!1;var n=t?y(t)[0]:I();if(!n)return!1;var r=F(n);return!!r&&(!!P(n,"willmove",{direction:e,sectionId:r,cause:"api"})&&H(e,n,r))},makeFocusable:function(e){var t=function(e){var t=void 0!==e.tabIndexIgnoreList?e.tabIndexIgnoreList:n.tabIndexIgnoreList;y(e.selector).forEach(function(e){w(e,t)||e.getAttribute("tabindex")||e.setAttribute("tabindex","-1")})};if(e){if(!f[e])throw new Error('Section "'+e+"\" doesn't exist!");t(f[e])}else for(var r in f)t(f[r])},setDefaultSection:function(e){if(e){if(!f[e])throw new Error('Section "'+e+"\" doesn't exist!");d=e}else d=""},getSectionId:F},_=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}();new(function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e)}return _(e,[{key:"chebyshevDistance",value:function(e,t,n,r,o){var i,u=-r;for(i=0;i<n;i+=1)u=o(u,Math.abs(e[i]-t[i]));return u}},{key:"minkowskiDistance",value:function(e,t,n,r,o){var i,u;if(t!==r)throw"Both vectors should have same dimension";if(isNaN(o))throw'The order "p" must be a number';if(o===Number.POSITIVE_INFINITY)return this.chebyshevDistance(e,n,t,o,Math.max);if(o===Number.NEGATIVE_INFINITY)return this.chebyshevDistance(e,n,t,o,Math.min);if(o<1)throw"Order less than 1 will violate the triangle inequality";for(i=0,u=0;u<t;u+=1)i+=Math.pow(Math.abs(e[u]-n[u]),o);return isNaN(i)?0:Math.pow(i,1/o)}},{key:"calculate",value:function(e,t,n){return this.minkowskiDistance(e,e.length,t,t.length,n)}}]),e}());var q=new function e(){var t=this;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.init=function(){V.init(),V.focus(),t.bindFocusEvent()},this.destroy=function(){t.focusedPath=null,V.uninit(),t.unbindFocusEvent()},this.bindFocusEvent=function(){t.listening||(t.listening=!0,document.addEventListener("sn:focused",t.handleFocused))},this.unbindFocusEvent=function(){document.removeEventListener("sn:focused",t.handleFocused),t.listening=!1},this.handleFocused=function(e){t.focusedPath!==e.detail.sectionId&&t.setCurrentFocusedPath(e.detail.sectionId)},this.getCurrentFocusedPath=function(){return t.focusedPath},this.setCurrentFocusedPath=function(e){console.log("setCurrentFocusedPath called."),t.focusedPath=e,V.focus(e)},this.addFocusable=function(e,n){var r=n.focusPath,o=n.onEnterPressHandler;if(e&&!V.getSectionId(e)){t.removeFocusable(e,{onEnterPressHandler:o});var i=[{selector:e}];r&&i.unshift(r),e.addEventListener("sn:enter-down",o);var u=V.add.apply(V,i);V.makeFocusable(u)}},this.removeFocusable=function(e,t){var n=t.onEnterPressHandler,r=V.getSectionId(e);r&&(V.remove(r),e.removeEventListener("sn:enter-down",n))},this.destroy()};e.TVNavigation=q,Object.defineProperty(e,"__esModule",{value:!0})});
