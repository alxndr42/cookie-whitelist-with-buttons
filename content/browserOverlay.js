// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

const CWWB = {
  HIDE_ADD_PREF    : "extensions.cwwb.hide_add_button",
  HIDE_RECORD_PREF : "extensions.cwwb.hide_record_button",
  
  prefs  : undefined,
  add    : undefined,
  record : undefined,
  
  _windowCount : undefined,
  
  _countWindows : function() {
    var mediator =
      Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(
        Components.interfaces.nsIWindowMediator);
    var enumerator = mediator.getEnumerator("navigator:browser");
    
    var count = 0;
    while (enumerator.hasMoreElements()) {
      enumerator.getNext();
      count++;
    }
    
    this._windowCount = count;
  },
  
  showAddDialog : function() {
    window.openDialog(
      "chrome://cwwb/content/dialog/addSite.xul",
      "_blank",
      "modal,centerscreen",
      gBrowser.currentURI.host);
  },
  
  showWhitelist : function() {
    var properties = document.getElementById("cwwb-properties");
    var params = {
      blockVisible   : false,
      sessionVisible : true,
      allowVisible   : true,
      prefilledHost  : "",
      permissionType : "cookie",
      windowTitle    : properties.getString("whitelist.title"),
      introText      : properties.getString("whitelist.intro")
    };
    
    window.openDialog(
      "chrome://browser/content/preferences/permissions.xul",
      "Browser:Permissions",
      "dialog=no,centerscreen",
      params); 
  },
  
  showCookies : function() {
    window.openDialog(
      "chrome://browser/content/preferences/cookies.xul",
      "Browser:Cookies",
      "dialog=no,centerscreen",
      null);
  },
  
  log : function(aMessage) {
    var console = Components.classes["@mozilla.org/consoleservice;1"].
	  getService(Components.interfaces.nsIConsoleService);
    console.logStringMessage(aMessage);
  },
  
  isFirstWindow : function() {
    return this._windowCount == 1;
  },
  
  init : function() {
    this.prefs =
      Components.classes["@mozilla.org/preferences-service;1"].getService(
        Components.interfaces.nsIPrefService);
    this.add = CWWBAddModel;
    this.record = CWWBRecordModel;
    this._countWindows();
    
    CWWBAddModel.init();
    CWWBRecordModel.init();
    CWWBStatusbar.init();
  },
  
  cleanup : function() {
    CWWBStatusbar.cleanup();
    CWWBRecordModel.cleanup();
    CWWBAddModel.cleanup();
  }
}

window.addEventListener("load", function() { CWWB.init(); }, false);
window.addEventListener("unload", function() { CWWB.cleanup(); }, false);
