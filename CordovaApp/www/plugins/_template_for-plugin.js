/*
Author: YOUR NAME

License: MIT

YourPluginNameHere Plugin:
 - About your plugin
      
*/

(function (EasyAppCore, $) {
    var MyMod = EasyAppCore.module("plugin");
    MyMod.YourPluginNameHere = ThisPageController;
    
    var ThisApp = null;

    var thisComponentID = "plugin:YourPluginNameHere";

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
    

    function runAction(theAction, theSourceObject) {
        if (typeof (me[theAction]) == 'function') {
            me[theAction](theAction, theSourceObject);
        }
    }

    me.test = test;
    function test() {
        return ('Puppets test');
    }

    me.testAction = function(){
        alert('Puppets Test Worked');
    }

    me.init = init;
    function init(theApp) {
        ThisApp.registerActionDelegate("_pup", runAction);        
        return this;
    }




    //--- Impl ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 
    //--- Impl ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 
    //--- Impl ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 
    

    //--- Templates ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 
   //If Needed

    
})(EasyAppCore, $);



