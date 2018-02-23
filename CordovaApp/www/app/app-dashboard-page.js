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
    
    ThisPage._onInit = function(theApp) {
        ThisPage._svg = theApp.getComponent("plugin:SvgControls");
    }

    ThisPage._onFirstActivate = function(theApp) {
        //--- Build the UI
        var me = ThisPage;
       


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

        var tmpZoomBarEl = me.getByAttr$({ facet: "dash:zoom-control" });
        me.wsZoomControlWS = me._svg.getNewWorkpace();
        me.wsZoomControlWS.init({ svg: tmpZoomBarEl[0], viewBox: {x: 0, y: 0, w: 200, h: 20} });
        me.wsZoomControlWS.addControl('zoom-slider', 'horiz-slider', { sliderStart:0, sliderEnd: 400, sliderIncr: 10, sliderValue: 100, scale: .5 }).then(function(theControl){
            me.wsZoomControl = theControl;
            me.wsZoomControl.subscribe("valueChanged", me.zoomValueChanged.bind(me));
        });


    }

    ThisPage.zoomValueChanged = zoomValueChanged;
    function zoomValueChanged(theEvent, theNewValue, theObj){
        console.log("zoomValueChanged",theNewValue);        
    }
    
    ThisPage.pageTest = function () {
        var tmpMarkup = '<hr/>Added to Out';
        ThisApp.addToFacet('dash:dashboard-out', tmpMarkup);
    }
    
})(ActionAppCore, $);
