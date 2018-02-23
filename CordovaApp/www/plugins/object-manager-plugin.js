/*
Author: Joseph Francis
License: MIT
*/

/*  ObjectManager

Designed to abstract object storage in a way that is not specific to source type or location.
---------------------- ---------------------- ---------------------- ----------------------
Important: 
    This expects PouchDB to be available for local storage as it is the default handler for object requests
    * To change this, replace the [default] handler with your own function / alternate handler
---------------------- ---------------------- ---------------------- ----------------------
How to use:
----------------------

Get the plugin:
  var om = theApp.getComponent("plugin:ObjectManager");

Object Manager uses known or identified sources
  om.getObject(sourceName, docID)
  om.putObject(sourceName, docID, theObject)
  om.deleteObject(sourceName, docID)
  om.getAll(sourceName)
  om.getAll(sourceName, ['key1','key2']);

Object Manager can be extended to handle custom sources
  om.putSourceHandler('mytestdb',{"handler":"[couch]", "options":{"dbName","some-database-name"}}); 

Object Manager handlers can had defaults set / overridden
  om.putSourceHandlerDefaults('[ajax]',{ ajax: {"url": "http://your.location/apicall/"}});
  
Note: If the source is not an internal name [likethis],  but the handler is (i.e. [pouch]), then ...
          .. if no options object with a dbname is provided, the db name is assumed to be the source name
      Examples: 
        om.putObject('testdb, 'mydoc1', {"title":"My Test Doc"}); //Add mydoc1 to the local pouch db: "testdb"
        om.getObject('testdb', 'mydoc1'); //returns mydoc1 from the local pouch db: "testdb"

Source Handlers:  ("name" = function or name of other handler.)
[any-internal] = when [] is used, these are internal / common handlers for known source data

  "[default]" = the default handler if none is provided, [pouch] by default.
  "[pouch]" = Handler specifically for local pouch storage, where create and destroy requires no special privs
  "[couch]" = Handler for a (usually local) couch database
  "[ajax]" = Handler for any external ajax handler that follows the known protocol

  TBD: 
  "[cloudant]" = Handler for a cloudant *** not implemented, use couch

*/

(function (ActionAppCore, $) {
    var MyMod = ActionAppCore.module("plugin");
    MyMod.ObjectManager = ObjectManager;
    var ThisApp = null;
    var dataMgr = $.fn.NoSqlDataManager;

    var thisComponentID = "plugin:ObjectManager";

    function ObjectManager(theOptions) {
        var tmpOptions = theOptions || {};
        if (typeof (tmpOptions.app) == 'object') {
            ThisApp = tmpOptions.app;
            if (ThisApp && ThisApp.registerComponent) {
                ThisApp.registerComponent(thisComponentID, this);
            }
        }
    }

    var me = ObjectManager.prototype;
    

    me.getObjectHandler = dataMgr.getDocumentHandler;
    me.putSourceHandler = dataMgr.putSourceHandler;
    me.getObject = dataMgr.getDocument;
    me.getObjects = dataMgr.getDocuments;
    me.putObject = dataMgr.putDocument;
    me.deleteObject = dataMgr.deleteDocument;

    me.putSourceHandlerDefaults = dataMgr.putSourceHandlerDefaults;
    me.sourceHandlerForPouch = dataMgr.sourceHandlerForPouch;

    me.getDatabaseFromSourceName = dataMgr.getDatabaseFromSourceName;
    me.transformNoSQLDocs = dataMgr.transformNoSQLDocs;
    me.getDatabase = dataMgr.getDatabase;

    window.onFail = function(theFailure){console.log(theFailure)};
    window.onDone = function(theResult){console.log("Done: Results are...", theResult)};

    me.sourceHandlerForNoSQL = dataMgr.sourceHandlerForNoSQL;
    me.sourceHandlerForAjax = dataMgr.sourceHandlerForAjax;
    me.getSourceHandler = dataMgr.getSourceHandler;
    
    me.createAndPopulateDB = dataMgr.createAndPopulateDB;
    me.syncLocalVersion = dataMgr.syncLocalVersion;
    me.pullInitialLocalVersion = dataMgr.pullInitialLocalVersion;
    me.replicateDownLocalVersion = dataMgr.replicateDownLocalVersion;
    
    function runAction(theAction, theSourceObject) {
        if (typeof (me[theAction]) == 'function') {
            me[theAction](theAction, theSourceObject);
        }
    }

    me.test = test;
    function test() {
        return ('Object Manager test');
    }

    me.testAction = function () {
        alert('Object Manager Testing');
    }

    me.init = init;
    function init() {
        ThisApp.registerActionDelegate("_om", runAction);
        return this;
    }


    //--- Impl ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 
    //--- Impl ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 
    //--- Impl ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 


    //--- Templates ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 
    //--- ========  ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 
    //--- ========  ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 

    var tmpModuleTemplates = {};
    tmpModuleTemplates["_om:about-this-plugin"] = '<div class="ui segment basic">This plugin handles general object management functionality is a common / abstracted way.</div>';
    $.templates(tmpModuleTemplates);


})(ActionAppCore, $);



