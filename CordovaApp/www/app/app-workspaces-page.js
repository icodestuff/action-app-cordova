/*
Author: Joseph Francis
License: MIT
*/
//---  WorkspacesPage module --- --- --- --- --- --- --- --- --- --- --- --- 
(function (ActionAppCore, $) {

    var SiteMod = ActionAppCore.module("site");
    var AppModule = ActionAppCore.module("app");
//                ThisPage.loadRegion('center', ThisApp.renderTemplate(thisPageSpecs.pageNamespace + ':page-body', tmpContext));

    var thisPageSpecs = {
        pageName:"WorkspacesPage", 
        pageTitle: "Workspaces", 
        pageNamespace: 'ws',
        linkDisplayOption:'both',
        appModule:AppModule
    };
    
    thisPageSpecs.pageTemplates = {
        baseURL: 'app-tpl/WorkspacesPage/',
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
    ThisPage.pageSpecs = thisPageSpecs;

    ThisPage._onInit = function(theApp) {
        ThisPage._svg = theApp.getComponent("plugin:SvgControls");
        ThisPage._om = theApp.om;
    }

    // ThisPage.initLayoutTemplates = function(){
    //     var tmpLOs = thisPageSpecs.layoutTemplates;
    //     var tmpContext = {}
    //     for( var aName in tmpLOs ){
    //         var tmpLO = tmpLOs[aName];
    //         ThisPage.loadRegion(aName, ThisApp.renderTemplate(thisPageSpecs.pageNamespace + ':' + tmpLO.tpl, tmpContext));
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
