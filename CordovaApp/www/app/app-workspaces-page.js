/*
Author: Joseph Francis
License: MIT
*/
//---  DataTablesPage module --- --- --- --- --- --- --- --- --- --- --- --- 
(function (ActionAppCore, $) {

    var SiteMod = ActionAppCore.module("site");
    var AppModule = ActionAppCore.module("app");

    var thisSiteSpecs = {
        pageName:"WorkspacesPage", 
        pageTitle: "Workspaces", 
        pageActionPrefix: 'ws',
        linkDisplayOption:'both',
        //pageTemplate:'app-pages-ws',
        appModule:AppModule
    };

    thisSiteSpecs.layoutOptions = {
        facetPrefix: thisSiteSpecs.pageActionPrefix,
        north: false,
        west: false,
        east: false
      
    }



    //--- Start with a ase SitePage component
    var ThisPage = new SiteMod.SitePage(thisSiteSpecs);

    

    //$.templates(tmpModuleTemplates);

    
    ThisPage._onFirstLoad = function() {
        var tmpModuleTemplates = {};
        //tmpModuleTemplates[thisSiteSpecs.pageActionPrefix +":page-header"] = '<div class="ui menu" style="padding-bottom:0;margin-bottom:0"> <a appuse="tablinks" group="ws:tabs" item="home" action="showSubPage" class="active item">Dashboard</a> <a appuse="tablinks" group="ws:tabs" item="all" action="showSubPage" class="item">Workspaces</a> <a appuse="tablinks" group="ws:tabs" item="more" action="showSubPage" class="item">More</a>';
        tmpModuleTemplates[thisSiteSpecs.pageActionPrefix +":page-footer"] = '<h1>Workspaces Footer</h1>';
        var tmpAllBody = '';
        tmpAllBody += '<div appuse="cards" group="ws:tabs" item="home"> <div class="ui" style="padding-top:5px;margin-top:0px;min-height:300px;"> <div class="requests-outline"> <svg facet="ws:home-svg" viewBox="0 0 800 800" style="padding:0;margin:0;min-height:400px;background-color:black"> </div> <div class="requests-details"> <div class="ui menu flow middle" style=""> <div class=""> <div action="ws:runTest1" class="ui primary basic icon button"><i class="icon home"></i></div> </div> <div class="item"> <div action="ws:addBox" class="ui purple basic button">Add Box</div> </div> </div> <div facet="ws:home-out"></div> </div> </div> </div> <div appuse="cards" group="ws:tabs" item="all" class="hidden"> <div>Workspace: <b><span facet="ws:currentWorkspace">';
        tmpAllBody += '';
        tmpAllBody += '</span></b></div> <div class="ui menu flow middle" style=""> <div class="item"> <div action="ws:gotoMainWorkspace" class="ui primary basic icon button"><i class="icon home"></i></div> </div> <div class="item"> <div action="ws:workspaceTest" class="ui purple basic button">Workspace Testing</div> </div> </div> <div facet="ws:workspaces-out"></div> </div> <div appuse="cards" group="ws:tabs" item="more" class="hidden"> <div class="ui segment"> <p>Testing some values here</p> <div class="ui active"> <div class="ui loader"></div> </div> </div> </div> </div>';
        tmpModuleTemplates[thisSiteSpecs.pageActionPrefix +":page-body"] = tmpAllBody;
        tmpModuleTemplates["svg-test-1"] = 'NO SVG';
        ThisPage.templates = tmpModuleTemplates;
        //-- were sep
        var tmpTPLS = ThisPage.templates;
        //ThisPage.loadRegion('north', tmpTPLS[thisSiteSpecs.pageActionPrefix + ':page-header']);
        var tmpContext = {}

        ThisPage.loadRegion('south', tmpTPLS[thisSiteSpecs.pageActionPrefix + ':page-footer']);
        // ThisPage.loadRegion('center', tmpTPLS[thisSiteSpecs.pageActionPrefix + ':page-body']);
        ThisPage.loadRegion('center', ThisApp.renderTemplate(thisSiteSpecs.pageActionPrefix + ':page-body', tmpContext));

        $('.context.example .ui.sidebar')
        .sidebar({
            context: $('.context.example .bottom.segment')
        })
        .sidebar('attach events', '.context.example .menu .item')
        ;

    }

    //---- ---- ---- ---- ---- ---- ---- ---- ---- ---- 
    ThisPage.currentWorkspace = 'default';

    ThisPage.boxCount = 0;

    ThisPage.addBox = function () {
       alert('add box');

    }
    ThisPage.addBox1 = function () {
       alert('not implemented')
    }

    ThisPage.workspaceTest = function () {
        var tmpMarkup = '<hr/>Added to Out';
        ThisApp.addToFacet('ws:workspaces-out', tmpMarkup);
    }
    ThisPage.runTest1 = function () {
        var tmpContentHTML = 'Hello <b>World</b>';


        var pouchOpts = {
            skipSetup: true
        };
        // var db = new PouchDB('dbname');

        // db.put({
        //     _id: 'attach1',
        //     _attachments: {
        //         'myattachment.html': {
        //             content_type: 'text/html',
        //             data: btoa(tmpContentHTML)
        //         }
        //     }
        // });

        var remoteDB = new PouchDB('http://localhost:5984/' + ThisPage.currentSessionDB, pouchOpts);
        remoteDB.put({
            _id: 'attach3',
            _attachments: {
                'myattachment.html': {
                    content_type: 'text/html',
                    data: btoa(ThisPage.contentHTML)
                }
            }
        });
        console.log("Did it")
        // remoteDB.login(ThisPage.LocalCouchUser, ThisPage.LocalCouchPassword).then(function (user) {


        // }).on('error', function (err) {
        //     console.error("error in replication", err);

        // });
        // return remoteDB.logout();



    }

    ThisPage.pullSessionsFromLocal = pullSessionsFromLocal;
    function pullSessionsFromLocal() {
        showOutLoading();
        var db = new PouchDB(ThisPage.currentSessionDB);

        var pouchOpts = {
            skipSetup: true
        };

        var remoteDB = new PouchDB('http://localhost:5984/' + ThisPage.currentSessionDB, pouchOpts);

        db.replicate.from(remoteDB).on('complete', function () {
            console.log("Pulled down session from CouchDB");
            ThisApp.loadFacet('ws:home-out', "Replication Pull From DB Complete");
        }).on('error', function (err) {
            console.error("error in replication", err);
            ThisApp.loadFacet('ws:home-out', "Replication Error, see console");
        });
    }



 //--- Templates ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 
    //--- ========  ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 
    //--- ========  ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 

    // var tmpModuleTemplates = {};
    // tmpModuleTemplates[thisSiteSpecs.pageActionPrefix +":page-header"] = '<div class="ui menu" style="padding-bottom:0;margin-bottom:0"> <a appuse="tablinks" group="ws:tabs" item="home" action="showSubPage" class="active item">Dashboard</a> <a appuse="tablinks" group="ws:tabs" item="all" action="showSubPage" class="item">Workspaces</a> <a appuse="tablinks" group="ws:tabs" item="more" action="showSubPage" class="item">More</a>';
    // tmpModuleTemplates[thisSiteSpecs.pageActionPrefix +":page-footer"] = '<h1>Workspaces Footer</h1>';
    // var tmpAllBody = '';
    // tmpAllBody += '<div appuse="cards" group="ws:tabs" item="home"> <div class="ui" style="padding-top:5px;margin-top:0px;min-height:300px;"> <div class="requests-outline"> <svg facet="ws:home-svg" viewBox="0 0 800 800" style="padding:0;margin:0;min-height:400px;background-color:black"> </div> <div class="requests-details"> <div class="ui menu flow middle" style=""> <div class=""> <div action="ws:runTest1" class="ui primary basic icon button"><i class="icon home"></i></div> </div> <div class="item"> <div action="ws:addBox" class="ui purple basic button">Add Box</div> </div> </div> <div facet="ws:home-out"></div> </div> </div> </div> <div appuse="cards" group="ws:tabs" item="all" class="hidden"> <div>Workspace: <b><span facet="ws:currentWorkspace">';
    // tmpAllBody += ThisPage.currentWorkspace;
    // tmpAllBody += '</span></b></div> <div class="ui menu flow middle" style=""> <div class="item"> <div action="ws:gotoMainWorkspace" class="ui primary basic icon button"><i class="icon home"></i></div> </div> <div class="item"> <div action="ws:workspaceTest" class="ui purple basic button">Workspace Testing</div> </div> </div> <div facet="ws:workspaces-out"></div> </div> <div appuse="cards" group="ws:tabs" item="more" class="hidden"> <div class="ui segment"> <p>Testing some values here</p> <div class="ui active"> <div class="ui loader"></div> </div> </div> </div> </div>';
    // tmpModuleTemplates[thisSiteSpecs.pageActionPrefix +":page-body"] = tmpAllBody;
    // tmpModuleTemplates["svg-test-1"] = 'NO SVG';
    // $.templates(tmpModuleTemplates);



})(ActionAppCore, $);
