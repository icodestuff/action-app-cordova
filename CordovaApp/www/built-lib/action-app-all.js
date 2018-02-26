/*
ActionAppCore Core Library
Author: Joseph Francis, 2017
License: MIT
*/

/**  
 *   About ActionAppCore
 *   

What is an Action?
 - An action is a registered function with a name that sends to calling object
   - the calling object contains the params needed for the function

 - Once an action is registered, there are lots of ways to call it.

   The primary way to call an action is to add an attribute to any element with the name "action" 
    ... such as ... <div action="doSomethingCool">Do it!</div>, when clicked, something cool will happen.
  
    How? You create a function called doSomethingCool and do cool stuf there..

    Example:
    ==================
    In the HTML you have ... 
    <button action="doSomethingCool" group="coolStuff" item="fred">Show Fred</button>

    In your page, you add this ...
    ThisPage.doSomethingCool = function (theAction, theTarget) {
        var tmpParams = ThisApp.getAttrs(theTarget, ['group', 'item']);
        //--- returns {group:"coolStuff", item:"fred"}
        ThisPage.doSomethingElseWithThisAsParams(tmpParams);    
    }

    Done.


Key features: 
  - Action based, which means "actions" are at the core of most "actions"
  - Simple, all the source code for the base system is a single, small file (this one).
  - Modular, so that all components are in their own function bubble yet can still communicate with each other easily
  - Repeatable, programming by exception, just start with a working, responsive application frame and go
  - Template based, making it easy to create dynamic content, but templating is not required
  - Comes with tons of libraries to make getting started easy

Key concepts / features the application framework provides:
  - Common / responsive navigational components such as primary pages and sub-tabs
    * Navigation areas can be included in the top menu and/or the sidebar
  - Common way to add a special "appaction" attribute to any element and have it trigger a common or custom function
    * So there is no need to have onclick events or other bindings
  - Application Actions use attributes on the target element to look for related parameters, such as the ID of the selected item
    * So there is no need to specify a bunch of parameters in function calls
  - Custom application modules and plugins use the concept of namespaces to assure uniqueness
  - Common subscribe / public service available
  - Common component repository allows for components and modules to register and hence be retrieved and communcated with directly
  - Common messages methodology with toaster option to pop them up and ways to clear / retrieve them easily
  - Common way to find and update DOM elements using attributes, used extensively for it's simplicity and power
  - Common concept of a "facet", which simply any element with a facet="area:item", allowing for simple content targeting
  - Plugin modules provide extended common and custom functionatlity that can be used across other modules
*/

//--- Global Entry Point
var ActionAppCore = {};

//--- Base module and simple module system --- --- --- --- --- --- --- --- --- --- --- --- 
(function (ActionAppCore, $) {
    var modules = {};

    //--- Create module
    ActionAppCore.createModule = function (theModName, theOptionalModuleContent) {
        if (modules.hasOwnProperty(theModName)) {
            throw { error: "Module already exists", module: theModName }
        }
        modules[theModName] = theOptionalModuleContent || {};
        return modules[theModName];
    };
    //--- get / use module
    ActionAppCore.module = function (theModName) {
        if (!modules.hasOwnProperty(theModName)) {
            throw { error: "Module does not exists", module: theModName }
        }
        return modules[theModName];
    }

})(ActionAppCore, $);


//--- Common Modules --- --- --- --- --- --- --- --- --- --- --- --- 
(function (ActionAppCore, $) {
    ActionAppCore.createModule("site");
    ActionAppCore.createModule("plugin");
    ActionAppCore.createModule("extension");
})(ActionAppCore, $);

//--- Common Functionality Extensions

/**
     * subscribe / unsubscribe / publish
    *     - Standard Pub / Sub functionality
    * 
    * 
    * @return void
    * 
    */




//--- PubSub Functionality
(function (ActionAppCore, $) {

    var ExtendMod = ActionAppCore.module("extension");

    //--- Base class for application pages
    function ThisExtention() {

    }
    var me = ThisExtention;

    me.subscribe = function () {
        this.events.on.apply(this.events, arguments);
    };

    me.unsubscribe = function () {
        this.events.off.apply(this.events, arguments);
    };

    me.publish = function () {
        this.events.trigger.apply(this.events, arguments);
    };

    me.initPubSub = function () {
        this.events = $({});
    };

    //--- return the prototype to be marged with prototype of target object
    ExtendMod.PubSub = me;

})(ActionAppCore, $);



/**
  * setDisplay
  *    - sets the attribute to hidden or not hidden
  * 
  * To Use: <any variable>.setDisplay(anyEl,anyBooleanValue);
  *
  * @param  {Object} theEl   [target object with details about the page to open]
  * @param  {Boolean} theIsVis   [true to show, false to hide]
  * @return void
  */
(function (ActionAppCore, $) {

    var ExtendMod = ActionAppCore.module("extension");

    //--- Base class for application pages
    function ThisExtention() {

    }
    var me = ThisExtention.prototype;

    me.setDisplay = function (theEl, theIsVis) {
        var tmpEl = null;
        if (!theEl) {
            console.error("Can not set diplay for element, none provided");
            return;
        }
        if (theEl.node) {
            tmpEl = $(theEl.node());
        } else {
            tmpEl = $(theEl);
        }
        if (theIsVis) {
            tmpEl.removeClass('hidden');
        } else {
            tmpEl.addClass('hidden');
        }
    }
    me.show = function (theEl) {
        me.setDisplay(theEl, true);
    }
    me.hide = function (theEl) {
        me.setDisplay(theEl, false);
    }

    ExtendMod.SetDisplay = me;

})(ActionAppCore, $);


