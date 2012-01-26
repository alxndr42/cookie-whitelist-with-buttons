// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

const CWWB = {
  add    : undefined,
  record : undefined,
  
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
  
  toggleRecord : function() {
    this.record.toggle();
  },
  
  init : function() {
    Components.utils.import("resource://gre/modules/Services.jsm");
    
    this.add = CWWBAddModel;
    this.record = CWWBRecordModel;
    
    CWWBAddModel.init();
    CWWBRecordModel.init();
    CWWBToolbar.init();
  },
  
  cleanup : function() {
    CWWBToolbar.cleanup();
    CWWBRecordModel.cleanup();
    CWWBAddModel.cleanup();
  }
}

window.addEventListener("load", function() { CWWB.init(); }, false);
window.addEventListener("unload", function() { CWWB.cleanup(); }, false);
