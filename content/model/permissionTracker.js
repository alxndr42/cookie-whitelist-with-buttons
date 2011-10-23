// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

const CWWBPermissionTracker = {
  nsIP : Components.interfaces.nsIPermission,
  
  _pManager : undefined,
  _currentHost : undefined,
  
  // Checks the current URI's permission
  checkCurrentURI : function() {
    const uri = gBrowser.currentURI;
    const host = this._filterHost(uri);
    
    if (host == this._currentHost)
      return;
    
    var perm = null;
    if (host != null)
      perm = this._pManager.testPermission(uri, "cookie");
    this._currentHost = host;
    CWWBAdd.updateState(host, perm);
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
  
  observe : function (aSubject, aTopic, aData) {
    if (aTopic != "perm-changed")
      return;
    if (!(aSubject instanceof this.nsIP) || aSubject.type != "cookie")
      return;
    
    this._currentHost = null;
    this.checkCurrentURI();
  },
  
  init : function() {
    this._pManager =
      Components.classes["@mozilla.org/permissionmanager;1"].getService(
        Components.interfaces.nsIPermissionManager);
    this._currentHost = null;
    this.checkCurrentURI();
    
    CWWBProgressListener.init();
    const obsService =
      Components.classes["@mozilla.org/observer-service;1"].getService(
        Components.interfaces.nsIObserverService);
    obsService.addObserver(this, "perm-changed", false);
  },
  
  cleanup : function() {
    const obsService =
      Components.classes["@mozilla.org/observer-service;1"].getService(
        Components.interfaces.nsIObserverService);
    obsService.removeObserver(this, "perm-changed");
  }
};

// Observes URI change events (page load, tab switch, etc.)
const CWWBProgressListener = {
  nsIWPL : Components.interfaces.nsIWebProgressListener,
  nsISWR : Components.interfaces.nsISupportsWeakReference,
  nsIS   : Components.interfaces.nsISupports,
  
  QueryInterface : function(aIID) {
    if (
      aIID.equals(this.nsIWPL) ||
      aIID.equals(this.nsISWR) ||
      aIID.equals(this.nsIS))
        return this;
    
    throw Components.results.NS_NOINTERFACE;
  },
  
  onLocationChange : function() {
    CWWBPermissionTracker.checkCurrentURI();
  },
  
  onProgressChange : function() {},
  onStateChange : function() {},
  onStatusChange : function() {},
  onSecurityChange : function() {},
  
  init : function() {
    gBrowser.addProgressListener(CWWBProgressListener);
  }
};