//--- CoreApp Standard App Component ---- ---- ---- ---- ---- ---- ---- 
(function (ActionAppCore, $) {

    var SiteMod = ActionAppCore.module("site");
    SiteMod.CoreApp = CoreApp;

    var ExtendMod = ActionAppCore.module("extension");

    //--- Note: Everything references me not this as this is a singleton with no instances
    var me = CoreApp.prototype;

    //--- Singleton for currently running application
    function CoreApp(theOptions) {

        //--- set currently loaded application as globally available object from global entrypoint
        ActionAppCore.app = me;

        me.isDom = function(element) {
            return element instanceof Element;  
        }

        me.options = theOptions || {};
        me.actions = me.options.actions || {};
        me.actionsDelegates = me.options.actionsDelegates || {};

        var defaults = {};
        me.events = $({});
        me.$window = $(window);
        me.$document = $(document);


        me.pagesGroup = "app:pages";

        me.messages = [];
        me.messagesAt = 0;
        me.navConfig = {};

        me.getNavConfig = function (theName) {
            return me.navConfig[theName];
        }


        me.registerNavLink = function (theNavObject) {
            if (!(theNavObject)) { return false };
            var tmpName = theNavObject.name || '';
            me.navConfig[tmpName] = theNavObject;
            me.config.navlinks.push(theNavObject)
            return true;
        }

        me.getMessages = function () {
            return me.messages;
        }
        me.getMessageCount = function () {
            return me.messagesAt;
        }
        me.clearMessages = function () {
            me.messages = [];
            me.messagesAt = 0;
        }

        /**
         * showMessage
        *  - Shows a message and saves in messages array, optionall with related saved data
        * 
        * Example: 

        * ThisApp.showMessage("Just some info");
        * ThisApp.showMessage("Successful message here.", true, "It was updated", { what: "nothing" });
        * ThisApp.showMessage("Warning, Warning, Warning!", "w", "This is just a warning", { reason: "testing" });
        * ThisApp.showMessage("There was an error, in case you want to take action.", false, false, { reason: "testing" });

        * 
        * @param  {String} theMsg   [The name of the facet to load]
        * @param  {String} theOptionalType   [info, warning, error, success] Default: info
        *  "info" or <blank> 
        *  "warning" or "w"
        *  "error" or "e" or false
        *  "success" or "s" or true
        * @param  {String} theOptionalTitle   [The title, no title if excluded]
        * @param  {String} theOptionalData   [The optional data to be stored with the message log]
        * @return void
        * 
        */
        me.showMessage = function (theMsg, theOptionalType, theOptionalTitle, theOptionalData) {
            var tmpType = "info";
            if (typeof (theOptionalType) == 'string') {
                theOptionalType = theOptionalType.toLowerCase();
                if (theOptionalType == "warning" || theOptionalType == "error" || theOptionalType == "success") {
                    tmpType = theOptionalType;
                } else if (theOptionalType == "w") {
                    tmpType = "warning";
                } else if (theOptionalType == "e") {
                    tmpType = "error";
                } else if (theOptionalType == "s") {
                    tmpType = "success";
                }
            } else if (typeof (theOptionalType) == 'boolean') {
                if (theOptionalType == true) {
                    tmpType = "success";
                } else if (theOptionalType == false) {
                    tmpType = "error";
                }
            }
            var tmpMsgPos = (me.messagesAt++);
            var tmpData = false;
            if (theOptionalData) {
                tmpData = theOptionalData
            }
            var tmpMsgObj = {
                text: theMsg,
                type: tmpType,
                title: theOptionalTitle || '',
                pos: tmpMsgPos,
                data: theOptionalData
            }

            me.messages.push(tmpMsgObj)

            if (typeof (theOptionalTitle) == 'string') {
                toastr[tmpType](theMsg, theOptionalTitle);
            } else {
                toastr[tmpType](theMsg);
            }
            me.publish("message:sent", tmpMsgObj);
        }

        /**
          * subscribe / unsubscribe / publish
          *     - Standard Pub / Sub functionality
         * 
         * 
         * @return void
         * 
         */
        me.subscribe = function () {
            ThisApp.events.on.apply(ThisApp.events, arguments);
        };

        me.unsubscribe = function () {
            ThisApp.events.off.apply(ThisApp.events, arguments);
        };

        me.publish = function () {
            ThisApp.events.trigger.apply(ThisApp.events, arguments);
        };

    }


    $.extend(me, ExtendMod.SetDisplay);

    me.initTemplates = function(theTemplateSpecs){
        var dfd = jQuery.Deferred();
        

        //--- if no templates to process, no prob, return now
        if( !(theTemplateSpecs && theTemplateSpecs.templateMap)){
            dfd.resolve(true);
            return dfd.promise();
        }

        var tmpTpls = [];        
        for( var aName in theTemplateSpecs.templateMap){
            tmpTpls.push(aName);
        }
        var tmpBaseURL = theTemplateSpecs.baseURL || 'app/app-tpl/';

        //--- This is needed because this changes inside the promise due to 
        //    not .bind(this) in the function, the temp reference is quicker, same result
        var tmpThis = this;
        ThisApp.om.getObjects('[html]:' + tmpBaseURL, tmpTpls).then(function (theDocs) {
            for( var aKey in theDocs ){
                var tmpTplName = theTemplateSpecs.templateMap[aKey];
                if( tmpTplName ){
                    console.log("tmpTplName",tmpTplName)
                    ThisApp.addTemplate(tmpTplName, theDocs[aKey]); 
                }
            }
            dfd.resolve(true);
        });
        return dfd.promise();

    }

    me.components = {};

    /**
       * loadFacet
       *  - Load HTML content or renders a jsRender template into a known facet name
       * 
       * Example: ThisApp.loadFacet('myarea:out', '', 'tpl-some-registered-template');
       *   - This loads the facet <div facet="myarea:out" ... with a rendered template 'tpl-some-registered-template'
       *
       * 
       * Note:  theContent is usually HTML if no template name passed
       *        theContent can be blank, a string value or an objet to be passed into the template for rendering
       *        if there is a string value for theOptionalTemplateName, 
       *         ... theOptionalTemplateName is used to render the content and theContent passed as the input
       * 
       * 
       * @param  {String} theName   [The name of the facet to load]
       * @param  {String} theContent   [The content to load or object to use when rendering the template]
       * @param  {String} theOptionalTemplateName   [The content to load or object to use when rendering the template]
       * @param  {String} theOptionalParent$   [The jQuery element to use instead of global]
       * 
       * @return void
       * 
       * 
       */
    me.loadFacet = function (theName, theContent, theOptionalTemplateName, theOptionalParent$) {
        var tmpSelector = '[facet="' + theName + '"]';
        var tmpContent = theContent || '';
        if (theOptionalTemplateName) {
            tmpContent = me.getTemplatedContent(theOptionalTemplateName,tmpContent);
        }
        var tmpParent = (theOptionalParent$ && (theOptionalParent$.find)=='function') ? theOptionalParent$.find : $;
        var tmpFacet = tmpParent(tmpSelector);
        tmpFacet.html(tmpContent);
        return tmpFacet;
    }

    /**
       * addToFacet
       *  - Appends or Prepends to existing facet content
       * 
       * Example: See loadFacet for more details
       * 
       * 
       * @param  {String} theName   [The name of the facet to append/prepend to]
       * @param  {String} theContent   [The content to load or object to use when rendering the template]
       * @param  {String} theOptionalTemplateName   [The content to load or object to use when rendering the template]
       * @param  {String} thePrepend   [true to prepend, blank or false to append (default)]
       * @return void
       * 
       * 
       */
    me.addToFacet = function (theName, theContent, theOptionalTemplateName, thePrepend) {
        var tmpSelector = '[facet="' + theName + '"]';
        var tmpContent = theContent || '';
        if (theOptionalTemplateName && theOptionalTemplateName != '' && theOptionalTemplateName != null) {
            tmpContent = me.getTemplatedContent(theOptionalTemplateName,tmpContent);
        }
        var tmpFacet = $(tmpSelector);
        if (thePrepend === true) {
            tmpFacet.prepend(tmpContent);
        } else {
            tmpFacet.append(tmpContent);
        }
        return tmpFacet;
    }

    /**
   * getFacet$
   *  - Returns jQuery element for the facet name provided
   *  - Optionally pass a parent element as the scope to look in
   * 
   * Example: 
   *   var tmpEl = ThisApp.getFacet('main:out')
   *   var tmpEl = ThisApp.getFacet('main:out',parentEl)
   * 
   * @param  {String} theName   [The name of the facet to append/prepend to]
   * @param  {jQuery Element} theOptionalParent   [The parent to find in, uses global search if not provided]
   * @return {jQuery Element} [The facet element]
   * 
   */
    me.getFacet$ = function (theName, theOptionalParent) {
        var tmpSelector = '[facet="' + theName + '"]';
        var tmpParent = false;
        if (theOptionalParent && theOptionalParent != null) {
            tmpParent = theOptionalParent;
            if (!tmpParent.attr) {
                tmpParent = $(tmpParent);
            }
        }
        if (tmpParent) {
            return tmpParent.find(tmpSelector);
        } else {
            return $(tmpSelector);
        }
    }


    /**
       * gotoPage
       * Goes to a page on the site
       *
       * @param  {String} thePageName   [The unique page name to open]
       * @return this
       */
    me.gotoPage = function (thePageName) {
        me.gotoTab({ group: 'app:pages', item: thePageName, animation: 'fade in', duration: 100 });
        var tmpActionObj = ThisApp.getNavConfig(thePageName);
        if (tmpActionObj && typeof (tmpActionObj.onActivate) == 'function') {
            tmpActionObj.onActivate();
        }
        me.hideSidebar();

        ThisApp.refreshLayouts();
        return me;
    }


    /**
     * Show / hide the sidebar
     *
     * @param  {Boolean} theIsVis   [true to show, false to hide]
     * @return this
     */


    me.sidebarSetDisplay = function (theIsVis) {
        $('[appuse="side-menu"]').sidebar((theIsVis !== false) ? 'show' : 'hide');
        return me;
    }
    me.hideSidebar = function () {
        return me.sidebarSetDisplay(false);
    }
    me.showSidebar = function () {
        return me.sidebarSetDisplay(true);
    }



    /**
     * gotoTab
     * 
     * To Use:  
     * 
     *  Go to a top level page
     *      ThisApp.gotoTab({page:'mainpage'})
     *  Go to a sub tab (assuming on current main page)
     *      ThisApp.gotoTab({group:'some:group', item:'some:item"})
     *  Go to a top level page and a sub tab on that page
     *      ThisApp.gotoTab({page:'mainpage', group:'some:group', item:'some:item"})
     *
     * Options:
     *  - group = Name of the group, usually namespaced like main:tabs
     *  - item = Name of the item to show within the group, like 'main'
     *  - page = Optional primary page to open in case on a different page
     * 
     * Example: 
     *          var tmpInitialSpot = {
     *            page:'logs',
     *            group:'logs:tabs',
     *            item: 'jobs'
     *          };
     *          ThisApp.gotoTab(tmpInitialSpot);
     *
     *
     * @param  {Object} theOptions   [object with details that control what tab and/or page to open]
     * @return this
     */
    me.gotoTab = function (theOptions) {
        var tmpOptions = theOptions || {};
        var tmpHadPage = false;
        if (tmpOptions.hasOwnProperty('page')) {
            me.gotoPage(tmpOptions.page);
            tmpHadPage = true;
        }
        if ((tmpOptions.group && tmpOptions.item)) {
            me.gotoTabLink(tmpOptions);
            me.gotoCard(tmpOptions);
        } else {
            if (!tmpHadPage) {
                console.error("Can not go to tab, group and item are required.")
            }
        }
        return me;
    }

    /**
     * gotoCard
     *   - Hides all the related cards and show the card within a card group
     * 
     * Options:
     *  - group = Name of the group, usually namespaced like main:tabs
     *  - item = Name of the card to show within the group, like 'main'
     *  - parent = Optional parent jQuery element to look inside
     *  
     * To Use:  
     * 
     *  Show the specific card in the group, assuming to look at the entire page 
     *      ThisApp.gotoCard({group:'some:group', item:'some:item'})
     *  Show the specific card in the group, within the parent element passed
     *      ThisApp.gotoCard({group:'some:group', item:'some:item', parent: someEl})
     *
     * @param  {Object} theOptions   [object with details that control what tab and/or page to open]
     * @return this
     */

    me.gotoCard = function (theOptions) {
        var tmpOptions = theOptions || {};
        var tmpGroupName = tmpOptions.group || '';
        var tmpItemId = tmpOptions.item || '';
        var tmpParent = theOptions.parent || undefined;
        var tmpAnimation = tmpOptions.animation || 'fade';
        var tmpAnimDuration = tmpOptions.duration || 250;
        var tmpSelector = {
            appuse: 'cards',
            group: tmpGroupName
        }
        me.getByAttr$(tmpSelector, tmpParent).addClass('hidden').transition('hide', 1);
        tmpSelector.item = tmpItemId;
        me.getByAttr$(tmpSelector, tmpParent).removeClass('hidden').transition(tmpAnimation + ' in', tmpAnimDuration);
        if (ThisApp.refreshLayouts) {
            ThisApp.refreshLayouts();
        }
        return me;
    }


    /**
     * gotoTabLink
     *   - Hides all the related cards and show the card within a card group
     * 
     * Options:
     *  - group = Name of the group, usually namespaced like main:tabs
     *  - item = Name of the card to show within the group, like 'main'
     *  - parent = Optional parent jQuery element to look inside
     *  
     * To Use:  
     * 
     *  Show the specific card in the group, assuming to look at the entire page 
     *      ThisApp.gotoCard({group:'some:group', item:'some:item'})
     *  Show the specific card in the group, within the parent element passed
     *      ThisApp.gotoCard({group:'some:group', item:'some:item', parent: someEl})
     *
     *
     * @param  {Object} theOptions   [object with details about the page / tab to open]
     * @return void
     */
    me.gotoTabLink = function (theOptions) {
        var tmpOptions = theOptions || {};
        var tmpGroupName = tmpOptions.group || '';
        var tmpItemId = tmpOptions.item || '';
        var tmpParent = theOptions.parent || undefined;
        var tmpAnimation = tmpOptions.tabAnimation || 'fade';
        var tmpAnimDuration = tmpOptions.duration || 1000;

        //--- Create a list of attributes to look for
        //  * appuse is tablink and the group is this group
        var tmpSelector = {
            appuse: 'tablinks',
            group: tmpGroupName
        }
        //--- Remove the 'active' class from all matching items for this group that are tablinks
        //--- Note: The getByAttr$ returns the elements, jQuery's removeClass 
        //          returns the elements being effected for chaining
        var tmpAll = me.getByAttr$(tmpSelector)
            .removeClass('active');

        //--- Add the item selector to update the search to find just the one that is active
        tmpSelector.item = tmpItemId;
        //--- Add the 'active' class to the one item we have
        //--- Note: This calls me.getByAttr$ not ThisApp.getByAttr$, which by default only searches this tab page content
        //--  Note: The reason tmpAll is passed is to keep the scope down to the active ones, since we 
        //          have a handle to those already, that is optional, if not passed, just this page is passed
        me.getByAttr$(tmpSelector, tmpAll).addClass('active');
    }


    //--- Public ================ ================= ===================== ================


    /**
     * getAttrs
     *    - returns an object with the attribute values matching the array of names passed
     * 
     * To Use: var tmpAttribs = ThisApp.getAttrs(anyEl,['item','group']);
     *    - returns an object with {item:"val",group:"val"}
     *
     * @param  {String} theAction   [name of the action (showSubPage)]
     * @param  {Object} theTargetObj   [target object with details about the page to open]
     * @return {Object} [node name = attribute, node value = attribute value]
     */
    me.getAttrs = function (theEl, theAttrList) {
        var tmpRet = {};
        if (!theEl) {
            return tmpRet;
        }
        var tmpAttrList = theAttrList || {};
        if (typeof (tmpAttrList) == 'string') {
            tmpAttrList = [tmpAttrList];
        }
        var tmpEl = $(theEl);
        for (aAttrPos in tmpAttrList) {
            var tmpAName = tmpAttrList[aAttrPos];
            if (tmpAName) {
                tmpRet[tmpAName] = tmpEl.attr(tmpAName);
            }
        }
        return tmpRet;
    }

    /**
     * getByAttr$
     *    - returns a jQuery element collection (which may be one) that matches the attributes passed
     *    - the same as using [ATTRIBUTENAME="SOMEVALUE"][ATTRIBUTENAME2="SOMEVALUE2"]
     * 
     * To Use: var tmpEls = ThisApp.getByAttr$({ group: "THEGROUPNAME", "item": "THEITEMNAME" })
     *    - returns jQuery elements, use as usual  -  i.e. tmpEls.html(tmpContentHTML); or tmpEls.removeClass('active');
     * 
     * Note: If a blank value is passed
     * 
     *
     * @param  {Object} theItems   [object where the name is the attibute and the value is the value to look for]
     * @param  {Object} theParent   [parent object to search in, if not provided, a global search is done]
     * @param  {Boolean} theExcludeBlanks   [set to true to ignore blank values]
     *         * Important: By default if an attribute that has no value to find is passed (present but blank)
     *                then ALL items that contain the attribute will be included.
     *                 the same as using [ATTRIBUTENAME="SOMEVALUE"][ATTRIBUTENAME2]
     *           Setting theExcludeBlanks to true will use [ATTRIBUTENAME="SOMEVALUE"] (leaving the item out)
     * 
     * @return {$el} [jQuery element collection (which may be one)]
     */
    me.getByAttr$ = function (theItems, theParent, theExcludeBlanks) {
        if (!theItems) {
            return false;
        }
        var tmpFoundItems = false;
        var tmpSS = '';
        for (aItemName in theItems) {
            if ((aItemName)) {
                var tmpVal = theItems[aItemName];
                tmpFoundItems = true;
                var tmpSSItem = '';
                if (tmpVal) {
                    tmpSSItem = '[' + aItemName + '="' + tmpVal + '"]'
                } else {
                    if (theExcludeBlanks !== true) {
                        tmpSSItem = '[' + aItemName + ']'
                    }
                };
                tmpSS += tmpSSItem;
            }
        }

        if (!tmpFoundItems) {
            return false;
        }

        var tmpParent = false;
        if (theParent) {
            //--- Convert if there is a parent and it is not a jQuery element already
            if (typeof (theParent) != 'string' && theParent.hasOwnProperty('nodeType')) {
                tmpParent = $(theParent);
            }
        }
        if (tmpParent) {
            return tmpParent.find(tmpSS);
        } else {
            return $(tmpSS);
        }

    }

    /**
     * setDisplay
     *    - sets the attribute to hidden or not hidden
     * 
     * To Use: ThisApp.setDisplay(anyEl,anyBooleanValue);
     *
     * @param  {Object} theEl   [target object with details about the page to open]
     * @param  {Boolean} theIsVis   [true to show, false to hide]
     * @return void
     */
    // me.setDisplay = function (theEl, theIsVis) {
    //     var tmpEl = $(theEl);
    //     if (theEl.node) {
    //         tmpEl = $(theEl.node());
    //     } else {
    //         tmpEl = $(theEl);
    //     }
    //     if (theIsVis) {
    //         tmpEl.removeClass('hidden');
    //     } else {
    //         tmpEl.addClass('hidden');
    //     }
    // }
    // me.show = function (theEl) {
    //     me.setDisplay(theEl, true);
    // }
    // me.hide = function (theEl) {
    //     me.setDisplay(theEl, false);
    // }
    me.initModuleComponents = initModuleComponents;
    function initModuleComponents(theApp, theModuleName, theComponents) {
        var appModule = ActionAppCore.module(theModuleName);
        for (var aPos in theComponents) {
            var tmpComp = theComponents[aPos];
            try {
                var tmpCompName = theComponents[aPos];
                var tmpComp = appModule[tmpCompName];
                theApp.registerComponent(theModuleName + ":" + tmpComp.pageName, tmpComp);
            } catch (ex) {
                console.error("Error in init component: " + theModuleName, ex);
            }
        }
    }


    /**
     * useModuleComponentsuseModuleComponents
     *    - Initializes application components from the modules they live in
     * 
     * To Use: 
     *   var tmpAppComponents = ['DataTablesPage', 'PouchPage', 'LogsPage'];
     *   var tmpPluginComponents = ['DataTables'];
     *   ThisApp.useModuleComponents('app', tmpAppComponents)
     *   ThisApp.useModuleComponents('plugin', tmpPluginComponents)
     *
     *  Note: Order matters, they load in the order provided, 
     *        ... if components add their own navigational items, the navigation items show in that order
     *
     * @param  {String} theModuleName   [the name of the module (i.e. app or plugin or any custom module)]
     * @param  {Array<String/Object>} theComponents   [List of components to load form this module, in the order they should initialize.  Pass string for just plugin  or {name:yourname,options:optionalOptions}]
     * @return void
     */
    me.useModuleComponents = useModuleComponents;
    function useModuleComponents(theModuleName, theComponents) {
        if (!theModuleName && theComponents) {
            console.error("Need both theComponents and theModuleName");
            return false;
        }
        var tmpComponents = theComponents || [];

        var tmpModule = ActionAppCore.module(theModuleName);
        if (!(tmpModule)) {
            console.error("Module not found: " + tmpModule);
            return false;
        }
        for (var aPos in tmpComponents) {
            var tmpComp = tmpComponents[aPos];
            if (typeof (tmpComp) == 'string') {
                tmpComp = { name: tmpComp };
            }
            var tmpName = tmpComp.name || '';
            if (tmpName) {
                try {
                    var tmpOptions = tmpComp.options || {};
                    $.extend(tmpOptions, { app: ThisApp });
                    var tmpNew = new tmpModule[tmpName](tmpOptions);
                } catch (ex) {
                    console.error("Error loading component: " + tmpName);
                }
            } else {
                console.error("Attempting to load plugin, but no name provided.", tmpComp);
            }

        }
        return true;
    }


    /**
     * getComponent
     *    - Returns any registered component by full name
     * 
     * To Use: 
     *   me.dt = ThisApp.getComponent("plugin:DataTables");
     *    - or - 
     *   me.logs = ThisApp.getComponent("app:Logs");
     *
     *  Note: You can then call the related component functions
     *        There is no need to get the component to use the related registered actions (i.e. <div appaction="logs:doSomeAction")
     *
     * @param  {String} theName   [the full name of the component to load including module name]
     * @return void
     */
    me.getComponent = getComponent;
    function getComponent(theName) {
        return me.components[theName];
    }

    /**
     * registerComponent
     *    - Register a component that can be received using getComponent
     * 
     * To Use: Implement your controller as shown below and register with the full module:ComponentName
     * 
     * 
     * Example: 
     * 
     * function ThisPageController(theOptions) {
     *   me.options = theOptions || {};
     *   me.actions = me.options.actions || {};
     *   var defaults = {};
     *   if (typeof (me.options.app) == 'object') {
     *       ThisApp = me.options.app;
     *       if (ThisApp && ThisApp.registerComponent) {
     *           ThisApp.registerComponent("app:PouchPage", this);
     *       }
     *   }
     * }
     *
     * @param  {String} theName   [the full name of the component to register including module name]
     * @param  {Object} theController   [The base object for the component being registered, usually "me"]
     * @return void
     */

    me.registerComponent = registerComponent;
    function registerComponent(theName, theController) {
        me.components[theName] = theController;
    }

    /**
     * registerAction
     *    - Register an action
     * 
     * Note: Usually components register a single action delegate function for all in the registered namespace
     *       ... see "registerActionDelegate" for details.
     * 
     * Example: 
     *   ThisApp.registerAction("doSomethingSpecial", me.doSomethingSpecial);
     * 
     *
     * @param  {String} theActionName   [the name of the action, do NOT include any module name prefix (:) here]
     * @param  {Object} theFunction   [The standard "Action" function to handle the action pass (action name, target object)]
     * @return void
     */
    me.registerAction = registerAction;
    function registerAction(theActionName, theFunction) {
        ThisCoreApp.actions[theActionName] = theFunction;
    }

    /**
     * registerActionDelegate
     *    - Register an delegate for all actions with a prefix using (:)
     * 
     * 
     * Example: 
     *   ThisApp.registerActionDelegate("previews", runAction);
     *    - this makes any <div appaction="previews:doSomething" .. 
     *     ...   go be routed to the callback "runAction" delegate function
     *
     * @param  {String} theActionDelegateName   [the prefix to use (do not iclude the ":")]
     * @param  {Function} theDelegate   [The standard "Action" function to handle the action pass (action name, target object)]
     * @return void
     */
    me.registerActionDelegate = registerActionDelegate;
    function registerActionDelegate(theActionDelegateName, theDelegate) {
        ThisCoreApp.actionsDelegates[theActionDelegateName] = theDelegate;
    }




    /**
     * runAppAction
     *    - Manually run an action passing the name and target object (jQuery element)
     * 
     * Example: 
     *   ThisApp.runAppAction("doSomethingSpecial", someEl);
     * 
     *
     * @param  {String} theAction   [the name of the action, you can include a module name prefix (:) here]
     * @param  {Object} theObject   [The object that contains the attributes that provide the target action parameters]
     * @return void
     */
    me.runAppAction = runAppAction;
    function runAppAction(theAction, theObject) {
        var tmpAction = theAction || '';
        var tmpASPos = tmpAction.indexOf(":");
        var tmpActionSpace = '';
        var tmpRan = false;

        var tmpObject = theObject;

        if (tmpASPos > -1) {
            tmpActionSpace = tmpAction.substr(0, tmpASPos);
            if (tmpActionSpace && ThisApp.actionsDelegates.hasOwnProperty(tmpActionSpace)) {
                var tmpAD = ThisApp.actionsDelegates[tmpActionSpace];
                if (typeof (tmpAD) == 'function') {
                    tmpAction = tmpAction.replace((tmpActionSpace + ":"), "");
                    tmpRan = true;
                    tmpAD(tmpAction, tmpObject);
                }
            }
        }

        if (!tmpRan) {
            var tmpAction = ThisCoreApp.actions[theAction] || ThisCoreApp[theAction];
            if (tmpAction) {
                return tmpAction(theAction, tmpObject);
            } else {
                console.error("No registered action for " + theAction);
                return null
            }
        }
    }


    /**
     * showCommonDialog
     *    - Shows the common dialog box with content provided
     * 
     * 
     * Example: 
     *   ThisApp.showCommonDialog();
     *
     * @param  {Object} theOptions   [The options object with header and content and optional actions]
     * @return this
     */
    me.showCommonDialog = showCommonDialog;
    function showCommonDialog(theOptions) {
        var tmpHeader = theOptions.header || '';
        var tmpContent = theOptions.content || '';
        if (typeof (tmpContent) == 'object') {
            tmpContent = me.getTemplatedContent(tmpContent);
        }
        ThisApp.loadFacet('site:dialog-header', tmpHeader);
        ThisApp.loadFacet('site:dialog-content', tmpContent);
        ThisApp.loadFacet('site:dialog-actions', ' ');
        getCommonDialog().modal('show');
        return me;
    }

    me.closeCommonDialog = closeCommonDialog;
    function closeCommonDialog() {
        getCommonDialog().modal('hide');
    }

    /**
     * Template Manager Functionality 
     * 
     *    Common method of getting templated HTML
     *
     */
        
    /**
     * getTemplatedContent
     * 
     *    Common method of getting templated content by name
     *
     * @param  {String} theTemplateName   [The name of the template to pull]
     * @param  {Object} theData   Optional, needed if template expects one
     * @param  {Object} theOptions   Optional, any options supported by this or calling methods
     * @return void
     */
    me.getTemplatedContent = function (theOptionsOrTemplateName, theDataIfNotObject, theOptions) {
        var tmpTemplateName = theOptionsOrTemplateName;
        var tmpData = theDataIfNotObject;
        if (typeof (theOptionsOrTemplateName) == 'object') {
            tmpTemplateName = theOptionsOrTemplateName.template;
            tmpData = theOptionsOrTemplateName.data || theDataIfNotObject || '';
        }
        tmpData = tmpData || '';
        if (!(tmpTemplateName)) {
            console.error("Need to pass template name as a string or an object with a .template")
            return;
        }

        return me.renderTemplate(tmpTemplateName, tmpData, theOptions);
        //return me.getTemplatedContentFromJSRender(theTemplateName, theData);
    }
    me.tplIndex = {};
    
    // *******************
    //=== ToDo: Move to extension so each thing can have it's own templating engine / namespace / object
    // *******************

    //--- More stuff to create... ====================
    me.loadTemplateIndex = function (theIndex, theOptions) {
        //--- Tells the templating where to find pages
    }
    me.loadTemplateOptions = function (theOptions) {
        //--- Tells the templating engine stuff like where to find
    }
    me.loadTemplateHTML = function (theTemplateName, theHTML, theOptions) {
        //--- Adds HTML by name, the templating engine will determine what to do

    }


    /**
     * getTemplatedContentFromJSRender
     *    - Returns HTML rendered from a template using jsRender
     *
     * @param  {String} theActionDelegateName   [the prefix to use (do not iclude the ":")]
     * @param  {Function} theDelegate   [The standard "Action" function to handle the action pass (action name, target object)]
     * @return void
     */
    me.getTemplatedContentFromJSRender = function (theOptionsOrTemplateName, theDataIfNotObject) {
        var tmpTemplateName = theOptionsOrTemplateName;
        var tmpData = theDataIfNotObject;
        if (typeof (theOptionsOrTemplateName) == 'object') {
            tmpTemplateName = theOptionsOrTemplateName.template;
            tmpData = theOptionsOrTemplateName.data || theDataIfNotObject || '';
        }
        tmpData = tmpData || '';
        if (!(tmpTemplateName)) {
            console.error("Need to pass template name as a string or an object with a .template")
            return;
        }
        return $.templates[tmpTemplateName].render(tmpData);
    }


    
    //======================================
    //======================================
    //======================================


    /**
     * compileTemplates
     *    - Looks for <pre> or <script> objects that contain template markup
     *    - Get the name of the attribute and the content, add the content to the templates with the attribute name
     *
     * @param  {String} theOptionalAttrName  Pass in the attribute name to look for templats inside
     * @param  {Object} theOptionalAttrName  Pass in the parent jQuery element to start with, uses default for getByAttr if not provided
     * @return void
     */
    me.compileTemplates = function(theOptionalAttrName, theOptionalTarget){
        var tmpAttrName = theOptionalAttrName || "data-htpl";
        var tmpSelector = {};
        //--- Init what to look for, anything with this attribute
        tmpSelector[tmpAttrName] = "";
        //--- Get all elements with this attribute
        ThisApp.getByAttr$(tmpSelector, theOptionalTarget).each(function(theIndex) {
          var tmpEl$ = $(this);
          var tmpKey = "" + tmpEl$.attr(tmpAttrName);
          //--- Add innerHTML to the templates object
          //me.htmlHandlebars[tmpKey] = "" + this.innerHTML;
          me._templates[tmpKey] = Handlebars.compile(this.innerHTML);          
          //console.log("Added tmpKey",tmpKey);
          //--- clear so there is only one
          this.innerHTML = '';
        });
    }

    //me.htmlHandlebars = {};
    me._templates = {};
    me.renderTemplate = function(theName, theContext){
        try {
            var tmpFn = (ThisApp._templates[theName]);
            return tmpFn(theContext);
        } catch (theError) {
            console.error("Error rendering template " + theError,"Name was " + theName);
        }
    }
    me.addTemplate = function(theName, theHTML){
        me._templates[theName] = Handlebars.compile(theHTML); 
    }


    //======================================
    //======================================
    //======================================


    //--- App Actions ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 
    //--- ========  ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 


    /**
     * AppAction: showPage
     * 
     * To Use:  <div appaction="showPage" item="THEPAGENAME">...
     *
     * @param  {String} theAction   [name of the action (showPage)]
     * @param  {Object} theTargetObj   [target object with details about the page to open]
     * @return this
     */
    var showPage = function (theAction, theTargetObj) {
        if (!theTargetObj) {
            theTargetObj = theAction;
        }
        var tmpPage = $(theTargetObj).attr("item") || '';
        if (tmpPage) {
            me.gotoPage(tmpPage);
        } else {
            console.error("No item provided");
        }
        return me;
    }

    /**
     * AppAction: showSubPage
     * 
     * To Use:  <div appaction="showPage" group="THEGROUPNAME" item="THEPAGENAME" >...
     *
     * @param  {String} theAction   [name of the action (showSubPage)]
     * @param  {Object} theTargetObj   [target object with details about the page to open]
     * @return this
     */
    var showSubPage = function (theAction, theTargetObj) {
        if (!theTargetObj) {
            theTargetObj = theAction;
        }
        var tmpPage = $(theTargetObj).attr("item") || '';
        var tmpGroupName = $(theTargetObj).attr("group") || '';
        if (tmpPage && tmpGroupName) {
            me.gotoTab({ group: tmpGroupName, item: tmpPage });
        } else {
            console.error("No pagename provided");
        }
    }




    //--- Internal Functionality ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 
    //--- ========  ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 


    /**
    * me.commonDialog - globally used dialog, private variable used to assure proper usage
   */
    var commonDialog = null,
        commonDialogTemplate = 'tpl-common-global-dialog',
        commonDialogFacet = 'site:global-dialog';

    function getCommonDialog() {
        if (!commonDialog) {
            //var tmpFacet = ThisApp.loadFacet(commonDialogFacet,'',commonDialogTemplate);
            commonDialog = ThisApp.getByAttr$({ appuse: 'global-dialog' })
            commonDialog.modal('setting', { closable: true }); // example of using modal dialog
        }
        return commonDialog;
    }

    me.hasSidebar = false;

    function initMenus() {
        //--- ToDo: Review semaction name / use ****
        var tmpSBSelector = '[semaction="showsidebar"]';
        if ($(tmpSBSelector).length > 0) {
            me.hasSidebar = true;
            $('[appuse="side-menu"]')
            .sidebar('setting', 'duration', 20)
            .sidebar('setting', 'mobileTransition', 'fade')            
            .sidebar('attach events', tmpSBSelector);
        }
    }

    function initGlobalDialog() {
        var tmpNewDiv = $('<div facet="site:global-dialog" class="hidden"></div>').appendTo('body');
        var tmpHTML = '<div appuse="global-dialog" class="ui modal"> <i class="close icon"></i> <div facet="site:dialog-header" class="header"></div> <div facet="site:dialog-content" class="content"> </div> <div facet="site:dialog-actions" class="actions"></div> </div> ';
        me.loadFacet(commonDialogFacet, tmpHTML )
    }

    function initAppActions() {
        $('[appuse="appbody"]').on("click", itemClicked)
    }
    function instClicked(theEvent) {
        theEvent.preventDefault();
        theEvent.stopPropagation();
    }

    //---- Internal: Gets the action or appaction from the current element or the first parent element with such an entry,
    //               ... this is needed so when a child element is clicked, the proper parent action element is used.
    function _getActionFromObj(theObj) {
        var tmpObj = theObj;
        var tmpAction = $(tmpObj).attr("appaction") || $(tmpObj).attr("action") || "";
        if (!tmpAction) {
            var tmpParent = $(tmpObj).closest('[action]');
            if (tmpParent.length == 1) {
                tmpObj = tmpParent.get(0);
                tmpAction = $(tmpObj).attr("action") || "";
            } else {
                tmpParent = $(tmpObj).closest('[appaction]');
                if (tmpParent.length == 1) {
                    tmpObj = tmpParent.get(0);
                    tmpAction = $(tmpObj).attr("appaction") || "";
                    $(tmpObj).attr("action", tmpAction)
                } else {
                    return false; //not an action
                }
            }
        }
        return { action: tmpAction, el: tmpObj };
    }

    //---- Internal: Catch a click item to look for the action
    function itemClicked(theEvent) {
        var tmpObj = theEvent.target || theEvent.currentTarget || theEvent.delegetTarget || {};
        var tmpActionDetails = _getActionFromObj(tmpObj);
        if (!((tmpActionDetails.hasOwnProperty('action') || tmpActionDetails.hasOwnProperty('appaction')) && tmpActionDetails.hasOwnProperty('el'))) {
            //--- OK, just clicked somewhere with nothing to catch it, but not an action
            return;
        }
        var tmpAction = tmpActionDetails.action;
        tmpObj = tmpActionDetails.el;

        if (tmpAction) {
            theEvent.preventDefault();
            theEvent.stopPropagation();
            runAppAction(tmpAction, tmpObj);
        }
        return false;
    }

    //--- ToDo - Implement better message center with toastr as UI option or toastless
    function initMessageCenter() {
        toastr.options.closeButton = true;
        toastr.options.timeOut = 1000;
        /*
        //--- Some other available options
        toastr.options.timeOut = 2000;
        toastr.options.extendedTimeOut = 6000;
         */
    }

    me.siteLayout = null;

    me.refreshLayouts = function (theTargetEl) {
        me.siteLayout.resizeAll();
    }
    me.resizeLayouts = function (name, $pane, paneState) {
        try {
            var tmpH = $pane.get(0).clientHeight - $pane.get(0).offsetTop - 1;
            me.getByAttr$({ appuse: "cards", group: "app:pages", item: '' }).css("height", tmpH + "px");;
        } catch (ex) {

        }
    }

    me.init = init;
    var ThisCoreApp = this;
    function init(theAppConfig) {

        ThisCoreApp = this;
        
        //--- Init Required Plugins
        me.useModuleComponents('plugin', ['ObjectManager']);
        me.om = me.getComponent("plugin:ObjectManager");

        //--- ToDo: Support options in theAppConfig to control this        
        me.siteLayout = $('body').layout({
            center__paneSelector: ".site-layout-center"
            , north__paneSelector: ".site-layout-north"
            , north__spacing_open: 4
            , north__spacing_closed: 4
            , north__resizable: false
            , spacing_open: 6 // ALL panes
            , spacing_closed: 8 // ALL panes
            , onready: ThisApp.resizeLayouts
            , center__onresize: ThisApp.resizeLayouts
        });

        me.config = me.config || {};
        if (theAppConfig) {
            $.extend(me.config, theAppConfig)
        }
        me.config.navbuttons = me.config.navbuttons || [];
        me.config.navlinks = me.config.navlinks || [];
        me.registerAction("showPage", showPage);
        me.registerAction("showSubPage", showSubPage);

        me.$appPageContainer = $(me.config.container || '[appuse="main-page-container"]');

        for (var aName in me.components) {
            var tmpController = me.components[aName];
            //--- Call any plug in component init functions on init, if it has one
            if (tmpController && typeof (tmpController.init) == 'function') {
                tmpController.init(this);
            }
        }

        //--- Standard functionality  ===================================
        var tmpNavHTML = '{{#each navlinks}} <a appuse="tablinks" group="app:pages" item="{{name}}" appaction="showPage" class="item">{{title}}</a> {{/each}}';
        ThisApp.addTemplate('tpl-side-menu-item',tmpNavHTML)
        $('[appuse="side-menu"]').html(ThisApp.renderTemplate('tpl-side-menu-item',me.config));
        $('[appuse="nav-menu"]').html(ThisApp.renderTemplate('tpl-side-menu-item',me.config));

        initMenus();
        initAppActions();
        initMessageCenter();
        initGlobalDialog();

        if (me.config['navlinks']) {
            var tmpFirstNavLink = me.config['navlinks'][0];
            if (tmpFirstNavLink && tmpFirstNavLink.name) {
                ThisApp.gotoPage(tmpFirstNavLink.name);
            }
        }
    }

})(ActionAppCore, $);
















