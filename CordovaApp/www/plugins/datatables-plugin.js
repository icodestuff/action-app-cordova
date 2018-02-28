/*
Author: Joseph Francis
License: MIT
*/

(function (ActionAppCore, $) {
    var MyMod = ActionAppCore.module("plugin");
    MyMod.DataTables = ThisPageController;
    
    var ThisApp = null;

    var thisComponentID = "plugin:DataTables";

    //--- Base class for application pages
    function ThisPageController(theOptions) {
        this.options = theOptions || {};
        this.actions = this.options.actions || {};
        var defaults = {};
        if (typeof (this.options.app) == 'object') {
            ThisApp = this.options.app;
            if (ThisApp && ThisApp.registerComponent) {
                ThisApp.registerComponent(thisComponentID, this);
            }
        }
    }

    var me = ThisPageController.prototype;
    

    function runAction(theAction, theSourceObject) {
        if (typeof (me[theAction]) == 'function') {
            me[theAction](theAction, theSourceObject);
        }
    }

    me.test = test;
    function test() {
        return ('DataTables test');
    }

    me.testAction = function(){
        alert('dt ta');
    }

    me.init = init;
    function init(theApp) {
        ThisApp.registerActionDelegate("_dt", runAction);        
        //-- Note: Can also just use getAppData directly from component in the application, no need to register.
        //    just showing global actions can be registered by components
        return this;
    }




    //--- Impl ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 
    //--- Impl ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 
    //--- Impl ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 
    me.tableTemplateHTML = '<div class="ui segment basic"> <table appuse="datatable" class=" row-border compact" cellspacing="0" width="100%"><thead></table> </div>';
    me.addTable = function (theFacetName) {
        //--- Load facet with template data, nothing to include
        //     ... this returns the facet in case you need to find something inside it
        var tmpFacet = ThisApp.loadFacet(theFacetName, me.tableTemplateHTML);
        //     Find the added table and return it
        return tmpFacet.find('table');
    }

    me.runForIndexMatches = function(theTable, theIndexes, theFunction, theExtraParams){
        if(typeof(theFunction) !== 'function'){
            console.error("No function passed to run");
            return false;
        }
        var rowData = theTable.rows(theIndexes).data().toArray();
        var tmpRow = theTable.rows(theIndexes).columns(1);
        if (rowData && rowData.length > 0) {
            for (var i = 0; i < rowData.length; i++) {
                var tmpData = rowData[i];
                if( tmpData ){
                    theFunction(tmpData,i,theExtraParams)
                }
            }
        }
    }
    me.onSelectCheckboxCommand = function (e, dt, type, indexes, theTable, theTableEl, theCommand, theKeyField) {
        var tmpKeyField = theKeyField || 'id';
        me.runForIndexMatches(theTable,indexes, function(theData, thePos){
            var tmpID = theData[tmpKeyField];
            if( tmpID ){
                var tmpEl = theTableEl.find('[dtuse="select-row"][dtid="' + tmpID + '"]');
                $(tmpEl).checkbox(theCommand);
            }
        })       
    }
    me.onCheckboxSelect = function (e, dt, type, indexes, theTable, theTableEl, theKeyField) {
        me.onSelectCheckboxCommand(e, dt, type, indexes, theTable, theTableEl, 'set checked', theKeyField)
    }
    me.onCheckboxDeselect = function (e, dt, type, indexes, theTable, theTableEl, theKeyField) {
        me.onSelectCheckboxCommand(e, dt, type, indexes, theTable, theTableEl, 'set unchecked', theKeyField)
    }
    me.checkboxDataCallback = function (data, type, row, meta) {
        return me.getCheckboxColumn(data.id);
    }
    me.getCheckboxColumn = function (theId){
        return '<div dtuse="select-row" dtid="' + theId + '" class="ui checkbox"><input type="checkbox"><label></label></div>'
    }

    me.checkboxTitle = '<div class="ui checkbox"><input type="checkbox"><label></label></div>';




    
})(ActionAppCore, $);



