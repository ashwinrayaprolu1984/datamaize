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

/* global Handsontable */

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
                } else {
                    obj = obj[packageName];
                }

            }
            //scopeobj = scope[packageName];
        }

    }

    if (this.Jquery) {
        $[name] = definition;
    }
})('datamaize.plugins.handsontable', (function (parent, $, Handsontable) {

    /** Each instance is stored as key value pair where key is ID of element
     * Default instance is just a reference Instance to show actual structure
     * hotObject: is actual Handsontable Instance
     * options: Options passed on to build the table
     * 
     */
    var _instances = {
        "default": {
            hotObject: undefined,
            options: undefined,
            offSet: undefined,
            totalRows: undefined,
            pageNumber: 0,
            loadingData: false,
            initialized: false

        }
    };


    function _beforeKeyDown(e) {
        var hot = this;
        //var hotId = this.container.parentNode.id;
        var visibleRows = hot.countVisibleRows();
        var selection = hot.getSelected();
        var keyCodes = Handsontable.helper.KEY_CODES;
        switch (e.keyCode) {
            //each of the 4 arrow key codes
            case keyCodes.ARROW_DOWN:
                //console.log(selection);
                //hot.selectCell(selection[0], selection[1]);
                var threshold = 15;
                if (hot.isEmptyRow(selection[0] + threshold)) {

                    //loadMoreData(visibleRows * 3);
                }

                break;

        }
    }

    function _afterScrollVertically(e) {
        var hot = this;
        var rowCount = hot.countRows();
        var rowOffset = hot.rowOffset();
        var visibleRows = hot.countVisibleRows();

        console.log("rowCount :" + rowCount);
        console.log("rowOffset :" + rowOffset);
        console.log("visibleRows :" + visibleRows);
        var currSettings = hot.getSettings();
        var currHeight = 0;
        if (typeof currSettings.height === "function") {
            currHeight = currSettings.height.call(hot);
            var rowHeight = currHeight / visibleRows;

        }

        var lastRow = rowOffset + (visibleRows * 1);
        var lastVisibleRow = rowOffset + visibleRows + (visibleRows / 2);
        var threshold = 15;

        if (lastVisibleRow > (rowCount - threshold)) {
            //loadMoreData(visibleRows * 3);
        }
    }

    /***
     * 
     * @param {type} id
     * @param {type} options
     * @returns {undefined}
     */
    function _buildHotTable(id, options) {
        _instances[id].hotObject = new Handsontable(document.getElementById(id), extend({
            afterScrollVertically: _afterScrollVertically,
            beforeKeyDown: _beforeKeyDown
        }, options));

    }

    /***
     * Used to build a new handsontable object.
     * Call's on existing object will return the current object
     * @param {id} id of the table  
     * @param {type} options
     * @returns returns hot object
     */
    function build(id, options) {
        if (!Handsontable) {
            console.log("Please load Handsontable for this plugin to work");
            return;
        }
        if (typeof _instances[id] === "undefined") {
            _instances[id] = {};
            _instances[id].options = options;
            _instances[id].offSet = 0;

            var hotData = [];
            if (typeof _instances[id].options.dataSource !== "undefined" && typeof _instances[id].options.dataSource === "function") {
                var hotDataPromise = _instances[id].options.dataSource.call({}, _instances[id].offSet, _instances[id].pageNumber, _instances[id].rowsPerPage);
                //$.when.apply($, hotDataPromise).then(

                hotDataPromise.done(
                        function (hotData) {
                            options.data = hotData;
                            _buildHotTable(id, options);
                        });
            } else {

                //$.when.apply($, _fetchData(id)).then(
                var hotDataPromise1 = _fetchData(id);
                hotDataPromise1.done(function (respData) {

                    var dataProcessor = _instances[id].options.dataProcessor;

                    if (typeof dataProcessor === 'function') {
                        hotData = dataProcessor.call({}, respData).data;
                    } else {
                        // Assumption is if there is no processor we pass actual data from backend
                        hotData = respData;
                    }
                    options.data = hotData;
                    _buildHotTable(id, options);


                    //console.log( "Both operations are done", respData );
                });

            }

        } else {
            return _instances[id].hotObject;
        }

    }

    /***
     * 
     * @param {type} id
     * @returns {Array}
     */
    function _fetchData(id) {
        if (_instances[id].loadingData) {
            console.log("Data load in progress!! Please try again.");
            return [];
        }
        var deferred = $.Deferred();
        try {
            _instances[id].loadingData = true;

            // Show progress bar when funciton built


            var postData = _instances[id].options.postData;
            if (typeof postData === 'function') {
                postData = postData.call({});
            }

            var request = $.ajax({
                url: _instances[id].options.url,
                method: "POST",
                data: postData,
                dataType: "json"
            });
            request.done(function (data) {
                deferred.resolve(data);
            });
            request.fail(function (data) {
                deferred.fail(data);
            });
            request.always(function () {
                //alert( "complete" );
            });


        } catch (e) {
            return null;
        }

        _instances[id].loadingData = false;
        return deferred.promise();

    }


    function getCurrentPageOptions(id) {
        return {
            offSet: _instances[id].offSet,
            totalRows: _instances[id].totalRows,
            pageNumber: _instances[id].pageNumber
        };
    }



    // Reveal public pointers to
    // private functions and properties
    var module = extend(parent, {
        init: build,
        getCurrentPageOptions: getCurrentPageOptions
    });
    return module;


})({}, jQuery, Handsontable));