/*
Author: Joseph Francis
License: MIT
*/
//---  SitePage - Base for all application pages --- --- --- --- --- --- --- --- --- --- --- --- 
(function (ActionAppCore, $) {

    var SiteMod = ActionAppCore.module("site");
    SiteMod.SitePage = SitePage;

    var defaultLayoutOptions = {
        spacing_closed: 8,
        spacing_open: 6,
        resizable: true,
        togglerLength_open: 100,
        togglerLength_closed: 100,
        south__resizable: false,
        south__closable: false,
        south__slidable: false,
        south__togglerLength_open: 0,
        south__spacing_open: 0,
        north__resizable: false,
        north__closable: false,
        north__slidable: false,
        north__togglerLength_open: 0,
        north__spacing_open: 0,
        center__paneSelector: ".middle-center",
        north__paneSelector: ".middle-north",
        south__paneSelector: ".middle-south",
        west__paneSelector: ".middle-west",
        east: { paneSelector: ".middle-east", resizable: true, resizeWhileDragging: true, slidable: true }
    };



    //--- Base class for application pages
    function SitePage(theOptions) {
        this.options = theOptions || {};
        this.pageName = this.options.pageName || '';
        this.pageNamespace = this.options.pageNamespace || '';

        this.pageTitle = this.options.pageTitle || '';
        this.pageTemplates = this.options.pageTemplates || [];
        this.layoutTemplates = this.options.layoutTemplates || false;

        this.linkDisplayOption = this.options.linkDisplayOption || "both"
        this._activatedFlag = false;
        //this.pageTemplate = this.options.pageTemplate || '';
        this.layoutOptions = this.options.layoutOptions || false;

//!this.pageTemplate || 
        if (this.layoutOptions) {
            this.layoutOptions = this.layoutOptions || {};
            this.layoutConfig = $.extend({}, defaultLayoutOptions, (this.options.layoutConfig || {}));

            //--- Use standard border layout template if none provided
            this.layoutOptions.facetPrefix = this.layoutOptions.facetPrefix || this.pageName;
            //this.pageTemplate = this.pageTemplate || 'tpl-border-layout';

            //--- Extend with new layout related facet functions
            this.addToRegion = function (theRegion, theContent, theOptionalTemplateName, thePrepend) {
                var tmpRegionFacetName = this.layoutOptions.facetPrefix + ":" + theRegion;
                ThisApp.addToFacet(tmpRegionFacetName, theContent, theOptionalTemplateName, thePrepend)
            }
            this.loadRegion = function (theRegion, theContent, theOptionalTemplateName) {
                var tmpRegionFacetName = this.layoutOptions.facetPrefix + ":" + theRegion;
                ThisApp.loadFacet(tmpRegionFacetName, theContent, theOptionalTemplateName)
            }

        }
        this.appModule = this.options.appModule || false;
        if (this.appModule) {
            this.appModule[this.pageName] = this;
        }
    }

    var me = SitePage.prototype;
    //var that = this;

    me.initOnFirstLoad = function(){
        var dfd = jQuery.Deferred();
        var tmpThis = this;
        ThisApp.initTemplates(this.pageTemplates).then(
            function(){
                //--- No async calls, just run it
                tmpThis.initLayoutTemplates();
                dfd.resolve(true);
            }
        );
        return dfd.promise();
    }
    me.initLayoutTemplates = function(){
        if(!this.layoutOptions && this.layoutOptions.templates){
            return;
        }
        var tmpLTs = this.layoutOptions.templates;
        var tmpContext = {}
        for( var aName in tmpLTs ){
            var tmpLT = tmpLTs[aName];
            var tmpLTName = '';
            if( typeof(tmpLT) == 'string'){
                tmpLTName = tmpLT;
            } else {
                tmpLTName = tmpLT.name;
            }
            this.loadRegion(aName, ThisApp.renderTemplate(tmpLTName, tmpContext));
        }
    }
   
    me.open = function (theOptions) {
        return ThisApp.gotoPage(this.pageName);p
    }
    me.focus = me.open;
    
    me.loadFacet = function (theName, theContent, theOptionalTemplateName) {
        return ThisApp.loadFacet(theName, theContent, theOptionalTemplateName, this.getParent$());
    }
    me.getByAttr$ = function (theItems, theExcludeBlanks) {
        return ThisApp.getByAttr$(theItems, this.getParent$(), theExcludeBlanks);
    }
    me.getParent$ = function () {
        var tmpAttribs = {
            group: "app:pages",
            item: this.pageName
        }
        this.parent$ = this.parent$ || this.app.getByAttr$(tmpAttribs);
        return this.parent$;
    }


    //======================================
    //======================================
    //======================================


    me.init = init;
    function init(theApp) {

        if (theApp) {
            this.app = theApp;
        }

        if (typeof (this._onPreInit) == 'function') {
            this._onPreInit(this.app)
        }

        if (this.app && this.pageNamespace && this.pageNamespace != '') {
            this.app.registerActionDelegate(this.pageNamespace, runAction.bind(this));
        }

        //--- Add dynamic link on init from plugin module
        if (this.app && this.app.$appPageContainer) {
            this.app.$appPageContainer.append('<div appuse="cards" group="app:pages" item="' + this.pageName + '" class="hidden">' + this.pageTitle + '</div>')
            this.app.registerNavLink({
                "name": this.pageName,
                "title": this.pageTitle,
                "display": this.linkDisplayOption,
                "onActivate": onActivateThisPage.bind(this)
            })
            
            this.getLayoutHTML = function(){
                var tmpRet = "";
                var tmpAll = ['north','south','center', 'east','west'];
                var tmpPre = this.layoutOptions.facetPrefix;
                for(var i = 0 ; i < tmpAll.length ; i++){
                    var tmpArea = tmpAll[i];
                    if( this.layoutOptions[tmpArea] !== false){
                        tmpRet += '<div facet="' + tmpPre + ':' + tmpArea+ '" class="middle-' + tmpArea+ '"></div>';    
                    }
                }
                return tmpRet;
            };

            this.parentEl = this.app.getByAttr$({ group: "app:pages", item: this.pageName })
            this.parentEl.html(this.getLayoutHTML());

            if (typeof (this._onInit) == 'function') {
                this._onInit(this.app)
            }

            if (this.layoutOptions && this.layoutConfig) {
                this.layoutSpot = ThisApp.getByAttr$({ group: ThisApp.pagesGroup, "item": this.pageName });
                this.layout = this.layoutSpot.layout(this.layoutConfig);
            }

        }

        //--- Example of how to interact with theApp or ActionAppCore.app
        /*
        To register actions not handled by action handler (prefixed:)
            theApp.registerAction("logs:refreshMessageCenter", refreshMessageCenter);
            theApp.registerAction("logs:clearMessageCenter", clearMessageCenter);

        To subscribe to application level messages ...
           theApp.subscribe("message:sent", refreshMessageCenter)
        */


    }



    //---- Internal Stuff ---------------------
    /*
    function registerPage() {
        if (typeof (me.options.app) == 'object') {
            ThisApp = me.options.app;
            if (me.pageName != '' && ThisApp && ThisApp.registerComponent) {
                ThisApp.registerComponent("app:" + me.pageName, this);
            }
        }
    }
     */
    me.runAction = runAction;
    function runAction(theAction, theSourceObject) {
        var tmpAction = theAction || '';
        tmpAction = tmpAction.replace((this.pageNamespace + ":"), '');
        if (typeof (this[tmpAction]) == 'function') {
            this[tmpAction](tmpAction, theSourceObject);
        } else if (typeof (me[tmpAction]) == 'function') {
            me[tmpAction](tmpAction, theSourceObject);
        }
    }

    function onActivateThisPage() {
        //-- Runs _onFirstActivate one time, 
        //    ... then calls _onActivate sucessive times
        //  _onActivate NOT CALLED the first time, 
        //   ... call manually if needed from _onFirstActivate
        if (!this._activatedFlag) {
            this._activatedFlag = true;
            if(typeof(this._onFirstActivate) == 'function'){
                this._onFirstActivate();
            }
        } else if(typeof(this._onActivate) == 'function'){
            this._onActivate();
        }
    }
    
    return me;

})(ActionAppCore, $);


