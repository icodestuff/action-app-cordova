/*
Author: Joseph Francis
License: MIT
*/

/*  NoSqlDataManager

Designed to abstract json based data storage in a way that is not specific to source type or location.

---------------------- ---------------------- ---------------------- ----------------------
Important: 
    This expects PouchDB to be available for local storage as it is the default handler for data requests
    * To change this, replace the [default] handler with your own function / alternate handler
---------------------- ---------------------- ---------------------- ----------------------
How to use:
----------------------

Get the plugin (Singleton):
  var dataMgr = $.fn.NoSqlDataManager

Data Manager uses known or identified sources
  dataMgr.getDocument(sourceName, docID)
  dataMgr.putDocument(sourceName, docID, theObject)
  dataMgr.deleteDocument(sourceName, docID)
  dataMgr.getAll(sourceName)
  dataMgr.getAll(sourceName, ['key1','key2']);

  //--- Special functions

  //--- Replicate from a remote server
  // Notes:
  //  This uses a bulk load to initially populate a pouch database, then replication is used if supported
  //  Replication only works to refresh a localPouch database from a remote source that supports replication, else
  //    a full refresh is done each time
  dataMgr.syncLocalVersion(theLocalDatabaseName, theRemoteSourceName);

Data Manager can be extended to handle custom sources
  dataMgr.putSourceHandler('mytestdb',{"handler":"[couch]", "options":{"dbName","some-database-name"}}); 

Data Manager handlers can had defaults set / overridden
  dataMgr.putSourceHandlerDefaults('[ajax]',{ ajax: {"url": "http://your.location/apicall/"}});
  
Note: If the source is not an internal name [likethis],  but the handler is (i.e. [pouch]), then ...
          .. if no options object with a dbname is provided, the db name is assumed to be the source name
      Examples: 
        dataMgr.putDocument('testdb, 'mydoc1', {"title":"My Test Doc"}); //Add mydoc1 to the local pouch db: "testdb"
        dataMgr.getDocument('testdb', 'mydoc1'); //returns mydoc1 from the local pouch db: "testdb"

Source Handlers:  ("name" = function or name of other handler.)
[any-internal] = when [] is used, these are internal / common handlers for known source data

  "[default]" = the default handler if none is provided, [pouch] by default.
  "[pouch]" = Handler specifically for local pouch storage, where create and destroy requires no special privs
  "[couch]" = Handler for a (usually local) couch database
  "[ajax]" = Handler for any external ajax handler that follows the known protocol

  TBD: 
  "[cloudant]" = Handler for a cloudant *** not implemented, use couch

*/

