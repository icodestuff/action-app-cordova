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

    //--- Hook into the app lifecycle as needed
    ThisPage._onFirstActivate = function() {
        ThisPage.initTemplates().then(
            function(){
                var tmpContext = {}
                ThisPage.loadRegion('center', ThisApp.renderTemplate(thisSiteSpecs.pageActionPrefix + ':page-body', tmpContext));
                ThisPage.loadRegion('south', ThisApp.renderTemplate(thisSiteSpecs.pageActionPrefix + ':page-footer', tmpContext));
            }
        );
    }

    //--- Implement this apge
    ThisPage.workspaceTest = function () {
        var tmpMarkup = '<hr/>Added to Out';
        ThisApp.addToFacet('ws:workspaces-out', tmpMarkup);
    }
    

})(ActionAppCore, $);