/*
Author: Joseph Francis
License: MIT
*/

/*  NoSqlDataManager

Designed to abstract json based data storage in a way that is not specific to source type or location.

---------------------- ---------------------- ---------------------- ----------------------
Important: 
    This expects PouchDB to be available for local storage as it is the default handler for data requests
    * To change this, replace the [default] handler with your own function / alternate handler
---------------------- ---------------------- ---------------------- ----------------------
How to use:
----------------------

Get the plugin (Singleton):
  var dataMgr = $.fn.NoSqlDataManager

Data Manager uses known or identified sources
  dataMgr.getDocument(sourceName, docID)
  dataMgr.putDocument(sourceName, docID, theObject)
  dataMgr.deleteDocument(sourceName, docID)
  dataMgr.getAll(sourceName)
  dataMgr.getAll(sourceName, ['key1','key2']);

  //--- Special functions


Data Manager can be extended to handle custom sources
  dataMgr.putSourceHandler('mytestdb',{"handler":"[couch]", "options":{"dbName","some-database-name"}}); 

Data Manager handlers can had defaults set / overridden
  dataMgr.putSourceHandlerDefaults('[ajax]',{ ajax: {"url": "http://your.location/apicall/"}});
  
Note: If the source is not an internal name [likethis],  but the handler is (i.e. [pouch]), then ...
          .. if no options object with a dbname is provided, the db name is assumed to be the source name
      Examples: 
        dataMgr.putDocument('testdb, 'mydoc1', {"title":"My Test Doc"}); //Add mydoc1 to the local pouch db: "testdb"
        dataMgr.getDocument('testdb', 'mydoc1'); //returns mydoc1 from the local pouch db: "testdb"

Source Handlers:  ("name" = function or name of other handler.)
[any-internal] = when [] is used, these are internal / common handlers for known source data

  "[default]" = the default handler if none is provided, [pouch] by default.

  DATABASE ACCESS
  "[pouch]" = Handler specifically for local pouch storage, where create and destroy requires no special privs
  "[couch]" = Handler for a (usually local) couch database
  "[ajax]" = Handler for any external ajax handler that follows the known protocol

  READ ONLY - AJAX BASED ACCESS
  "[get]": Handler to get a JSON object via ajax get url
  "[html]": Handler to get HTML via ajax get url


*/

