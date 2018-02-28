/*
Author: Joseph Francis
License: MIT
*/
//---  DataTablesPage module --- --- --- --- --- --- --- --- --- --- --- --- 
(function (ActionAppCore, $) {

    var SiteMod = ActionAppCore.module("site");
    var AppModule = ActionAppCore.module("app");

    var thisPageSpecs = {
        pageName:"DataTablesPage", 
        pageTitle: "DataTables", 
        pageNamespace: 'dts',
        navOptions:{
            topLink:true,
            sideLink:true
        },
        //linkDisplayOption:'both',
        appModule:AppModule
    };

    thisPageSpecs.pageTemplates = {
        baseURL: 'app/pages/DataTablesPage/tpl',
        //-- Page to lookup : name to call it when pulling
        //---  Good to "namespace" your templates with the page prefix to avoid name conflicts
        templateMap:{
            "page-body.html": thisPageSpecs.pageNamespace + ":page-body",
            "page-footer.html": thisPageSpecs.pageNamespace + ":page-footer"
        }
    }

    thisPageSpecs.layoutOptions = {
        templates: {
            "center": thisPageSpecs.pageNamespace + ":" + "page-body",
            "south": thisPageSpecs.pageNamespace + ":" + "page-footer"
        },  
        facetPrefix: thisPageSpecs.pageNamespace,
        north: false,
        west: false,
        east: false
    }

    //--- Start with a ase SitePage component
    var ThisPage = new SiteMod.SitePage(thisPageSpecs);

    //--- Hook into the app lifecycle as needed    
    ThisPage.writeToOut = function(theHTML){
        ThisApp.loadFacet('dts:home-output', theHTML);
    }

    ThisPage.showOutLoading = showOutLoading;
    function showOutLoading() {
        ThisApp.loadFacet('dts:home-output', '', 'app:page-loading-spinner');
    }

    ThisPage.transformDocs = function (theDocs) {
        var tmpRet = {
            data: []
        }
        for (var aDocPos in theDocs) {
            var tmpDoc = theDocs[aDocPos];
            tmpDoc = tmpDoc.doc || tmpDoc;
            if (tmpDoc.hasOwnProperty('sys_DocType') && tmpDoc['sys_DocType'] == 'session') {
                tmpDoc._index = aDocPos;
                tmpRet.data.push(tmpDoc);
            }
        }
        return tmpRet;
    }

    ThisPage.sessionsSelected = function(theTable, theIndexes){
        var tmpKeyField = 'id';
        ThisPage.dt.runForIndexMatches(theTable,theIndexes, function(theDoc, thePos){
            var tmpID = theDoc[tmpKeyField];
            if( tmpID ){
                console.log("Selected",tmpID);
                // var tmpEls = ThisPage.getByAttr$({group:'dts:session-card', item:tmpID});
                // if( !(tmpEls) || tmpEls.length < 1){
                //     ThisApp.addToFacet('dts:session-details-out', theDoc, 'dts:session-card-fluid',true);
                // } else {
                //     console.log("already there")
                // }
                
            }
        })
        refreshSessionsOutHeader();    
    }

    ThisPage.sessionsDeselected = function(theTable, theIndexes){
        var tmpKeyField = 'id';
        ThisPage.dt.runForIndexMatches(theTable,theIndexes, function(theData, thePos){            
            var tmpID = theData[tmpKeyField];
            console.log("Deselected",tmpID);
            if( tmpID ){
                var tmpEls = ThisPage.getByAttr$({group:'dts:session-card', item:tmpID}, ThisApp.getFacet$('dts:session-details-out'))
                tmpEls.remove();
            }
        })    
        refreshSessionsOutHeader();
    }

    ThisPage.clearSessionCards = function(){
        // var tmpEls = ThisPage.getByAttr$({group:'dts:session-card'}, ThisApp.getFacet$('dts:session-details-out'))
        // tmpEls.remove();
        refreshSessionsOutHeader();
    }

    function refreshSessionsOutHeader(){
        console.log("Clear");
        // if( ThisPage.currentSessionTable == null){
        //     ThisApp.loadFacet("dts:session-details-header", 'Click "Read All Documents" to load a table')
        // } else {
        //     var tmpSelected = ThisPage.currentSessionTable.rows( { selected: true } );

        //     var tmpSelectedCount = 0;
        //     if( tmpSelected && tmpSelected.count() ){
        //         tmpSelectedCount = tmpSelected.count();
        //     }
        //     var tmpDeSelectAllBtn = ThisPage.getByAttr$({action:"dts:closeAllSessionCards"});
        //     if( tmpSelectedCount == 0){
        //         tmpDeSelectAllBtn.addClass('disabled');
        //         ThisApp.loadFacet("dts:session-details-header", 'Select an item from the list, it will show here.')
        //     } else {
        //         tmpDeSelectAllBtn.removeClass('disabled');
        //         ThisApp.loadFacet("dts:session-details-header", 'Now showing <b>' + tmpSelectedCount + ' session' + (tmpSelectedCount > 1 ? 's' : '') + '.')
        //     }
        //     //console.log("tmpSelectedCount",tmpSelectedCount,tmpSelected);
        // }
        
    }

    ThisPage.currentSessionTable = null;
    
    ThisPage.runTest = function(){
        var tmpOut = "Testing";
        ThisPage._om.getObject('[get]:app/app-data','session-data.json').then(function(theDoc){
            //ThisPage.writeToOut(JSON.stringify(theDoc));
            var tmpData = ThisPage.transformDocs(theDoc.rows);

            var tmpTableEl = ThisPage.dt.addTable('dts:home-output');
                var tmpNewTable = tmpTableEl.DataTable({
                    data: tmpData.data,
                    responsive: {
                        'details': {
                            'type': 'column',
                            'target': 0
                            }    
                    },
                    select: {
                        'style': 'multi',
                        'selector': 'td:not(.control)'
                     },
                    order: [[1, 'asc']],
                    buttons: [
                        'copy',
                        'excel',
                        'csv',
                        'pdf',
                        'print'
                    ],
                    dom: 'Bfrtip',
                    columnDefs: [ {
                        'data': null,
                        'defaultContent': '',
                        'className': 'control',
                        'orderable': false,
                        width:5,
                        'targets': 0
                      }],
                    "columns": [
                        { "title:": "", "data": null },
                        { "title": "ID", "data": "id" },
                        { "title": "Title", "data": "title" },
                        { "title": "Status", "data": "status" },
                        { "title": "Type", "data": "type" },
                        { "title": "Level", "data": "level" },
                        { "title": "Session", "data": "session" }
                    ]
                });

                $(tmpTableEl.find('.checkbox')).checkbox();
    
                tmpNewTable
                    .on('select', function (e, dt, type, indexes) {
                        ThisPage.dt.onCheckboxSelect(e, dt, type, indexes, tmpNewTable, tmpTableEl)
                        ThisPage.sessionsSelected(tmpNewTable, indexes);
                    })
                    .on('deselect', function (e, dt, type, indexes) {
                        ThisPage.dt.onCheckboxDeselect(e, dt, type, indexes, tmpNewTable, tmpTableEl)
                        ThisPage.sessionsDeselected(tmpNewTable, indexes);
                    });
    
                ThisPage.currentSessionTable = tmpNewTable;
    
    
                ThisApp.appMessage("Loaded Data","i",{show:true});
    


         })
    }
    ThisPage.runTest2 = function(){
        showOutLoading();
        return;
        ThisPage._om.getObject('dash-test-db', 'testdoc2').then(function (theDoc) {
            console.log('got ',theDoc);
            if( theDoc._error ){
                var tmpMsg = theDoc._error;
                if(typeof(tmpMsg) == 'object'){
                    tmpMsg = tmpMsg.message || tmpMsg.errorText || 'unknown error';
                }
                ThisApp.appMessage(tmpMsg, "e")
            } else {
                //ThisApp.appMessage("Got doc - " + typeof(theDoc));
                ThisApp.appMessage("Got document - JSON is - " + JSON.stringify(theDoc));
            }
        });
    }
    ThisPage.runTest3 = function(){
        ThisPage._om.getObjects('[get]:app/app-data', ['default.json','demo.json']).then(function (theDocs) {
            console.log('got from get ',theDocs);
            ThisApp.appMessage("Got document, see logs","i", {show:true});
            ThisApp.appMessage(" doc is - " + JSON.stringify(theDocs));
        });
    }
    ThisPage.runTest4 = function(){
       //ThisPage.wsZoomControl.setState('sliderValue', 75);
       ThisApp.appMessage("ThisPage.wsHome is " + JSON.stringify(ThisPage.wsHome.getAsObject()), "i", {show:false});
       var tmpWSObj = false;
       ThisPage._om.getObject('[get]:app/app-data','ws-home.json').then(function(theDoc){
        ThisPage.wsHome.loadFromObject(theDoc)
       })
    }

    ThisPage._onInit = function(theApp) {
        ThisPage._svg = theApp.getComponent("plugin:SvgControls");
        ThisPage._om = theApp.om;
        ThisPage.dt = theApp.getComponent("plugin:DataTables");        
    }

    ThisPage._onFirstActivate = function(theApp) {
        var tmpThis = this;
        ThisPage.initOnFirstLoad().then(
            function(){
                var me = ThisPage;

            }
        );

    }

   
    ThisPage.pageTest = function () {
       console.log("pageTest")
    }
    
})(ActionAppCore, $);