$.fn.NoSqlDataManager = (function ($) {

    function DataManager(theOptions) { };
    var me = DataManager.prototype;

    function getFailFunction(theDeferred, thePrefixText) {
        return function (theError) {
            console.error((thePrefixText || 'Error') + ": " + theError);
            theDeferred.reject((thePrefixText || 'Error') + ": " + theError);
        }
    }
    me.createAndPopulateDB = function (theDBName, theRows) {
        var dfd = jQuery.Deferred();

        var tmpRows = theRows || [];
        var tmpCount = tmpRows.length;
        //--- assume it has been removed, no db should exist
        //Todo: Check for count, over 0 fail?
        var db = new PouchDB(theDBName);
        try {
            var tmpBulk = [];
            var tmpAdded = 0;
            for (var i = 0; i < tmpCount; i++) {
                var tmpDoc = tmpRows[i].doc || false;
                if (tmpDoc) {
                    tmpBulk.push(tmpRows[i].doc);
                    tmpAdded++;
                }
            }
            db.bulkDocs(tmpBulk, { "new_edits": false }).then(function () {
                dfd.resolve(tmpAdded);
            }, function (theError) {
                dfd.reject("Error in createAndPopulateDB: " + theError);
            })
        } catch (theError) {
            dfd.reject("Error in createAndPopulateDB: " + theError);
        }
        return dfd.promise();
    }

    me.getDataDetails = getDataDetails;
    function getDataDetails(theData) {
      //  console.log("theData", theData);

        var tmpRet = {
            fieldCount: 0,
            fields: {},
            details: []
        }
        if (!theData) {
            return;
        }
        var tmpData = theData;
        if (tmpData.docs) {
            tmpData = tmpData.docs;
        }
        if (tmpData.length < 1) {
            return tmpRet;
        }
        tmpRet.designDocs = 0;

        for (var i = 0; i < tmpData.length; i++) {
            var tmpDoc = tmpData[i];
            var tmpID = tmpDoc._id;

            if (tmpID.indexOf("_design") == 0) {
                tmpRet.designDocs++;
            } else {
                for (var aFieldName in tmpDoc) {

                    if (!(tmpRet.fields[aFieldName])) {
                        tmpRet.fields[aFieldName] = { isMissing: 0, hasField: 0, hasValue: 0, values: {}, valueTypes: {}, valuesTypes: {} }
                    }
                    var tmpFO = tmpRet.fields[aFieldName];

                    tmpFO.hasField++;
                    var tmpVals = tmpDoc[aFieldName];

                    var tmpValType = typeof (tmpVals);
                    var tmpIsEmpty = false;

                    if ($.isArray(tmpVals)) {
                        tmpValType = 'ARRAY';
                        if( tmpVals.length == 0){
                            tmpIsEmpty = true;
                        }
                    }
                    if (!tmpFO.valuesTypes.hasOwnProperty(tmpValType)) {
                        tmpFO.valuesTypes[tmpValType] = 1;
                    } else {
                        tmpFO.valuesTypes[tmpValType]++
                    }

                    if (!($.isArray(tmpVals)) && typeof (tmpVals) == 'object') {
                        tmpVals = '[OBJECT]';
                    }
                    if (tmpVals == null || typeof (tmpVals) == 'undefined') {
                        tmpFO.isMissing++;
                    } else if (typeof (tmpVals) == 'string') {
                        if (tmpVals) {
                            tmpFO.hasValue++;
                        }
                        tmpVals = [tmpVals];
                    } else {
                        if (!($.isArray(tmpVals))) {
                            tmpVals = [tmpVals];                       
                        }
                        if( !tmpIsEmpty && !(tmpVals.length == 1 && (tmpVals[0] == '' || tmpVals[0] == null))){
                            tmpFO.hasValue++;                           
                        }                        
                    }

                    for (var aValPos in tmpVals) {
                        var tmpVal = tmpVals[aValPos];

                        if (typeof (tmpVal) == 'boolean' || (tmpVal != '')) {
                            if (!tmpFO.values.hasOwnProperty(tmpVal)) {
                                tmpFO.values[tmpVal] = 1;
                            } else {
                                tmpFO.values[tmpVal]++
                            }
                        }
                        var tmpValType = typeof (tmpVal);
                        if (!tmpFO.valueTypes.hasOwnProperty(tmpValType)) {
                            tmpFO.valueTypes[tmpValType] = 1;
                        } else {
                            tmpFO.valueTypes[tmpValType]++
                        }
                    }
                }
            }
        }
        tmpRet.data = tmpData;

        return tmpRet;
    }

    me.syncLocalVersion = syncLocalVersion;
    function syncLocalVersion(theLocalDatabaseName, theRemoteSourceName) {
        var dfd = jQuery.Deferred();
        try {
            if (!(theLocalDatabaseName)) {
                dfd.reject("No source name");
                return dfd.promise();
            }
            var tmpLocalVersion = new PouchDB(theLocalDatabaseName);
            tmpLocalVersion.info().then(function (theInfo) {
                if (theInfo && theInfo.doc_count > 0) {
                    me.replicateDownLocalVersion(theLocalDatabaseName, theRemoteSourceName).then(
                        function (theResponse) {
                            dfd.resolve(theResponse);
                        }
                    )
                    //alert("would repl")
                } else {
                    me.pullInitialLocalVersion(theLocalDatabaseName, theRemoteSourceName).then(
                        function (theResponse) {
                            dfd.resolve(theResponse);
                        }
                    )
                }
            });
        } catch (theError) {
            dfd.reject("Error getting database: " + theError);
        }
        return dfd.promise();
    };



    me.pullInitialLocalVersion = pullInitialLocalVersion;
    function pullInitialLocalVersion(theLocalDatabaseName, theRemoteSourceName) {

        var dfd = jQuery.Deferred();
        try {
            if (!(theLocalDatabaseName)) {
                dfd.reject("No source name");
                return dfd.promise();
            }
            var tmpLocalVersion = new PouchDB(theLocalDatabaseName);
            me.getDatabaseFromSourceName(theRemoteSourceName).then(function (theRemoteDB) {
                theRemoteDB.allDocs({ include_docs: true }).then(function (docs) {

                    var tmpRows = docs.rows;
                    me.createAndPopulateDB(theLocalDatabaseName, tmpRows).then(function () {
                        dfd.resolve(true);
                    }).fail(
                        function (theError) {
                            dfd.reject("Error loading all docs: " + theError);
                        }
                        );
                }, function (theError) {
                    dfd.reject("Error loading all docs: " + theError);
                })

            }).fail(function (theError) { dfd.reject("Error syncing local version: " + theError) })
        } catch (theError) {
            dfd.reject("Error getting database: " + theError);
        }
        return dfd.promise();
    };

    me.replicateDownLocalVersion = replicateDownLocalVersion;
    function replicateDownLocalVersion(theLocalDatabaseName, theRemoteSourceName) {
        var dfd = jQuery.Deferred();
        try {
            if (!(theLocalDatabaseName)) {
                dfd.reject("No source name");
                return dfd.promise();
            }
            var tmpLocalVersion = new PouchDB(theLocalDatabaseName);
            me.getDatabaseFromSourceName(theRemoteSourceName).then(function (theRemoteDB) {
                tmpLocalVersion.replicate.from(theRemoteDB).on('complete', function () {
                    dfd.resolve(true);
                }).on('error', function (err) {
                    dfd.reject("Error syncing local version: " + err);
                });
            }).fail(function (theError) { dfd.reject("Error syncing local version: " + theError) })
        } catch (theError) {
            dfd.reject("Error getting database: " + theError);
        }
        return dfd.promise();
    };

    me.getDocumentHandler = getDocumentHandler;
    function getDocumentHandler(theSourceName) {

        var tmpRet = {};
        var tmpSource = theSourceName;
        var tmpSourceHandlerName = tmpSourceName;
        var tmpSourceName = theSourceName;
        var tmpSources = tmpSource.split(":");
        if (tmpSources.length > 0) {
            tmpSourceHandlerName = tmpSources[0];
            tmpSourceName = tmpSourceName.replace(tmpSourceHandlerName + ':', '');
        }

        var tmpHandler = getSourceHandler(tmpSourceHandlerName);
        if (!tmpHandler) {
            console.error("Error in getDocumentHandler: No handler found for source " + tmpSource);
            return false;
        }

        var tmpHandlerFunc = tmpHandler;
        var tmpHandlerOptions = {};
        if (tmpSourceName == tmpSourceHandlerName && tmpHandler.source && (tmpHandler.source.indexOf(':') >= 0)) {
            tmpSource = tmpHandler.source;
            tmpSourceHandlerName = tmpSource;
            tmpSourceName = tmpSource;
            var tmpSources = tmpSource.split(":");
            if (tmpSources.length > 0) {
                tmpSourceHandlerName = tmpSources[0];
                tmpSourceName = tmpSourceName.replace(tmpSourceHandlerName + ':', '');
                tmpSource = tmpSourceName;
            }
            tmpHandlerFunc = getSourceHandler(tmpSourceHandlerName);
        } else {
            if (typeof (tmpHandlerFunc) == 'object') {

                if (typeof (tmpHandlerFunc.options) == 'object') {
                    tmpHandlerOptions = tmpHandlerFunc.options;
                }
                if (typeof (tmpHandlerFunc.source) == 'string') {
                    tmpSourceName = tmpHandlerFunc.source;
                }
                tmpHandlerFunc = getSourceHandler(tmpHandlerFunc.handler);;
            }
        }

        if (typeof (tmpHandlerFunc) != 'function') {
            console.error("Error in getDocumentHandler: No handler FUNCTION found for source " + tmpSource);
            return false;
        }

        if (sourceHandlerOptions.hasOwnProperty(tmpSourceHandlerName)) {
            tmpHandlerOptions = $.extend(sourceHandlerOptions[tmpSourceHandlerName], tmpHandlerOptions);
        }

        tmpRet.source = tmpSourceName;
        tmpRet.options = tmpHandlerOptions;
        tmpRet.handler = tmpHandlerFunc;

        return tmpRet;
    }


    //--- Public Implementation === === === === === === === === === === === === === === === === === === === === === === 
    /*
    
    Out of the box: 
     - getDocument
     - getDocuments
     - putDocument
     - deleteDocument
 
    Advanced Options to configure alternate sources and provide access creditials and/or APIs to use for source data.
     - putSourceHandler (advanced)
     - putSourceHandlerDefaults (advanced)
 
 
    
     */
    me.putSourceHandler = putSourceHandler;
    function putSourceHandler(theSourceName, theHandler) {
        sourceHandlers[theSourceName] = theHandler;
    }

    me.getDocument = getDocument;
    function getDocument(theSourceName, thePath) {
        var tmpHandlerDetails = getDocumentHandler(theSourceName);
        var tmpActionDetails = {
            action: 'get',
            location: thePath,
            source: tmpHandlerDetails.source
        }
        return tmpHandlerDetails.handler(tmpActionDetails, tmpHandlerDetails.options);
    }

    me.getDocuments = getDocuments;
    function getDocuments(theSourceName, theKeys) {
        var tmpHandlerDetails = getDocumentHandler(theSourceName);
        var tmpActionDetails = {
            action: 'getDocs',
            keys: theKeys,
            source: tmpHandlerDetails.source
        }
        return tmpHandlerDetails.handler(tmpActionDetails, tmpHandlerDetails.options);
    }

    me.putDocument = putDocument;
    function putDocument(theSourceName, thePath, theObject) {
        var tmpHandlerDetails = getDocumentHandler(theSourceName);
        //---ToDo: Work out deeper path or rename
        theObject._id = thePath;

        var tmpActionDetails = {
            action: 'put',
            doc: theObject,
            location: thePath,
            source: tmpHandlerDetails.source
        }
        return tmpHandlerDetails.handler(tmpActionDetails, tmpHandlerDetails.options);
    }

    me.deleteDocument = deleteDocument;
    function deleteDocument(theSourceName, thePath) {
        var tmpHandlerDetails = getDocumentHandler(theSourceName);
        var tmpActionDetails = {
            action: 'delete',
            location: thePath,
            source: tmpHandlerDetails.source
        }
        return tmpHandlerDetails.handler(tmpActionDetails, tmpHandlerDetails.options);
    }

    var sourceHandlers = {
        "[default]": "[pouch]",
        "[pouch]": sourceHandlerForPouch,
        "[couch]": sourceHandlerForNoSQL,
        "[cloudant]": sourceHandlerForNoSQL,
        "[get]": sourceHandlerForAjaxGet,
        "[ajax]": sourceHandlerForAjaxPost
    }
    var sourceHandlerOptions = {
        "[couch]": { auth: { username: '', password: '' } },
        "[ajax]": { ajax: { url: './' } }
    }
    me.putSourceHandlerDefaults = putSourceHandlerDefaults;
    function putSourceHandlerDefaults(theSourceName, theDefaultOptions) {
        if (!(theSourceName)) {
            return false;
        }
        sourceHandlerOptions[theSourceName] = theDefaultOptions || {}
        return true;
    }

    me.sourceHandlerForPouch = sourceHandlerForPouch;
    function sourceHandlerForPouch(theAction, theOptions) {
        var dfd = jQuery.Deferred();

        if (!(theAction) && typeof (theAction.source) == 'object') {
            dfd.reject("Error: No action passed");
            return dfd.promise();
        }

        var tmpDBName = theAction.source || '';
        var tmpDB = new PouchDB(tmpDBName);
        var tmpOptions = $.extend({}, theOptions, { db: tmpDB });
        return sourceHandlerForNoSQL(theAction, tmpOptions)
    }

    me.transformNoSQLDocs = function (theDocs) {
        if (typeof (theDocs.rows) == 'object') {
            theDocs = theDocs.rows;
        }
        var tmpRet = {
            docs: []
        }
        for (var aDocPos in theDocs) {
            var tmpDoc = theDocs[aDocPos];
            tmpDoc = tmpDoc.doc || tmpDoc;
            var tmpID = tmpDoc._id;
            if( tmpID.indexOf("_design") != 0){
                tmpDoc._index = aDocPos;
                tmpRet.docs.push(tmpDoc);
            }
            // if (tmpDoc.hasOwnProperty('sys_DocType') && tmpDoc['sys_DocType'] == 'session') {
           
            // }
        }
        return tmpRet;
    }


    me.getDatabaseFromSourceName = function (theSourceName) {
        var tmpHandler = getDocumentHandler(theSourceName);
        return me.getDatabase((tmpHandler.options.source || tmpHandler.source), tmpHandler.options);
    }

    me.getDatabase = function (theSourceName, theOptions) {
        var dfd = jQuery.Deferred();
        try {
            var tmpDB = null;
            if (theOptions.hasOwnProperty('url')) {
                var tmpDBOptions = {};
                if (typeof (theOptions.auth) == 'object') {
                    tmpDBOptions.auth = theOptions.auth;
                }
                tmpDB = new PouchDB(theOptions.url + theSourceName);
            } else {
                tmpDB = new PouchDB(theSourceName);
            }
            var tmpOptions = $.extend({}, (theOptions || {})); //, { db: tmpDB }
            if (tmpDBOptions.auth) {
                tmpDB.login(tmpDBOptions.auth.username, tmpDBOptions.auth.password).then(function (user) {
                    dfd.resolve(tmpDB);
                })
            } else {
                dfd.resolve(tmpDB);
            }

        } catch (theError) {
            dfd.reject("Error getting database: " + theError);
        }
        return dfd.promise();
    }

    me.sourceHandlerForNoSQL = sourceHandlerForNoSQL;
    function sourceHandlerForNoSQL(theAction, theOptions) {
        var dfd = jQuery.Deferred();

        theOptions = theOptions || {};
        var tmpDBName = theAction.source || '';

        if (!(typeof (theOptions.db) == 'object')) {
            me.getDatabase(tmpDBName, theOptions).then(function (theDB) {
                theOptions.db = theDB;
                me.sourceHandlerForNoSQL(theAction, theOptions).then(function (theResponse) {
                    dfd.resolve(theResponse);
                });
            })
            return dfd.promise();
        }

        var tmpAction = theAction.action || 'get';
        var tmpDocID = theAction.location || '';

        var tmpDB = theOptions.db;
        if (tmpAction == 'get') {
            tmpDB.get(tmpDocID).then(function (theDoc) {
                if (theDoc.doc) {
                    theDoc = theDoc.doc;
                }
                dfd.resolve(theDoc);
            }).catch(function (err) {
                dfd.reject("Error getting document from nosql db. " + err.toString());
            });
        } else if (tmpAction == 'put') {
            var tmpDoc = theAction.doc || false;

            tmpDB.get(tmpDocID).then(function (doc) {
                tmpDoc._rev = doc._rev;
                tmpDoc._id = doc._id;
                return tmpDB.put(tmpDoc);
            }).then(function (theResponse) {
                dfd.resolve(tmpDoc, theResponse);
            }).catch(function (err) {
                if (err.status == 404) {
                    tmpDB.put(tmpDoc).then(function (theResponse) {
                        dfd.resolve(tmpDoc, theResponse);
                    }).catch(function (err) {
                        dfd.reject("Error putting document into a nosql db. " + err.toString());
                    });
                } else {
                    dfd.reject("Error putting document into a nosql db. " + err.toString());
                }

            });
        } else if (tmpAction == 'getDocs') {
            var tmpRet = [];
            var tmpOptions = { include_docs: true };
            var tmpKeys = theAction.keys || [];
            if ((tmpKeys) && tmpKeys.length > 0) {
                tmpOptions.keys = tmpKeys;
            }
            tmpDB.allDocs(tmpOptions).then(function (theResponse) {
                tmpRet = me.transformNoSQLDocs(theResponse)
                dfd.resolve(tmpRet);
            }).catch(function (err) {
                dfd.reject("Error getting documents from a nosql db. " + err.toString());
            });
        } else if (tmpAction == 'delete') {
            var tmpRet = [];
            tmpDB.get(tmpDocID).then(function (doc) {
                return tmpDB.remove(doc);
            }).then(function (theResult) {
                dfd.resolve(theResult);
            }).catch(function (err) {

                if (err.status == 404) {
                    dfd.resolve({
                        _id: tmpDocID,
                        ok: true,
                        msg: "OK, Did not exist."
                    });
                } else {
                    dfd.reject("Error deleting document from a nosql db. " + err.toString());
                }

            });
        }

        return dfd.promise();
    }

    
    //--- Simple URL get method
    me.sourceHandlerForAjaxGet = sourceHandlerForAjaxGet;
    function sourceHandlerForAjaxGet(theAction, theOptions) {
        var dfd = jQuery.Deferred();
       
        var tmpAction = theAction.action || 'get';
        var tmpURL = theAction.location || '';
        var tmpDataType = "json";
        if( theOptions && theOptions.dataType ){
            tmpDataType = theOptions.dataType;
        }
        if (!(tmpURL)) {
            dfd.reject("No url to get");
            return dfd.promise();
        }

        $.ajax({
            url: tmpURL,
            method: 'GET',
            dataType: tmpDataType,
            success: function (theResponse) {
                dfd.resolve(theResponse);
            },
            error: function (theError) {
                dfd.reject("No URL setup to handle this ajax call: " + theError);
            }
        });
        return dfd.promise();

    }

    me.sourceHandlerForAjaxPost = sourceHandlerForAjaxPost;
    function sourceHandlerForAjaxPost(theAction, theOptions) {
        var dfd = jQuery.Deferred();
        theAction.options = theOptions || {};

        if (typeof (theAction.options.ajax) != 'object') {
            dfd.reject("No ajax object setup to handle this ajax call");
            return dfd.promise();
        }

        if (typeof (theAction.options.ajax.url) != 'string') {
            dfd.reject("No URL setup to handle this ajax call");
            return dfd.promise();
        }

        $.ajax({
            url: theAction.options.ajax.url,
            data: theAction.options.ajax.data || theAction.data || theAction,
            method: 'POST',
            dataType: "json",
            success: function (theResponse) {
                dfd.resolve(theResponse);
            },
            error: function (theError) {
                dfd.reject("No URL setup to handle this ajax call: " + theError);
            }
        });
        return dfd.promise();

    }

    me.getSourceHandler = getSourceHandler;
    function getSourceHandler(theSourceName) {
        var tmpSourceName = theSourceName || '';
        if (tmpSourceName == '') {
            tmpSourceName = "[default]";
        }
        var tmpHandler = false;
        if (sourceHandlers.hasOwnProperty(theSourceName)) {
            tmpHandler = sourceHandlers[theSourceName];
        } else {
            tmpHandler = "[default]";
        }
        if (typeof (tmpHandler) == 'function' || typeof (tmpHandler) == 'object') {
            return tmpHandler;
        }

        //--- Go a few deep to find handler function
        for (var i = 0; i < 10; i++) {
            if (sourceHandlers.hasOwnProperty(tmpHandler)) {
                tmpHandler = sourceHandlers[tmpHandler];
            } else {
                //--- Something is not right, return sourceHandlerForPouch
                tmpHandler = sourceHandlerForPouch;
            }
            if (typeof (tmpHandler) == 'function' || typeof (tmpHandler) == 'object') {
                return tmpHandler;
            }
        }



    }

    me.init = init;
    function init() {
        if (ThisApp) {
            ThisApp.registerActionDelegate("_om", runAction);
        }
        return me;
    }


    return me;

})($);