$.fn.NoSqlDataManager = (function ($) {

    function DataManager(theOptions) { };
    var me = DataManager.prototype;

   

    me.getDataDetails = getDataDetails;
    function getDataDetails(theData) {

        var tmpRet = {
            fieldCount: 0,
            fields: {},
            details: []
        }
        if (!theData) {
            return;
        }
        var tmpData = theData;
        if (tmpData.docs) {
            tmpData = tmpData.docs;
        }
        if (tmpData.length < 1) {
            return tmpRet;
        }
        tmpRet.designDocs = 0;

        for (var i = 0; i < tmpData.length; i++) {
            var tmpDoc = tmpData[i];
            var tmpID = tmpDoc._id;

            if (tmpID.indexOf("_design") == 0) {
                tmpRet.designDocs++;
            } else {
                for (var aFieldName in tmpDoc) {

                    if (!(tmpRet.fields[aFieldName])) {
                        tmpRet.fields[aFieldName] = { isMissing: 0, hasField: 0, hasValue: 0, values: {}, valueTypes: {}, valuesTypes: {} }
                    }
                    var tmpFO = tmpRet.fields[aFieldName];

                    tmpFO.hasField++;
                    var tmpVals = tmpDoc[aFieldName];

                    var tmpValType = typeof (tmpVals);
                    var tmpIsEmpty = false;

                    if ($.isArray(tmpVals)) {
                        tmpValType = 'ARRAY';
                        if( tmpVals.length == 0){
                            tmpIsEmpty = true;
                        }
                    }
                    if (!tmpFO.valuesTypes.hasOwnProperty(tmpValType)) {
                        tmpFO.valuesTypes[tmpValType] = 1;
                    } else {
                        tmpFO.valuesTypes[tmpValType]++
                    }

                    if (!($.isArray(tmpVals)) && typeof (tmpVals) == 'object') {
                        tmpVals = '[OBJECT]';
                    }
                    if (tmpVals == null || typeof (tmpVals) == 'undefined') {
                        tmpFO.isMissing++;
                    } else if (typeof (tmpVals) == 'string') {
                        if (tmpVals) {
                            tmpFO.hasValue++;
                        }
                        tmpVals = [tmpVals];
                    } else {
                        if (!($.isArray(tmpVals))) {
                            tmpVals = [tmpVals];                       
                        }
                        if( !tmpIsEmpty && !(tmpVals.length == 1 && (tmpVals[0] == '' || tmpVals[0] == null))){
                            tmpFO.hasValue++;                           
                        }                        
                    }

                    for (var aValPos in tmpVals) {
                        var tmpVal = tmpVals[aValPos];

                        if (typeof (tmpVal) == 'boolean' || (tmpVal != '')) {
                            if (!tmpFO.values.hasOwnProperty(tmpVal)) {
                                tmpFO.values[tmpVal] = 1;
                            } else {
                                tmpFO.values[tmpVal]++
                            }
                        }
                        var tmpValType = typeof (tmpVal);
                        if (!tmpFO.valueTypes.hasOwnProperty(tmpValType)) {
                            tmpFO.valueTypes[tmpValType] = 1;
                        } else {
                            tmpFO.valueTypes[tmpValType]++
                        }
                    }
                }
            }
        }
        tmpRet.data = tmpData;

        return tmpRet;
    }

    me.getDocumentHandler = getDocumentHandler;
    function getDocumentHandler(theSourceName) {

        var tmpRet = {};
        var tmpSource = theSourceName;
        var tmpSourceHandlerName = tmpSourceName;
        var tmpSourceName = theSourceName;
        var tmpSources = tmpSource.split(":");
        if (tmpSources.length > 0) {
            tmpSourceHandlerName = tmpSources[0];
            tmpSourceName = tmpSourceName.replace(tmpSourceHandlerName + ':', '');
        }

        var tmpHandler = getSourceHandler(tmpSourceHandlerName);
        if (!tmpHandler) {
            console.error("Error in getDocumentHandler: No handler found for source " + tmpSource);
            return false;
        }

        var tmpHandlerFunc = tmpHandler;
        var tmpHandlerOptions = {};
        if (tmpSourceName == tmpSourceHandlerName && tmpHandler.source && (tmpHandler.source.indexOf(':') >= 0)) {
            tmpSource = tmpHandler.source;
            tmpSourceHandlerName = tmpSource;
            tmpSourceName = tmpSource;
            var tmpSources = tmpSource.split(":");
            if (tmpSources.length > 0) {
                tmpSourceHandlerName = tmpSources[0];
                tmpSourceName = tmpSourceName.replace(tmpSourceHandlerName + ':', '');
                tmpSource = tmpSourceName;
            }
            tmpHandlerFunc = getSourceHandler(tmpSourceHandlerName);
        } else {
            if (typeof (tmpHandlerFunc) == 'object') {

                if (typeof (tmpHandlerFunc.options) == 'object') {
                    tmpHandlerOptions = tmpHandlerFunc.options;
                }
                if (typeof (tmpHandlerFunc.source) == 'string') {
                    tmpSourceName = tmpHandlerFunc.source;
                }
                tmpHandlerFunc = getSourceHandler(tmpHandlerFunc.handler);;
            }
        }

        if (typeof (tmpHandlerFunc) != 'function') {
            console.error("Error in getDocumentHandler: No handler FUNCTION found for source " + tmpSource);
            return false;
        }

        if (sourceHandlerOptions.hasOwnProperty(tmpSourceHandlerName)) {
            tmpHandlerOptions = $.extend(sourceHandlerOptions[tmpSourceHandlerName], tmpHandlerOptions);
        }

        tmpRet.source = tmpSourceName;
        tmpRet.options = tmpHandlerOptions;
        tmpRet.handler = tmpHandlerFunc;

        return tmpRet;
    }


    //--- Public Implementation === === === === === === === === === === === === === === === === === === === === === === 
    /*
    
    Out of the box: 
     - getDocument
     - getDocuments
     - putDocument
     - deleteDocument
 
    Advanced Options to configure alternate sources and provide access creditials and/or APIs to use for source data.
     - putSourceHandler (advanced)
     - putSourceHandlerDefaults (advanced)
 
 
    
     */

    me.putSourceHandler = putSourceHandler;
    function putSourceHandler(theSourceName, theHandler) {
        sourceHandlers[theSourceName] = theHandler;
    }

    me.getDocument = getDocument;
    function getDocument(theSourceName, thePath) {
        var tmpHandlerDetails = getDocumentHandler(theSourceName);
        var tmpActionDetails = {
            action: 'get',
            location: thePath,
            source: tmpHandlerDetails.source
        }
        return tmpHandlerDetails.handler(tmpActionDetails, tmpHandlerDetails.options);
    }

    me.getDocuments = getDocuments;
    function getDocuments(theSourceName, theKeys) {
        var tmpHandlerDetails = getDocumentHandler(theSourceName);
        var tmpActionDetails = {
            action: 'getDocs',
            keys: theKeys,
            source: tmpHandlerDetails.source
        }
        return tmpHandlerDetails.handler(tmpActionDetails, tmpHandlerDetails.options);
    }

    me.putDocument = putDocument;
    function putDocument(theSourceName, thePath, theObject) {
        var tmpHandlerDetails = getDocumentHandler(theSourceName);
        //---ToDo: Work out deeper path or rename
        theObject._id = thePath;

        var tmpActionDetails = {
            action: 'put',
            doc: theObject,
            location: thePath,
            source: tmpHandlerDetails.source
        }
        return tmpHandlerDetails.handler(tmpActionDetails, tmpHandlerDetails.options);
    }

    me.deleteDocument = deleteDocument;
    function deleteDocument(theSourceName, thePath) {
        var tmpHandlerDetails = getDocumentHandler(theSourceName);
        var tmpActionDetails = {
            action: 'delete',
            location: thePath,
            source: tmpHandlerDetails.source
        }
        return tmpHandlerDetails.handler(tmpActionDetails, tmpHandlerDetails.options);
    }

    var sourceHandlers = {
        "[default]": "[pouch]",
        "[pouch]": sourceHandlerForPouch, //for client only data
        "[couch]": sourceHandlerForNoSQL, //for NoSQL data
        "[ajax]": sourceHandlerForAjaxPost, //for data
        "[get]": sourceHandlerForAjaxGet, //Read Only - json data type
        "[html]": sourceHandlerForHTML  //Read Only - html data type
    }

    var sourceHandlerOptions = {
        "[couch]": { auth: { username: '', password: '' } },
        "[ajax]": { ajax: { url: './' } }
    }
    me.putSourceHandlerDefaults = putSourceHandlerDefaults;
    function putSourceHandlerDefaults(theSourceName, theDefaultOptions) {
        if (!(theSourceName)) {
            return false;
        }
        sourceHandlerOptions[theSourceName] = theDefaultOptions || {}
        return true;
    }

    me.sourceHandlerForPouch = sourceHandlerForPouch;
    function sourceHandlerForPouch(theAction, theOptions) {
        var dfd = jQuery.Deferred();

        if (!(theAction) && typeof (theAction.source) == 'object') {
            dfd.reject("Error: No action passed");
            return dfd.promise();
        }

        var tmpDBName = theAction.source || '';
        var tmpDB = new PouchDB(tmpDBName);
        var tmpOptions = $.extend({}, theOptions, { db: tmpDB });
        return sourceHandlerForNoSQL(theAction, tmpOptions)
    }

    me.transformNoSQLDocs = function (theDocs) {
        if (typeof (theDocs.rows) == 'object') {
            theDocs = theDocs.rows;
        }
        var tmpRet = {
            docs: []
        }
        for (var aDocPos in theDocs) {
            var tmpDoc = theDocs[aDocPos];
            tmpDoc = tmpDoc.doc || tmpDoc;
            var tmpID = tmpDoc._id;
            if( tmpID.indexOf("_design") != 0){
                tmpDoc._index = aDocPos;
                tmpRet.docs.push(tmpDoc);
            }
        }
        return tmpRet;
    }


    me.getDatabaseFromSourceName = function (theSourceName) {
        var tmpHandler = getDocumentHandler(theSourceName);
        return me.getDatabase((tmpHandler.options.source || tmpHandler.source), tmpHandler.options);
    }

    me.getDatabase = function (theSourceName, theOptions) {
        var dfd = jQuery.Deferred();
        try {
            var tmpDB = null;
            if (theOptions.hasOwnProperty('url')) {
                var tmpDBOptions = {};
                if (typeof (theOptions.auth) == 'object') {
                    tmpDBOptions.auth = theOptions.auth;
                }
                tmpDB = new PouchDB(theOptions.url + theSourceName);
            } else {
                tmpDB = new PouchDB(theSourceName);
            }
            var tmpOptions = $.extend({}, (theOptions || {})); //, { db: tmpDB }
            if (tmpDBOptions.auth) {
                tmpDB.login(tmpDBOptions.auth.username, tmpDBOptions.auth.password).then(function (user) {
                    dfd.resolve(tmpDB);
                })
            } else {
                dfd.resolve(tmpDB);
            }

        } catch (theError) {
            dfd.reject("Error getting database: " + theError);
        }
        return dfd.promise();
    }

    me.sourceHandlerForNoSQL = sourceHandlerForNoSQL;
    function sourceHandlerForNoSQL(theAction, theOptions) {
        var dfd = jQuery.Deferred();

        theOptions = theOptions || {};
        var tmpDBName = theAction.source || '';

        if (!(typeof (theOptions.db) == 'object')) {
            me.getDatabase(tmpDBName, theOptions).then(function (theDB) {
                theOptions.db = theDB;
                me.sourceHandlerForNoSQL(theAction, theOptions).then(function (theResponse) {
                    dfd.resolve(theResponse);
                });
            })
            return dfd.promise();
        }

        var tmpAction = theAction.action || 'get';
        var tmpDocID = theAction.location || '';

        var tmpDB = theOptions.db;
        if (tmpAction == 'get') {
            tmpDB.get(tmpDocID).then(function (theDoc) {
                if (theDoc.doc) {
                    theDoc = theDoc.doc;
                }
                dfd.resolve(theDoc);
            }).catch(function (err) {
                //dfd.reject("Error getting document from nosql db. " + err.toString());
                dfd.reject(err);
            });
        } else if (tmpAction == 'put') {
            var tmpDoc = theAction.doc || false;

            tmpDB.get(tmpDocID).then(function (doc) {
                tmpDoc._rev = doc._rev;
                tmpDoc._id = doc._id;
                return tmpDB.put(tmpDoc);
            }).then(function (theResponse) {
                dfd.resolve(tmpDoc, theResponse);
            }).catch(function (err) {
                if (err.status == 404) {
                    tmpDB.put(tmpDoc).then(function (theResponse) {
                        dfd.resolve(tmpDoc, theResponse);
                    }).catch(function (err) {
                        dfd.reject("Error putting document into a nosql db. " + err.toString());
                    });
                } else {
                    dfd.reject("Error putting document into a nosql db. " + err.toString());
                }

            });
        } else if (tmpAction == 'getDocs') {
            var tmpRet = [];
            var tmpOptions = { include_docs: true };
            var tmpKeys = theAction.keys || [];
            if ((tmpKeys) && tmpKeys.length > 0) {
                tmpOptions.keys = tmpKeys;
            }
            tmpDB.allDocs(tmpOptions).then(function (theResponse) {
                tmpRet = me.transformNoSQLDocs(theResponse)
                dfd.resolve(tmpRet);
            }).catch(function (err) {
                dfd.reject("Error getting documents from a nosql db. " + err.toString());
            });
        } else if (tmpAction == 'delete') {
            var tmpRet = [];
            tmpDB.get(tmpDocID).then(function (doc) {
                return tmpDB.remove(doc);
            }).then(function (theResult) {
                dfd.resolve(theResult);
            }).catch(function (err) {

                if (err.status == 404) {
                    dfd.resolve({
                        _id: tmpDocID,
                        ok: true,
                        msg: "OK, Did not exist."
                    });
                } else {
                    dfd.reject("Error deleting document from a nosql db. " + err.toString());
                }

            });
        }

        return dfd.promise();
    }

    //--- Simple URL get method for HTML files (templates usually)
    me.sourceHandlerForHTML = sourceHandlerForAjaxGet;
    function sourceHandlerForHTML(theAction, theOptions) {
        //--- Merge from theOptions if supporting more options
        return sourceHandlerForAjaxGet(theAction, {dataType:'html'});
    }
    
    //--- Simple URL get method, default type is json for returning objects
    //?  me.defaultSourceForAjaxGet = 'app-data';
    me.sourceHandlerForAjaxGet = sourceHandlerForAjaxGet;    
    function sourceHandlerForAjaxGet(theAction, theOptions) {
        var dfd = jQuery.Deferred();
       
        var tmpAction = theAction.action || 'get';
        var tmpKey = theAction.location || '';
        var tmpKeys = [];
        var tmpDefs = [];
        var tmpTempls = [];

        var tmpSource = theAction.source || '';
        var tmpPre = './' + tmpSource + '/';

        
        var tmpDataType = "json";
        if( theOptions && theOptions.dataType ){
            tmpDataType = theOptions.dataType;
        }

        if(tmpAction == 'getDocs' && theAction.keys && theAction.keys.length ){
            tmpKeys = theAction.keys;
            var tmpDefs = [];
            var tmpResults = {};
            
            for( var i = 0 ; i < tmpKeys.length ; i++){
                var tmpListKey = tmpKeys[i];
                //--- This is a trick that is needed to keep the keys from all being the last one when it really runs
                //--   ... this contains the keys inside the function.
                //--  Note: Just hit this doing the async, maybe better way?
                var fnGetAndAdd = function(theKey){
                    var tmpKey = theKey;
                    return function(theResponse){
                        theResponse["_key"] = tmpKey;
                        tmpResults[tmpKey] = theResponse;
                    }
                }
                var fnGetAndAddError = function(theKey){
                    var tmpKey = theKey;
                    return function(theError){
                        tmpResults[tmpKey] = {"_error":theError,"_key":tmpKey};
                    }
                }
                tmpDefs.push(
                    $.ajax({
                        url: tmpPre + tmpListKey,
                        method: 'GET',
                        dataType: tmpDataType,
                        success: fnGetAndAdd(tmpListKey),
                        error: fnGetAndAddError(tmpListKey)                    
                    })   
                                     
                );
            }
            $.whenAll(tmpDefs).then(
                function(){
                    dfd.resolve(tmpResults);
                }
            )
            return dfd.promise();
        } else {
            //---only one
            if (!(tmpKey)) {
                dfd.reject("No key to get");
                return dfd.promise();
            }
    
            $.ajax({
                url: tmpPre + tmpKey,
                method: 'GET',
                dataType: tmpDataType,
                success: function (theResponse) {
                    dfd.resolve(theResponse);
                },
                error: function (theError) {
                    dfd.reject("No URL setup to handle this ajax call: " + theError);
                }
            });

        }
        
        return dfd.promise();

    }

    me.sourceHandlerForAjaxPost = sourceHandlerForAjaxPost;
    function sourceHandlerForAjaxPost(theAction, theOptions) {
        var dfd = jQuery.Deferred();
        //theAction.options = theOptions || {};
        var tmpOptions = theOptions || {};

        if (typeof (tmpOptions.ajax) != 'object') {
            dfd.reject("No ajax object setup to handle this ajax call");
            return dfd.promise();
        }

        if (typeof (tmpOptions.ajax.url) != 'string') {
            dfd.reject("No URL setup to handle this ajax call");
            return dfd.promise();
        }

        $.ajax({
            url: tmpOptions.ajax.url,
            data: tmpOptions.ajax.data || theAction.data || theAction,
            method: 'POST',
            dataType: "json",
            success: function (theResponse) {
                dfd.resolve(theResponse);
            },
            error: function (theError) {
                dfd.reject("No URL setup to handle this ajax call: " + theError);
            }
        });
        return dfd.promise();

    }

    me.getSourceHandler = getSourceHandler;
    function getSourceHandler(theSourceName) {
        var tmpSourceName = theSourceName || '';
        if (tmpSourceName == '') {
            tmpSourceName = "[default]";
        }
        var tmpHandler = false;
        if (sourceHandlers.hasOwnProperty(theSourceName)) {
            tmpHandler = sourceHandlers[theSourceName];
        } else {
            tmpHandler = "[default]";
        }
        if (typeof (tmpHandler) == 'function' || typeof (tmpHandler) == 'object') {
            return tmpHandler;
        }

        //--- Go a few deep to find handler function
        for (var i = 0; i < 10; i++) {
            if (sourceHandlers.hasOwnProperty(tmpHandler)) {
                tmpHandler = sourceHandlers[tmpHandler];
            } else {
                //--- Something is not right, return sourceHandlerForPouch
                tmpHandler = sourceHandlerForPouch;
            }
            if (typeof (tmpHandler) == 'function' || typeof (tmpHandler) == 'object') {
                return tmpHandler;
            }
        }



    }

    me.init = init;
    function init() {
        return me;
    }

    return me;

})($);


