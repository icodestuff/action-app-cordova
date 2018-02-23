/*
Author: Joseph Francis
License: MIT
*/
//---  WorkspacesPage module --- --- --- --- --- --- --- --- --- --- --- --- 
(function (ActionAppCore, $) {

    var SiteMod = ActionAppCore.module("site");
    var AppModule = ActionAppCore.module("app");

    var thisSiteSpecs = {
        pageName:"WorkspacesPage", 
        pageTitle: "Workspaces", 
        pageActionPrefix: 'ws',
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

    //--- Hook into the app lifecycle as needed
    ThisPage._onFirstActivate = function() {
        var tmpContext = {}
        ThisPage.loadRegion('center', tmpContext, thisSiteSpecs.pageActionPrefix + ':page-body');
        ThisPage.loadRegion('south', tmpContext, thisSiteSpecs.pageActionPrefix + ':page-footer');
//        ThisPage.loadRegion('center', ThisApp.renderTemplate(thisSiteSpecs.pageActionPrefix + ':page-body', tmpContext));
//        ThisPage.loadRegion('south', ThisApp.renderTemplate(thisSiteSpecs.pageActionPrefix + ':page-footer', tmpContext));
    }

    //--- Implement this apge
    ThisPage.workspaceTest = function () {
        var tmpMarkup = '<hr/>Added to Out';
        ThisApp.addToFacet('ws:workspaces-out', tmpMarkup);
    }
    

})(ActionAppCore, $);
