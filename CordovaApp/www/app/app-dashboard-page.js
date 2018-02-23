/*
Author: Joseph Francis
License: MIT
*/
//---  DashboardPage module --- --- --- --- --- --- --- --- --- --- --- --- 
(function (ActionAppCore, $) {

    var SiteMod = ActionAppCore.module("site");
    var AppModule = ActionAppCore.module("app");

    var thisSiteSpecs = {
        pageName:"DashboardPage", 
        pageTitle: "Dashboard", 
        pageActionPrefix: 'dash',
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
        //--- Build the UI
        var tmpContext = {}
        ThisPage.loadRegion('center', ThisApp.renderTemplate(thisSiteSpecs.pageActionPrefix + ':page-body', tmpContext));
        ThisPage.loadRegion('south', ThisApp.renderTemplate(thisSiteSpecs.pageActionPrefix + ':page-footer', tmpContext));

        //--- Add any custom init stuff
        $('[appuse="dash:home-sidebar"] .ui.sidebar')
        .sidebar({
            context: $('[appuse="dash:home-sidebar"] .bottom.segment')
        })
        .sidebar('attach events', '[appuse="dash:home-sidebar"] .menu .item')
        ;

    }

    
    ThisPage.pageTest = function () {
        var tmpMarkup = '<hr/>Added to Out';
        ThisApp.addToFacet('dash:dashboard-out', tmpMarkup);
    }
    
})(ActionAppCore, $);
