(function(){
 
    ThisApp = null;
    var tmpHasLaunched = false;

    // if( !(navigator && navigator.app && navigator.app.overrideButton) ){
    //   //This is a normal webpage
      
    // }
    window.setTimeout( function(){
      if( !tmpHasLaunched) {
        tmpHasLaunched = true;
        setup();
      }
    },1000)
    //---- ACTUAL CODE ==    
    ActionAppCore = ActionAppCore || window.ActionAppCore;

     var app = {
        // Application Constructor
        initialize: function() {

          document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
          document.addEventListener('backbutton', this.onBackButton.bind(this), false);
          document.addEventListener('volumedownbutton', this.onVolDownButton.bind(this), false);
          document.addEventListener('volumeupbutton', this.onVolUpButton.bind(this), false);
          // document.addEventListener('menubutton', this.onMenuButton.bind(this), false);
          //navigator.app.overrideButton("menubutton", true);  // <-- Add this line
          //document.addEventListener('menubutton', this.onMenuButton.bind(this), false);

        },
        onBackButton: function(){
          //alert('onBackButton');
          if( ThisApp.sidebarGetDisplay() ){
            ThisApp.hideSidebar();
          }
          return false;
        },
        onVolUpButton: function(){
          alert('onVolUpButton');
          return false;
        },
        onVolDownButton: function(){
          alert('onVolDownButton');
          return false;
        },
        onMenuButton: function(){
          ThisApp.showSidebar();
          return false;
        },
  // deviceready Event Handler
        //
        // Bind any cordova events here. Common events are:
        // 'pause', 'resume', etc.
        onDeviceReady: function() {
            tmpHasLaunched = true;
            setup();
            this.receivedEvent('deviceready');
            navigator.app.overrideButton("menubutton", true);  // <-- Add this line
            document.addEventListener("menubutton", this.onMenuButton, false);
          },
        // Update DOM on a Received Event
        receivedEvent: function(id) {

        }
    };
    
    app.initialize();
 
    var btnTest,
    testOutput;

    //---- End general variables
    // function compileTemplates(theOptionalAttrName){
    //   var tmpAttrName = theOptionalAttrName || "data-tpl";
    //   var tmpSelector = {};
    //   //--- Init what to look for, anything with this attribute
    //   tmpSelector[tmpAttrName] = "";
    //   var tmpAllTemplates = {};
    //   //--- Get all elements with this attribute
    //   ThisApp.getByAttr$(tmpSelector).each(function(theIndex) {
    //     var tmpEl$ = $(this);
    //     var tmpKey = "" + tmpEl$.attr(tmpAttrName);
    //     //--- Add innerHTML to the templates object
    //     tmpAllTemplates[tmpKey] = this.innerHTML;
    //   });
    //   //--- Compile them all at once
    //   $.templates(tmpAllTemplates);
    // }

    var tmpAt = 0;
    function setup(){
        try {

            var siteMod = ActionAppCore.module('site');
            ThisApp = new siteMod.CoreApp();
            ThisApp.compileTemplates();
            ThisApp.compileHandlebars();
    
            /* ****************************************
            //------------ This App Config
            //-- "display" Option:  The Links on the top hide when in mobile, the display options control where the links show
            //     primary = show on top but not in sidebar, then add to sidebar for small screens only
            //     both = show on top and sidebar, then add to sidebar for small screens only
            //     primary = show on top but not in sidebar, then add to sidebar for small screens only
            //     [blank] = blank or missing value will make it show on the left only
            
            //--- can start with a configuration like this or none to use defaults
            //    Defaults: appuse="main-page-container" is the attribute to assign to the container to load into / control
    
            ThisApp.config = {
              "rem-title": "Add a title property to include a site title",
              "container": '#main-page-body'
            }
            
            */
            var appModule = ActionAppCore.module('app');
           
            var tmpPluginComponents = []; //'DataTables'
            //'LayoutPage', 'PouchPage', 'DataTablesPage', 'WorkspacesPage', 'LogsPage'
            var tmpAppCompsToInit = ['WorkspacesPage', 'LogsPage']; //, 'LogsPage'
            //var tmpAppCompsToInit = ['PuppetShow', 'LogsPage'];
            var tmpAppComponents = [ ];


            ThisApp.useModuleComponents('plugin', tmpPluginComponents)
    
            ThisApp.initModuleComponents(ThisApp, 'app', tmpAppCompsToInit)
            ThisApp.useModuleComponents('app', tmpAppComponents)
    
            ThisApp.siteLayout = null;
    
            ThisApp.refreshLayouts = function (theTargetEl) {
              ThisApp.siteLayout.resizeAll();
            }
            ThisApp.resizeLayouts = function (name, $pane, paneState) {
              try {
                var tmpH = $pane.get(0).clientHeight - $pane.get(0).offsetTop - 1;
                ThisApp.getByAttr$({ appuse: "cards", group: "app:pages", item: '' }).css("height", tmpH + "px");;
              } catch (ex) {
    
              }
            }
    
            ThisApp.siteLayout = $('body').layout({
              center__paneSelector: ".site-layout-center"
              , north__paneSelector: ".site-layout-north"
              , north__spacing_open: 0
              , north__spacing_closed: 0
              , north__resizable: false
              , spacing_open: 6 // ALL panes
              , spacing_closed: 8 // ALL panes
              , onready: ThisApp.resizeLayouts
              , center__onresize: ThisApp.resizeLayouts
            });

     
            ThisApp.init();
          

    
            ThisApp.aboutThisApp = function(){
              ThisApp.showCommonDialog({ header: "About this application", content: {data:'', template:'app:about-this-app'} });
    
            }

   
    
        } catch(ex){
             console.error("Unexpected Error " + ex);
        }

        
  }
    function runTest(){
        alert('runTest');
    }

    //--- End Bubble 
    })();

