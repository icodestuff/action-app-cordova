# Action Applications for Cordova
* Libraries Works in both Cordova and Node.js / standard web (at the same time)
* Designed to help create web / mobile applications with ease
* Author: Joseph Francis
* License: MIT
* 2018

## About Action App  

### What is an Action?
 - An action is a registered function with a name that sends to calling object
   - the calling object contains the params needed for the function

 - Once an action is registered, there are lots of ways to call it.

   The primary way to call an action is to add an attribute to any element with the name "action".

   Example:
```
     <div action="doSomethingCool">Do it!</div>
```
   - and when clicked, something cool will happen.

    How? You create a function called doSomethingCool and do cool stuf there..

    Example:
    ==================
    In the HTML you have ... 
```
    <button action="doSomethingCool" group="coolStuff" item="fred">Show Fred</button>
```


    In your page, you add this ...
```
    ThisPage.doSomethingCool = function (theAction, theTarget) {
        var tmpParams = ThisApp.getAttrs(theTarget, ['group', 'item']);
        //--- returns {group:"coolStuff", item:"fred"}
        ThisPage.doSomethingElseWithThisAsParams(tmpParams);    
    }
```
    Done.


## Action Application Demo
This is a super simple but responsive application that uses the following libraries at the core.
* jQuery
* Semantic UI
* jsRender or Handlebars
* layout
* toastr (moving away from this)

## Design Goals
The design goal for this application was to have a super simple yet modular, responsive and powerful starting point for general applications and developer testing.

## Design Concepts ...
* Actions can be assigned to any element using the "action" attribute.  This will cause the action to be triggered when clicked. 
* Triggered action receive action name and  target element so that attributes and other aspects of the related DOm  control the end result.
* Define and use "facets" where dynamic content is loaded and manipulated.
* Uses templating engines and/or standard code can populate content in facets or anywhere in the application.
* A module base application is provided where modules can be plugged in.  The modules should be in their own function "bubble", making it easy to separate parts of the code to isolated memory spaces.
* A standard site frameork and navigation system is provided that handles the navigational menus in a responsive way and control the hiding / showing of navigational pages on the site.
* A simple application lifecycle is implemented, allowing site pages to know when the pages is loaded and activated.


## Cordova Coolness
While the environment is well suited for all web development, this package is specifically designed to be able to create Cordova compiant applications, quickly and easily.

## Getting Started
* Download and install node.js, assure npm is working
* Download and install Android Studio, setup an emulator, create a Hello World application and deploy to the emulator and your phone.
* Clone / download this repo and load it up
* Assure you have Visual Code or similar
* Open the base directory in the console / command prompt

To run on a webpage .. at the console type this ...
- npm install
- npm start
Then open the browser to
[http://localhost:7070/]

To install for android ...
 - cd CordovaApp
 - cordova platform add android
 - cd .. (to go back)

To run on an android emulator ..
 - ./emulate

To run on an android phone ..
 - ./tophone

Enjoy ...

