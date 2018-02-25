/*
Author: Joseph Francis
License: MIT
*/
//---  WorkspacesPage module --- --- --- --- --- --- --- --- --- --- --- --- 
(function (ActionAppCore, $) {

    var SiteMod = ActionAppCore.module("site");
    var AppModule = ActionAppCore.module("app");
//                ThisPage.loadRegion('center', ThisApp.renderTemplate(thisSiteSpecs.pageActionPrefix + ':page-body', tmpContext));

    var thisSiteSpecs = {
        pageName:"WorkspacesPage", 
        pageTitle: "Workspaces", 
        pageActionPrefix: 'ws',
        layoutTemplates: {
            "center":{
                tpl:'page-body'
            },
            "south":{
                tpl:'page-footer'
            }
        },
        pageTemplates: ['page-body.html','page-footer.html'],
        linkDisplayOption:'both',
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
    ThisPage.pageSpecs = thisSiteSpecs;

    ThisPage._onInit = function(theApp) {
        ThisPage._svg = theApp.getComponent("plugin:SvgControls");
        ThisPage._om = theApp.om;
    }

    // ThisPage.initLayoutTemplates = function(){
    //     var tmpLOs = thisSiteSpecs.layoutTemplates;
    //     var tmpContext = {}
    //     for( var aName in tmpLOs ){
    //         var tmpLO = tmpLOs[aName];
    //         ThisPage.loadRegion(aName, ThisApp.renderTemplate(thisSiteSpecs.pageActionPrefix + ':' + tmpLO.tpl, tmpContext));
    //     }
    // }
    //--- Hook into the app lifecycle as needed
    ThisPage._onFirstActivate = function() {
        ThisPage.initOnFirstLoad()
       
    }

    //--- Implement this apge
    ThisPage.workspaceTest = function () {
        var tmpMarkup = '<hr/>Added to Out';
        ThisApp.addToFacet('ws:workspaces-out', tmpMarkup);
    }
    

})(ActionAppCore, $);
