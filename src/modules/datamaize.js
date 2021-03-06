/* 
 * The MIT License
 *
 * Copyright 2016 ashwinrayaprolu.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/****
 * Few Helper Functions on the top
 * @param {type} obj
 * @param {type} src
 * @returns {unresolved}
 */
function extend(obj, src) {
    for (var key in src) {
        if (src.hasOwnProperty(key))
            obj[key] = src[key];
    }
    return obj;
}




(function (name, definition) {
    var theModule = definition,
            hasDefine = typeof define === 'function',
            hasExports = typeof module !== 'undefined' && module.exports;

    if (hasDefine) { // AMD Module
        define(theModule);
    } else if (hasExports) { // Node.js Module
        module.exports = theModule;
    } else { // Assign to common namespaces or simply the global object (window)


        // account for for flat-file/global module extensions
        var namespaces = name.split(".");
        var scope = (this.jQuery || this.ender || this.$ || window || this);
        var obj = scope;
        
        if (namespaces.length === 1) {
            scope[namespaces[0]] = theModule;
        } else {

            for (var i = 0; i < namespaces.length; i++) {
                var packageName = namespaces[i];
                if (obj && i === namespaces.length - 1) {
                    obj[packageName] = theModule;
                } else if (typeof obj[packageName] === "undefined") {
                    obj[packageName] = {};
                    obj = obj[packageName]; 
                }else{
                    obj = obj[packageName]; 
                    
                }
                
            }
            //scopeobj = scope[packageName];
        }

    }
})('datamaize', (function (parent, $) {
    "use strict";
    var _pluginmap = {};

    /**
     * 
     * @returns {nm$_datamaize.datamaize_L71.pluginmap}
     */
    function plugins() {
        return _pluginmap;
    }
    /**
     * 
     * @param {type} name
     * @param {type} definition
     * @returns {undefined}
     */
    function addPlugin(name, definition) {
        _pluginmap[name] = definition;
    }


    // Reveal public pointers to
    // private functions and properties

    return extend(parent, {
        listplugins: plugins,
        plugins: {},
        addPlugin: addPlugin
    });


})({}, jQuery));
