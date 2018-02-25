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

    ThisPage._onInit = function(theApp) {
        ThisPage._svg = theApp.getComponent("plugin:SvgControls");
        ThisPage._om = theApp.getComponent("plugin:ObjectManager");

         
    }

    //--- Hook into the app lifecycle as needed
    ThisPage._onFirstActivate = function() {
        ThisPage._om.getObjects('[html]:app-tpl/app-workspaces-page', ['page-body.html','page-footer.html']).then(function (theDocs) {
            for( var aKey in theDocs ){
                var tmpTN = aKey.replace('.html','');
                tmpTN = thisSiteSpecs.pageActionPrefix + ':' + tmpTN;
                ThisApp.tplHandlebars[tmpTN] = Handlebars.compile(theDocs[aKey]); 
			}
            var tmpContext = {}
            ThisPage.loadRegion('center', ThisApp.renderTemplate(thisSiteSpecs.pageActionPrefix + ':page-body', tmpContext));
            ThisPage.loadRegion('south', ThisApp.renderTemplate(thisSiteSpecs.pageActionPrefix + ':page-footer', tmpContext));
        });
    }

    //--- Implement this apge
    ThisPage.workspaceTest = function () {
        var tmpMarkup = '<hr/>Added to Out';
        ThisApp.addToFacet('ws:workspaces-out', tmpMarkup);
    }
    

})(ActionAppCore, $);