/*
Author: Joseph Francis
License: MIT
*/

/*  ObjectManager

Designed to abstract object storage in a way that is not specific to source type or location.
---------------------- ---------------------- ---------------------- ----------------------
Important: 
    This expects PouchDB to be available for local storage as it is the default handler for object requests
    * To change this, replace the [default] handler with your own function / alternate handler
---------------------- ---------------------- ---------------------- ----------------------
How to use:
----------------------

Get the plugin:
  var om = theApp.getComponent("plugin:ObjectManager");

Object Manager uses known or identified sources
  om.getObject(sourceName, docID)
  om.putObject(sourceName, docID, theObject)
  om.deleteObject(sourceName, docID)
  om.getAll(sourceName)
  om.getAll(sourceName, ['key1','key2']);

Object Manager can be extended to handle custom sources
  om.putSourceHandler('mytestdb',{"handler":"[couch]", "options":{"dbName","some-database-name"}}); 

Object Manager handlers can had defaults set / overridden
  om.putSourceHandlerDefaults('[ajax]',{ ajax: {"url": "http://your.location/apicall/"}});
  
Note: If the source is not an internal name [likethis],  but the handler is (i.e. [pouch]), then ...
          .. if no options object with a dbname is provided, the db name is assumed to be the source name
      Examples: 
        om.putObject('testdb, 'mydoc1', {"title":"My Test Doc"}); //Add mydoc1 to the local pouch db: "testdb"
        om.getObject('testdb', 'mydoc1'); //returns mydoc1 from the local pouch db: "testdb"

Source Handlers:  ("name" = function or name of other handler.)
[any-internal] = when [] is used, these are internal / common handlers for known source data

  "[default]" = the default handler if none is provided, [pouch] by default.

  DATABASE ACCESS
  "[pouch]" = Handler specifically for local pouch storage, where create and destroy requires no special privs
  "[couch]" = Handler for a (usually local) couch database
  "[ajax]" = Handler for any external ajax handler that follows the known protocol

  READ ONLY - AJAX BASED ACCESS
  "[get]": Handler to get a JSON object via ajax get url
  "[html]": Handler to get HTML via ajax get url

*/

(function (ActionAppCore, $) {
    var MyMod = ActionAppCore.module("plugin");
    MyMod.ObjectManager = ObjectManager;
    var ThisApp = null;
    var dataMgr = $.fn.NoSqlDataManager;

    var thisComponentID = "plugin:ObjectManager";

    function ObjectManager(theOptions) {
        var tmpOptions = theOptions || {};
        if (typeof (tmpOptions.app) == 'object') {
            ThisApp = tmpOptions.app;
            if (ThisApp && ThisApp.registerComponent) {
                ThisApp.registerComponent(thisComponentID, this);
            }
        }
    }

    var me = ObjectManager.prototype;
    

    me.getObjectHandler = dataMgr.getDocumentHandler;
    me.putSourceHandler = dataMgr.putSourceHandler;
    //--- By default, getting an object is a one call / reply deal
    //--   By default the return object will have and ["_error"] property which may be ..
     // Format of return _error TBD
     // ToDo: Design / Doc error formats
    me.getObject = getObject;
    function getObject(theSourceName, thePath){
        var dfd = jQuery.Deferred();
        dataMgr.getDocument(theSourceName, thePath).then(
            function(theDoc) {
                dfd.resolve(theDoc);
              },
              function(theError) {
                var tmpRetDoc = {};
                tmpRetDoc._error = theError;
                dfd.resolve(tmpRetDoc);
              }
        )
        return dfd.promise();
    }
    //me.getObjects = dataMgr.getDocuments;
    me.getObjects = getObjects;
    function getObjects(theSourceName, theKeys){
        var dfd = jQuery.Deferred();
        dataMgr.getDocuments(theSourceName, theKeys).then(
            function(theDocs) {
                dfd.resolve(theDocs);
              },
              function(theError) {
                var tmpRetDoc = {};
                tmpRetDoc._error = theError;
                dfd.resolve(tmpRetDoc);
              }
        )
        return dfd.promise();
    }
    
    me.putObject = dataMgr.putDocument;
    me.deleteObject = dataMgr.deleteDocument;

    me.putSourceHandlerDefaults = dataMgr.putSourceHandlerDefaults;
    me.sourceHandlerForPouch = dataMgr.sourceHandlerForPouch;

    me.getDatabaseFromSourceName = dataMgr.getDatabaseFromSourceName;
    me.transformNoSQLDocs = dataMgr.transformNoSQLDocs;
    me.getDatabase = dataMgr.getDatabase;

    window.onFail = function(theFailure){console.log(theFailure)};
    window.onDone = function(theResult){console.log("Done: Results are...", theResult)};

    me.sourceHandlerForNoSQL = dataMgr.sourceHandlerForNoSQL;
    me.sourceHandlerForAjax = dataMgr.sourceHandlerForAjax;
    me.getSourceHandler = dataMgr.getSourceHandler;
    
    me.createAndPopulateDB = dataMgr.createAndPopulateDB;
    me.syncLocalVersion = dataMgr.syncLocalVersion;
    me.pullInitialLocalVersion = dataMgr.pullInitialLocalVersion;
    me.replicateDownLocalVersion = dataMgr.replicateDownLocalVersion;
    
    function runAction(theAction, theSourceObject) {
        if (typeof (me[theAction]) == 'function') {
            me[theAction](theAction, theSourceObject);
        }
    }



    me.init = init;
    function init() {
        ThisApp.registerActionDelegate("_om", runAction);
        return this;
    }



})(ActionAppCore, $);



