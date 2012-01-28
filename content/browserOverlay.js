// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

const CWWB = {
  TOOLBAR_INSTALL_PREF : "extensions.cwwb.toolbar_install",
  
  add    : undefined,
  record : undefined,
  
  _updateContextMenu : function() {
    var acceptAll = document.getElementById("cwwb-context-accept-all");
    acceptAll.setAttribute("checked", this.record.isAcceptAll());
  },
  
  _checkToolbarInstall : function() {
    var installed = Application.prefs.getValue(this.TOOLBAR_INSTALL_PREF, false);
    if (installed)
      return;
    
    // if CWWB is already in the browser, mark it as installed
    var cwwb = document.getElementById("cwwb-toolbar");
    if (cwwb) {
      Application.prefs.setValue(this.TOOLBAR_INSTALL_PREF, true);
      return;
    }
    
    var toolbar = document.getElementById("nav-bar");
    if (!toolbar)
      return;
    
    try {
      toolbar.insertItem("cwwb-toolbar");
      toolbar.setAttribute("currentset", toolbar.currentSet);
      document.persist(toolbar.id, "currentset");
      Application.prefs.setValue(this.TOOLBAR_INSTALL_PREF, true);
      CWWBToolbar.updateAll();
    } catch (e) {
      Application.console.log("Error during toolbar install: " + e);
    }
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
  
  toggleAcceptAll : function() {
    this.record.toggleAcceptAll();
  },
  
  toggleRecord : function() {
    this.record.toggle();
  },
  
  modelUpdate : function(aModel) {
    this._updateContextMenu();
  },
  
  init : function() {
    Components.utils.import("resource://gre/modules/Services.jsm");
    
    this.add = CWWBAddModel;
    this.record = CWWBRecordModel;
    
    CWWBAddModel.init();
    CWWBRecordModel.init();
    CWWBToolbar.init();
    
    this.record.addListener(this);
    this._updateContextMenu();
    this._checkToolbarInstall();
  },
  
  cleanup : function() {
    CWWBToolbar.cleanup();
    CWWBRecordModel.cleanup();
    CWWBAddModel.cleanup();
  }
}

window.addEventListener("load", function() { CWWB.init(); }, false);
window.addEventListener("unload", function() { CWWB.cleanup(); }, false);
