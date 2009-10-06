// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

const CWWBPermissionTracker = {
  _pManager : undefined,
  _pCache   : undefined,
  
  // Checks the current URI against permission cache or manager
  checkCurrentURI : function() {
    const uri  = gBrowser.currentURI;
    const host = this._filterHost(uri);
    var perm = null;
    
    if (host != null) {
      if (this._pCache[host] == undefined) {
        perm = this._pManager.testPermission(uri, "cookie");
        this._pCache[host] = perm;
      }
      else {
        perm = this._pCache[host];
      }
    }
    CWWBAdd.updateState(host, perm);
  },
  
  // Updates the permission cache when a tab is closed
  tabClose : function(aURI) {
    const tabHost = this._filterHost(aURI);
    if (tabHost == null)
      return;
    
    const browsers = gBrowser.browsers;
    var count = 0;
    for (var i = 0; i < browsers.length; i++) {
      const host = this._filterHost(browsers[i].currentURI);
      if (host == tabHost)
        count++;
    }
    if (count == 1)
      delete this._pCache[tabHost];
  },
  
  // Resets the permission cache on whitelist edits
  permissionChange : function(aChange, aHost, aPermission) {
    if (aHost == null)
      return;
    
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