/*
Author: Joseph Francis
License: MIT

SVG controls Plugin:
 - SVG Control: (n) an interactive controllable object
 
   - SVG Controls have ...
     - Strings that control simple behaviors 
     - Actions to trigger options
     - States to describe / show the situation a control is in
        - Active, Selected, On/Off, Etc.
     - An instruction manual (specs) that provide details on what the control can do
        - Built-in specs make interacting with new controls easy      
*/



(function (ActionAppCore, $) {
    //--- SVG Plugin Add-On Modules --- --- --- --- --- --- --- --- --- --- --- --- 
    ActionAppCore.createModule("SvgControls:catalog");
    ActionAppCore.createModule("SvgControls:extension");

    //--- Modules this plugin will use --- --- --- --- --- --- --- --- --- --- --- --- 
    var MyMod = ActionAppCore.module("plugin");
    var SvgCatalogMod = ActionAppCore.module("SvgControls:catalog");
    var SvgExtendMod = ActionAppCore.module("SvgControls:extension");

    var thisCompName = 'SvgControls';
    var thisCompActionPrefix = '_svg';

    //--- This this component to the Plugin Module
    MyMod[thisCompName] = ThisPageController;


    var ThisApp = null;

    var thisComponentID = "plugin:" + thisCompName;

    //--- Base class for application pages
    function ThisPageController(theOptions) {
        this.options = theOptions || {};
        this.actions = this.options.actions || {};
        var defaults = {};
        if (typeof (this.options.app) == 'object') {
            ThisApp = this.options.app;
            if (ThisApp && ThisApp.registerComponent) {
                ThisApp.registerComponent(thisComponentID, this);
            }
        }
    }
    var me = ThisPageController.prototype;
    //---ToDo: Duplicate, pull from somewhere unified?
    me.controlsBaseURL = "./svg-catalog/controls/";

    me.svgDefsTemplateName = thisCompActionPrefix + ":defs";

    me.init = init;
    function init(theApp) {
        //--- Register this components action delegate prefix
        //- plugins that start with _ are plugins only.
        //- ** Do not use _ for non-plugin delegates
        ThisApp.registerActionDelegate(thisCompActionPrefix, runAction);
        //--- Create Global ID container for SVGs that use IDs, needed to load more than one
        me.initSvgDefsContainer();

        return this;
    }

    me.getNewWorkpace = function (theOptions) {
        return new SvgExtendMod.SvgWorkspace(theOptions);
    }

    function runAction(theAction, theSourceObject) {
        if (typeof (me[theAction]) == 'function') {
            me[theAction](theAction, theSourceObject);
        }
    }

    me.svgDefsTemplateName = thisCompActionPrefix + ":defs";

    //---ToDo: Duplicate, pull from somewhere unified?
    me.controlsBaseURL = "./svg-catalog/controls/";
    me.defsId = 'control-manager-defs-svg';
    //var controlCreateFunctions = {};
    var controlPromises = {};

    me.initSvgDefsContainer = function () {
        //--- Creating this on the fly was an issue in cordova/win
        //     when using position:absolute; top:10000; (removed that part)
        //--- Create Global Defs Area for commonly referenced DEFs from SVGs
        //    ** this is to allow multiple instances of an SVG that references IDs **        
        var tmpNewDiv = $('<div />').appendTo('body');
        tmpNewDiv.html('<svg id="control-manager-defs-svg"></svg>');
        me.svgDefsContainerNode = d3.select('#' + me.defsId).node();
    }
    me.addDefs = function (theDefsNode) {
        me.svgDefsContainerNode.appendChild(theDefsNode)
    }
    /*
    *
    * Function: getControl
    *  - gets a control from cache if avail, else pulls via ajax
    * 
    *  **** This is a way to dynamically load script, 
    *       which can then dynamically load content.
    */
    me.getControl = function (theControlName) {
        var dfd = jQuery.Deferred();
        if (me.hasControl(theControlName)) {
            var tmpNew = me._getNewControl(theControlName);
            dfd.resolve(tmpNew);
        } else {
            var tmpBaseURL = me.controlsBaseURL + theControlName + "/";
            //--- Get the control, when the control loads - it registers itself
            //    Once a control is registered in the SvgCatalogMod module, 
            //      it can be created using the me._getNewControl function
            jQuery.getScript(tmpBaseURL + "control.js")
                .done(function () {
                    dfd.resolve(me._getNewControl(theControlName));
                })
                .fail(function (theError) {
                    console.error("Error loading script " + theError);
                    dfd.reject(theError);
                });
        }

        return dfd.promise();
    }

    me._getNewControl = function (theControlName) {
        var tmpNew = new SvgCatalogMod[theControlName];
        return tmpNew;
    }

    me.hasControl = function (theControlName) {
        return SvgCatalogMod.hasOwnProperty(theControlName);
    }

    me.resolveWhenLoaded = function (theControlName, thePromise) {
        me.controlPromises(theControlName) = thePromise;
    }

})(ActionAppCore, $);

///--- End of the plugin





//--- SvgControl Functionality =========== =========== =========== =========== =========== =========== =========== 
(function (ActionAppCore, $) {

    var ExtendMod = ActionAppCore.module("extension");
    var SvgExtendMod = ActionAppCore.module("SvgControls:extension");

    //--- Base class for application pages
    function ThisExtention() {

    }
    var me = ThisExtention.prototype;

    //-- Every SvgControl has quick access to common setDisplay function
    $.extend(me, ExtendMod.SetDisplay)
    //-- Every SvgControl has built-in pub-sub functionality
    $.extend(me, ExtendMod.PubSub)

    me.createdCount = 0;
    me.loadedControls = {};

    me.getAsObject = getAsObject;
    function getAsObject() {
        var tmpRet = {};
        tmpRet.oid = this.oid;
        tmpRet.cid = this.cid;

        tmpRet.translateX = this.translateX;
        tmpRet.translateY = this.translateY;
        tmpRet.scale = this.scale;

        tmpRet.states = this.states || {};
        return tmpRet;
    }

    me.loadStates = loadStates;
    function loadStates(theStates) {
        var tmpStates = theStates || {};
        for (var aStateName in tmpStates) {
            if (aStateName) {
                var tmpStateValue = tmpStates[aStateName];
                this.setState(aStateName, tmpStateValue);
            }
        }
    }

    //--- This is the parent / default setState function
    me._setState = setState;
    //--- This may be overridden, if so, the this._setState can be called to call the parent version
    me.setState = setState;
    function setState(theState, theValue) {
        this.states[theState] = theValue;
        return true;
    }

    me.getTransform = getTransform;
    function getTransform() {
        var tmpRet = '';
        tmpRet += 'translate(' + this.translateX + ',' + this.translateY + ') ';
        tmpRet += 'scale(' + this.scale + ') ';
        return tmpRet;
    }

    me.refreshLocation = function () {
        this.controlWrap.attr("transform", this.getTransform());
    }


    me.getMousePos = function (thePoint) {
        var tmpThisControl = this;
        var tmpSvgBB = tmpThisControl.svgTopEl.getBBox();
        var p = tmpThisControl.svg.node().createSVGPoint();
        p.x = thePoint.x;
        p.y = thePoint.y;
        var matrix = tmpThisControl.svg.node().getScreenCTM();
        p = p.matrixTransform(matrix.inverse());
        var tmpX = p.x - tmpSvgBB.x;
        var tmpY = p.y - tmpSvgBB.y;
        if (tmpX < 0) {
            tmpX = 0;
        }
        if (tmpY < 0) {
            tmpY = 0;
        }
        return {
            x: tmpX,
            y: tmpY
        }
    }

    me.objectClicked = objectClicked;
    function objectClicked(theEvent) {
        if (this.parentWS && this.parentWS.objectClicked) {
            this.parentWS.objectClicked(theEvent, this);
        }
    }

    me.initControl = initControl;
    function initControl(theParentSVG, theOptions) {
        this.initPubSub();
        //console.log("init control options", theOptions)
        var dfd = jQuery.Deferred();
        this.colorOffset = 0;
        var tmpThisControl = this;

        var tmpOptions = theOptions || {};
        //-- Every control name and title is the same, add to prototype
        this.controlName = tmpOptions.controlName;
        this.controlTitle = tmpOptions.controlTitle;

        //-- Each object has shorthand cid that has the id of the control this object is based on
        tmpThisControl.cid = this.controlName;

        //-- Each object has states that track params that control the object
        //tmpThisControl.states = $.extend({}, tmpOptions.states || {});

        //-- Each object should have access to the SvgControls plugin
        me._svg = ActionAppCore.app.getComponent("plugin:SvgControls");
        me.baseURL = me._svg.controlsBaseURL + tmpThisControl.controlName + "/";

        var tmpFacetName = $(theParentSVG).attr("facet");
        tmpThisControl.svg = d3.select('[facet="' + tmpFacetName + '"]');


        if (typeof (tmpOptions.colorOffset) == 'number') {
            tmpThisControl.colorOffset = tmpOptions.colorOffset;
        }
        var tmpBaseURL = me.baseURL;

        d3.xml(tmpBaseURL + "base-container.svg", function (error, documentFragment) {
            if (error) {
                console.error(error);
                return;
            }

            var tmpSvgNode = documentFragment.getElementsByTagName("svg")[0];


            var tmpOID = theOptions.oid || (tmpThisControl.cid + "-" + me.createdCount++);
            tmpSvgNode.id = tmpOID;
            tmpThisControl.oid = tmpOID;
            tmpThisControl.controlSvg = d3.select(tmpSvgNode);
            tmpThisControl.controlWrap = tmpThisControl.controlSvg.select("#baseLayer");
            tmpThisControl.control = tmpThisControl.controlSvg.select("#layer1");
            tmpThisControl.controlNode = tmpThisControl.control.node();


            if (tmpThisControl.svg) {
                var tmpAddedEl = tmpThisControl.svg.node().appendChild(tmpSvgNode);
                tmpThisControl.svgTopEl = tmpAddedEl;
                if (typeof (tmpOptions.onClick) == 'function') {
                    $(tmpThisControl.svgTopEl).on("click", tmpOptions.onClick);
                }
                //--- always also catch the click event
                $(tmpThisControl.svgTopEl).on("click", tmpThisControl.objectClicked.bind(tmpThisControl));

                if (typeof (tmpOptions.onContextMenu) == 'function') {
                    $(tmpThisControl.svgTopEl).contextmenu(tmpOptions.onContextMenu);
                }
            }

            //--- load all the parts we need one at a time 
            //ToDo: Change this to async and load in order when all received
            d3.xml(tmpBaseURL + tmpThisControl.controlName + ".svg", function (error, documentFragment) {
                if (error) {
                    console.error(error);
                    return;
                }
                var tmpSvgNode = documentFragment.getElementsByTagName("svg")[0];
                // tmpThisControl.svgEl = tmpSvgNode;

                //--- was null, had to redo this -- examine further on why???
                tmpThisControl.control = tmpThisControl.controlSvg.select("#layer1");
                tmpThisControl.controlNode = tmpThisControl.control.node();
                //--- had to move this
                tmpThisControl.control.attr("cid", me.cid);
                tmpThisControl.control.attr("oid", tmpOID);
                //tmpThisControl.events = $({});

                // tmpSvgNode.id = tmpThisControl.controlName + "_" + (me.loadedCount + 1);
                ////console.log("tmpThisControl2",tmpThisControl);
                tmpThisControl.controlNode.appendChild(tmpSvgNode);
                tmpThisControl.svgNode = d3.select(tmpSvgNode);

                var tmpDefsNode = tmpSvgNode.getElementsByTagName("defs")[0];
                //--- Need to load the defs into a global space
                if (!tmpThisControl.loadedControls.hasOwnProperty(tmpThisControl.controlName)) {
                    me._svg.addDefs(tmpDefsNode);
                    me.loadedControls[tmpThisControl.controlName] = true;
                } else {
                    tmpSvgNode.removeChild(tmpDefsNode);
                }
                //me.loadedCount++;

                tmpThisControl.frame = tmpThisControl.svgNode.select("#frame");

                tmpThisControl.translateX = tmpOptions.translateX || 0;
                tmpThisControl.translateY = tmpOptions.translateY || 0;
                tmpThisControl.scale = tmpOptions.scale || 1;
                tmpThisControl.states = {};


                //--- To Do, get message / details when fully loaded and do it then
                setTimeout(function () {
                    tmpThisControl.loadStates(tmpOptions.states || {});
                }, 10);


                tmpThisControl.refreshLocation();




                dfd.resolve(tmpThisControl);


            });
        })
        return dfd.promise();

    }

    //--- return the prototype to be marged with prototype of target object
    //ExtendMod.SvgControl = me;
    SvgExtendMod.SvgControl = me;

})(ActionAppCore, $);








//--- SvgWorkspace Functionality =========== =========== =========== =========== =========== =========== =========== 

