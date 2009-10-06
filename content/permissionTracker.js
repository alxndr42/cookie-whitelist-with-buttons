// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

function log(aMessage) {
    const console =
      Components.classes["@mozilla.org/consoleservice;1"].getService(
        Components.interfaces.nsIConsoleService);
    console.logStringMessage(aMessage);
}

const CWWBPermissionTracker = {
  _pManager : undefined,
  _pCache   : undefined,
  
  // Checks the current URI against permission cache or manager
  checkCurrentURI : function() {
    const uri  = gBrowser.currentURI;
    const host = this._filterHost(uri);
log("checkCurrentURI: " + host);
    var perm = null;
    
    if (host != null) {
      if (this._pCache[host] == undefined) {
log("cache miss");
        perm = this._pManager.testPermission(uri, "cookie");
        this._pCache[host] = perm;
      }
      else {
log("cache hit");
        perm = this._pCache[host];
      }
    }
    CWWBAdd.updateState(host, perm);
  },
  
  // Updates the permission cache when a tab is closed
  tabClose : function(aURI) {
    const tabHost = this._filterHost(aURI);
log("tabClose: " + tabHost);
    if (tabHost == null)
      return;
    
    const browsers = gBrowser.browsers;
    var count = 0;
    for (var i = 0; i < browsers.length; i++) {
      const host = this._filterHost(browsers[i].currentURI);
      if (host == tabHost)
        count++;
    }
    if (count == 1) {
log("cache eviction by tab close");
      delete this._pCache[tabHost];
    }
  },
  
  // Resets the permission cache on whitelist edits
  permissionChange : function(aChange, aHost, aPermission) {
    if (aHost == null)
      return;
    
log ("whitelist edit, resetting cache");
    this._pCache = [];
    this.checkCurrentURI();
  },
  
  // Returns the host of the given HTTP(S) URI, or null
  _filterHost : function(aURI) {
    if (aURI == null)
      return null;
    
    if (aURI.schemeIs("http") || aURI.schemeIs("https")) {
      try {
        return aURI.host;
      }
      catch (e) {
        return null;
      }
    }
    
    return null;
  },
  
  init : function() {
    this._pManager =
      Components.classes["@mozilla.org/permissionmanager;1"].getService(
        Components.interfaces.nsIPermissionManager);
    this._pCache = [];
    this.checkCurrentURI();
    
    CWWBProgressListener.init();
    CWWBTabListener.init();
    CWWBPermissionListener.init();
  },
  
  cleanup : function() {
    CWWBProgressListener.cleanup();
    CWWBTabListener.cleanup();
    CWWBPermissionListener.cleanup();
  }
};
