// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

function LOG(aMessage) {
  const console =
    Components.classes["@mozilla.org/consoleservice;1"].getService(
      Components.interfaces.nsIConsoleService);
  console.logStringMessage(aMessage);
}

function LOG_PROPS(aObject, aName) {
  var result = "Properties of " + aName + ":\n";
  for (var prop in aObject)
    result += prop + " = " + aObject[prop] + "\n";
  LOG(result);
}

const CWWBPermissionTracker = {
  NSIPERM : Components.interfaces.nsIPermission,
  
  _obsService : undefined,
  _pManager : undefined,
  _currentHost : undefined,
  
  // Checks the current URI's permission
  checkCurrentURI : function() {
    const uri  = gBrowser.currentURI;
    const host = this._filterHost(uri);
    
    if (host == this._currentHost)
	  return;
	
    var perm = null;
    if (host != null)
{
LOG("Test: " + host);
      perm = this._pManager.testPermission(uri, "cookie");
}
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
    if (!(aSubject instanceof this.NSIPERM) || aSubject.type != "cookie")
      return;
    if (aSubject.host != this._currentHost)
      return;
    
LOG("Permission change on current host");
    this._currentHost = null;
    this.checkCurrentURI();
  },
  
  init : function() {
    this._pManager =
      Components.classes["@mozilla.org/permissionmanager;1"].getService(
        Components.interfaces.nsIPermissionManager);
    this._currentHost = null;
    this.checkCurrentURI();
    
    this._obsService =
      Components.classes["@mozilla.org/observer-service;1"].getService(
        Components.interfaces.nsIObserverService);
    this._obsService.addObserver(this, "perm-changed", false);
    CWWBProgressListener.init();
  },
  
  cleanup : function() {
    this._obsService.removeObserver(this, "perm-changed");
    CWWBProgressListener.cleanup();
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
  
  init : function() {
    gBrowser.addProgressListener(
      CWWBProgressListener,
      Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
  },
  
  cleanup : function() {
  }
};