(function (ActionAppCore, $) {

    var ExtendMod = ActionAppCore.module("extension");
    var SvgExtendMod = ActionAppCore.module("SvgControls:extension");

    //--- Base class for application pages
    function ThisExtention() {

    }

    var me = ThisExtention.prototype;

    //-- Every SvgWorkspace has built-in pub-sub functionality
    //$.extend(me, ExtendMod.PubSub)
    //-- Every SvgWorkspace has quick access to common setDisplay function
    $.extend(me, ExtendMod.SetDisplay)

    me.removeControl = function (theObjectOrID) {
        var tmpID = theObjectOrID;
        if (typeof (theObjectOrID) == 'object' && theObjectOrID.oid) {
            tmpID = theObjectOrID.oid;
        }
        this.workspaceControls[tmpID] = undefined;
        delete this.workspaceControls[tmpID];
        $(this.svg).find('[oid="' + tmpID + '"]').remove();
    }

    //--- Called by objects when they are clicked
    me.objectClicked = objectClicked;
    function objectClicked(theEvent, theObj) {
        //console.log("object clicked", theEvent, theObj, theDetails)
    }


    me.getAsObject = getAsObject;
    function getAsObject() {
        var tmpRet = {};
        tmpRet.zoomAt = this.zoomAt;
        tmpRet.zoomIncr = this.zoomIncr;

        //--- In order based on svg
        tmpRet.objects = [];
        var tmpAllObjects = $(this.svg).find('[oid]');
        var tmpLen = tmpAllObjects.length;
        if (tmpLen > 0) {
            for (var i = 0; i < tmpLen; i++) {
                var tmpO = tmpAllObjects[i];
                var tmpOID = tmpO.getAttribute('oid');
                var tmpObj = this.workspaceControls[tmpOID];
                if (tmpObj && typeof (tmpObj.getAsObject) == 'function') {
                    var tmpObjDetails = tmpObj.getAsObject();
                    if (tmpObjDetails && tmpObjDetails.oid) {
                        tmpRet.objects.push(tmpObjDetails);
                    }
                }

            }
        }
        return tmpRet;
    }

    me.clear = clear;
    function clear() {
        var tmpAllObjects = $(this.svg).find('[oid]');
        var tmpLen = tmpAllObjects.length;
        if (tmpLen > 0) {
            for (var i = 0; i < tmpLen; i++) {
                var tmpO = tmpAllObjects[i];
                $(tmpO).remove();
                //ToDo: Remove listeners?
            }
        }
        this.activeControl = null;
        this.workspaceControls = {};
        this.controlsAddedAt = {};
        this.zoomAt = 100;
        this.zoomIncr = 10;
    }

    me.loadFromObject = loadFromObject;
    function loadFromObject(theObject) {
        if (typeof (theObject) != 'object') {
            console.error("loadFromObject - Error: No object passed to load.")
            return false;
        }
        var tmpRet = {};

        this.clear();

        this.zoomAt = theObject.zoomAt || this.zoomAt;
        this.zoomIncr = theObject.zoomIncr || this.zoomIncr;
        this.zoomWorkspaceTo(this.zoomAt);

        var tmpObjects = theObject.objects || [];
        var tmpLen = tmpObjects.length;
        if (tmpLen > 0) {
            for (var i = 0; i < tmpLen; i++) {
                var tmpO = tmpObjects[i];
                var tmpOID = tmpO.oid;
                var tmpCID = tmpO.cid;
                //console.log("tmpO", tmpO);
                this.addControl(tmpOID, tmpCID, tmpO)

            }
        }


        return tmpRet;
    }

    me.init = init;
    function init(theOptions) {
        this.originalViewBox = theOptions.viewBox || { x: 0, y: 0, w: 800, h: 800 };
        this.currentViewBox = $.extend({}, this.originalViewBox);
        this.zoomAt = 100;
        this.zoomIncr = 10;
        this.workspaceControls = {};
        this.drag = null;
        this.svg = null;
        this.dPoint = null;
        this.dragOperation = '';

        this.activeControl = null;
        //console.log("INit",this,theOptions)
        me._svg = me._svg || ActionAppCore.app.getComponent("plugin:SvgControls");
        theOptions = theOptions || {};
        this.svg = theOptions.svg || false;
        if (!this.svg) {
            console.error("A svg entry is required to setup a SvgWorkspace")
        }
        if (theOptions.viewBox !== false) {
            this.svg.setAttribute('viewBox', this._getViewBoxString(this.originalViewBox));
        }

        this.AttachListeners();

    }

    me._getViewBoxString = function (theObj) {
        return '' + theObj.x + ' ' + theObj.y + ' ' + theObj.w + ' ' + theObj.h;
    }

    /**
      * addControl
      *    - adds a control to this Workspace
      * 
      * To Use: <any ws>.addControl('', 'some-control-name', {some:options});
      *
      * @param  {String} theObjectID   [A unique id for this workspace]
      *    Note: Use blank to have auto-generated unique id for this workspace
      * @param  {String} theControlName   [The name/id of the control from the control catalog]
      * @param  {Object} theOptions   [standard options object with control options such as scale, transformX, etc]
      * @return void
      */
    me.addControl = function (theObjectID, theControlName, theOptions) {
        var dfd = jQuery.Deferred();
        theOptions = theOptions || {};
        var tmpThis = this;
        tmpThis.controlsAddedAt = tmpThis.controlsAddedAt || {};

        var tmpAt = tmpThis.controlsAddedAt[theControlName] || 0;
        var tmpObjID = theObjectID || '';
        if (tmpObjID == '') {
            for (var i = tmpAt; i < tmpAt + 10000; i++) {
                ///-- find unused slot for this control, ok if it uses one removed, just has to be unique
                var tmpCheck = theControlName + ":" + i;
                if (!tmpThis.workspaceControls.hasOwnProperty(tmpCheck)) {
                    tmpObjID = tmpCheck;
                    tmpThis.controlsAddedAt[theControlName] = i + 1;
                    break;
                }
            }
        }

        $.when(me._svg.getControl(theControlName)).then(
            function (theNewControl) {
                var tmpOptions = { scale: 1 }; //onClick: me.controlClick, 
                if (typeof (theOptions) == 'object') {
                    $.extend(tmpOptions, theOptions);
                }
                tmpOptions.oid = tmpObjID;
                theNewControl.init(tmpThis.svg, tmpOptions);
                tmpThis.workspaceControls[tmpObjID] = theNewControl;
                theNewControl.parentWS = tmpThis;
                dfd.resolve(theNewControl);
            }
        );
        return dfd.promise();
    }

    me.zoomMin = 5;
    me.zoomMax = 400

    me.zoomWorkspace = zoomWorkspace;
    function zoomWorkspace(theZoomIncr) {
        //console.log("theZoomIncr",theZoomIncr)
        var tmpZoomAmt = this.zoomAt + theZoomIncr;
        //console.log("tmpZoomAmt",tmpZoomAmt)
        if (tmpZoomAmt < me.zoomMin) {
            tmpZoomAmt = me.zoomMin;
        }
        if (tmpZoomAmt > me.zoomMax) {
            tmpZoomAmt = me.zoomMax;
        }
       
        //console.log("tmpZoomAmt",tmpZoomAmt)
        this.zoomWorkspaceTo(tmpZoomAmt)
    }
    me.zoomWorkspaceUp = zoomWorkspaceUp;
    function zoomWorkspaceUp(theAmt) {
        this.zoomWorkspace(theAmt || this.zoomIncr)
    }
    me.zoomWorkspaceDown = zoomWorkspaceDown;
    function zoomWorkspaceDown(theAmt) {
        this.zoomWorkspace(0-(theAmt || this.zoomIncr))
    }   

    me.zoomWorkspaceTo = zoomWorkspaceTo;
    function zoomWorkspaceTo(theNewZoomPercent) {
        //        //console.log("zoomWorkspaceTo theNewZoomPercent",theNewZoomPercent);
        var tmpPerc = theNewZoomPercent;
        if (tmpPerc < 1) {
            tmpPerc = tmpPerc * 100;
        }
        //      //console.log("zoomWorkspaceTo tmpPerc",tmpPerc,this.originalViewBox.w);

        this.zoomAt = tmpPerc;
        this.currentViewBox.w = (this.originalViewBox.w / (this.zoomAt / 100));
        this.currentViewBox.h = (this.originalViewBox.h / (this.zoomAt / 100));
        this.svg.setAttribute('viewBox', me._getViewBoxString(this.currentViewBox));

    }

    // me.refreshUI = refreshUI
    // function refreshUI() {
    //     var tmpSelectedControlName = ''
    //     if (this.selectedControl) {
    //         tmpSelectedControlName = this.selectedControl.text;
    //     }
    //     ThisApp.loadFacet('dash:selected-control', tmpSelectedControlName, '', me.getParent$())
    // }

    // var this.drag = null;
    // var svg = null;
    // var this.dPoint = null;

    me.AttachListeners = AttachListeners;
    function AttachListeners() {
        //console.log("AttachListeners",this.svg);
        this.svg.onmousedown = DragProcess.bind(this);
        this.svg.onmousemove = DragProcess.bind(this);
        this.svg.onmouseup = DragProcess.bind(this);
        $(document.body).on('mouseup', DragUp.bind(this));
    }


    me.DragUp = DragUp;
    function DragUp(e) {
        if (this.drag) {
            e.preventDefault();
            e.stopPropagation();
        }

        this.drag = null;
        this.dragOperation = '';
        if (this.activeControl) {
            if (this.dragOperation == 's') {
                this.activeControl.translateX = 0;
                this.activeControl.translateY = 0;

            }
            this.activeControl = false;
        }
    }

    this.DragProcess = DragProcess;
    function DragProcess(e) {

        var t = e.target, id = t.id, et = e.type;
        if (e.ctrlKey == true || e.altKey == true) {
            if (e.ctrlKey == true) {
                this.dragOperation = 'm';
            } else {
                this.dragOperation = 's';
            }
            e.preventDefault();
            e.stopPropagation();
                this.MoveDrag(e);
        }

        // stop drag no matter what
        if ((et == "mouseup")) {
            //console.log("DragUp");
            //this.drag.className.baseVal="draggable";
            this.drag = null;
            this.dragOperation = '';
            if (this.activeControl) {
                if (this.dragOperation == 's') {
                    this.activeControl.translateX = 0;
                    this.activeControl.translateY = 0;

                }
                this.activeControl = false;
            }
        }
    }

    //var this.activeControl = false;

    // Drag function that needs to be modified;//
    me.MoveDrag = MoveDrag;
    function MoveDrag(e) {

        var t = e.target, id = t.id, et = e.type; m = MousePos.bind(this)(e);
        //        //console.log("MoveDrag",et,m)

        if (!this.drag && (et == "mousedown")) {
            var tmpParent$ = ($(t).closest('[oid]'));
            //            //console.log("tmpParent$",tmpParent$);
            if (!tmpParent$ || tmpParent$.length == 0) {
                return;
            }

            var tmpOID = tmpParent$.attr("oid") || '';
            var tmpScale = 1;
            var tmpControl = this.workspaceControls[tmpOID];
            if (tmpControl) {
                this.activeControl = tmpControl;
                tmpScale = this.activeControl.scale;
            }
            var tmpParent = tmpParent$[0].parentNode;
            if (!tmpParent._x) {
                tmpParent._x = tmpControl.translateX;
                tmpParent._y = tmpControl.translateY;

            }

            this.dPoint = m;
            this.dPoint.scale = tmpScale;
            // //console.log("setting drag",tmpParent)
            this.drag = tmpParent;

            //this.drag = tmpControl.controlWrap[0];
        }

        // drag the spawned/copied draggable element now
        if (this.drag && (et == "mousemove")) {

            var tmpScale = 1;
            var tmpX = 0;
            var tmpY = 0;

            if (this.activeControl) {

                if (this.dragOperation == 's') {

                    tmpX = this.activeControl.translateX;
                    tmpY = this.activeControl.translateY;
                    this.dPoint.origX = this.dPoint.origX || this.dPoint.x;
                    var tmpDiff = m.x - this.dPoint.x;
                    this.dPoint.x = m.x;

                    var tmpDiffOrig = m.x - this.dPoint.origX;

                    var tmpDiffPerc = Math.abs(tmpDiffOrig) / 500;
                    var tmpMoveAmt = .02;
                    if (tmpDiffPerc > .4) {
                        tmpMoveAmt *= 5;
                    }
                    if (tmpDiff > 0) {
                        this.activeControl.scale += tmpMoveAmt
                    } else {
                        this.activeControl.scale -= tmpMoveAmt
                    }


                } else {
                    this.drag._x += m.x - this.dPoint.x;
                    this.drag._y += m.y - this.dPoint.y;
                    this.dPoint = m;
                    tmpX = this.drag._x;
                    tmpY = this.drag._y;
                    this.activeControl.translateX = this.drag._x;
                    this.activeControl.translateY = this.drag._y;
                    tmpScale = this.activeControl.scale;
                }
                tmpScale = this.activeControl.scale;


                //this.activeControl.translateX = this.drag._x;
                //this.activeControl.translateY = this.drag._y;


            }

            this.drag.setAttribute("transform", "translate(" + tmpX + "," + tmpY + ") scale(" + (tmpScale) + "," + tmpScale + ") ");
        }

    }


    // adjust mouse position to the matrix of SVG & screen size
    me.MousePos = MousePos;
    function MousePos(event) {
        //  //console.log("MousePos",this)
        return this.getMousePos({ x: event.clientX, y: event.clientY })
    }

    //--- Get Mouse Position relative to the related SVG workspace
    me.getMousePos = function (thePoint) {

        var p = this.svg.createSVGPoint();

        p.x = thePoint.x;
        p.y = thePoint.y;
        var matrix = this.svg.getScreenCTM();
        p = p.matrixTransform(matrix.inverse());
        var tmpX = p.x;
        var tmpY = p.y;
        if (tmpX < 0) {
            tmpX = 0;
        }
        if (tmpY < 0) {
            tmpY = 0;
        }
        return {
            x: tmpX,
            y: tmpY
        }
    }

    //--- return the prototype to be marged with prototype of target object

    SvgExtendMod.SvgWorkspace = ThisExtention;

})(ActionAppCore, $);



