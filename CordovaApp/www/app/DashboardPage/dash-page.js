/*
Author: Joseph Francis
License: MIT
*/
//---  DashboardPage module --- --- --- --- --- --- --- --- --- --- --- --- 
(function (ActionAppCore, $) {

    var SiteMod = ActionAppCore.module("site");
    var AppModule = ActionAppCore.module("app");

    var thisPageSpecs = {
        pageName:"DashboardPage", 
        pageTitle: "Dashboard", 
        pageNamespace: 'dash',
        linkDisplayOption:'both',
        appModule:AppModule
    };

    thisPageSpecs.pageTemplates = {
        baseURL: 'app/DashboardPage/tpl',
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
    
    ThisPage.runTest = function(){
        var tmpObj = {"running":"a test", "more":12, "arr":["one","two"], "child": {"name":"Jane"}};
        ThisPage._om.putObject('dash-test-db', 'testdoc2', tmpObj).then(function (theDoc) {
            console.log('saved ',theDoc);
            ThisApp.showMessage("Saved doc - " + typeof(theDoc));
            ThisApp.showMessage(" doc is - " + JSON.stringify(theDoc));
        });
    }
    ThisPage.runTest2 = function(){
        ThisPage._om.getObject('dash-test-db', 'testdoc2').then(function (theDoc) {
            console.log('got ',theDoc);
            if( theDoc._error ){
                var tmpMsg = theDoc._error;
                if(typeof(tmpMsg) == 'object'){
                    tmpMsg = tmpMsg.message || tmpMsg.errorText || 'unknown error';
                }
                ThisApp.showMessage(tmpMsg, "e")
            } else {
                //ThisApp.showMessage("Got doc - " + typeof(theDoc));
                ThisApp.showMessage("Got document - JSON is - " + JSON.stringify(theDoc));
            }
        });
    }
    ThisPage.runTest3 = function(){
        ThisPage._om.getObjects('[get]:app/app-data', ['default.json','demo.json']).then(function (theDocs) {
            console.log('got from get ',theDocs);
            ThisApp.showMessage("Got doc - " + typeof(theDocs));
            ThisApp.showMessage(" doc is - " + JSON.stringify(theDocs));
        });
    }
    ThisPage.runTest4 = function(){
       //ThisPage.wsZoomControl.setState('sliderValue', 75);
       ThisApp.showMessage("ThisPage.wsHome is " + JSON.stringify(ThisPage.wsHome.getAsObject()), "i", {noshow:true});
       var tmpWSObj = false;
       ThisPage._om.getObject('[get]:app/app-data','ws-home.json').then(function(theDoc){
        ThisPage.wsHome.loadFromObject(theDoc)
       })
    }

    ThisPage._onInit = function(theApp) {
        ThisPage._svg = theApp.getComponent("plugin:SvgControls");
        ThisPage._om = theApp.om;
        
    }

    ThisPage._onFirstActivate = function(theApp) {
        var tmpThis = this;
        ThisPage.initOnFirstLoad().then(
            function(){
                var me = ThisPage;
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
                me.wsZoomControlWS.addControl('zoom-slider', 'horiz-slider', { sliderStart:0, sliderEnd: 100, sliderIncr: 10, sliderValue: 50, scale: .5 }).then(function(theControl){
                    me.wsZoomControl = theControl;
                    me.wsZoomControl.subscribe("valueChanged", me.zoomValueChanged.bind(me));
                });

                var tmpHomeWsEl = me.getByAttr$({ facet: "dash:home-ws" });
                me.wsHome = me._svg.getNewWorkpace();
                me.wsHome.init({ svg: tmpHomeWsEl[0], viewBox: {x: 0, y: 0, w: 700, h: 700} });

                me.wsHome.addControl('icon-database', 'icon-database', {scale: 1 }).then(function(theControl){
                    me.wsDatabaseIcon = theControl;
                });
                me.wsHome.addControl('icon-database2', 'icon-database', {scale: 1, translateY:120 }).then(function(theControl){
                    me.wsDatabaseIcon2 = theControl;
                });

            }
        );
        // //--- Build the UI
        // var me = ThisPage;
       


        // var tmpContext = {}
        // ThisPage.loadRegion('center', ThisApp.renderTemplate(thisPageSpecs.pageNamespace + ':page-body', tmpContext));
        // ThisPage.loadRegion('south', ThisApp.renderTemplate(thisPageSpecs.pageNamespace + ':page-footer', tmpContext));

       
       

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
