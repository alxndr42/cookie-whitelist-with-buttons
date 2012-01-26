// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

const CWWBAddModel = {
  STATE_UNLISTED          : 0,
  STATE_WHITELIST         : 1,
  STATE_WHITELIST_SESSION : 2,
  STATE_BLACKLIST         : 3,
  STATE_UNKNOWN           : 4,
  
  PERM_DEFAULT : Components.interfaces.nsICookiePermission.ACCESS_DEFAULT,
  PERM_ALLOW   : Components.interfaces.nsICookiePermission.ACCESS_ALLOW,
  PERM_DENY    : Components.interfaces.nsICookiePermission.ACCESS_DENY,
  PERM_SESSION : Components.interfaces.nsICookiePermission.ACCESS_SESSION,
  
  nsIP   : Components.interfaces.nsIPermission,
  nsIWPL : Components.interfaces.nsIWebProgressListener,
  nsISWR : Components.interfaces.nsISupportsWeakReference,
  nsIS   : Components.interfaces.nsISupports,
  
  _currentHost : null,
  _currentPerm : null,
  _state       : this.STATE_UNKNOWN,
  _listeners   : [],
  
  // Checks the current host's permission
  _checkCurrentHost : function(aForce) {
    var uri = gBrowser.currentURI;
    var host = this._filterHost(uri);
    if (host == this._currentHost && !aForce)
      return;
    
    var perm = null;
    if (host != null)
      perm = Services.perms.testPermission(uri, "cookie");
    if (host == this._currentHost && perm == this._currentPerm)
      return;
    
    this._updateState(host, perm);
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
  
  _updateState : function(aHost, aPerm) {
    this._currentHost = aHost;
    this._currentPerm = aPerm;
    
    switch (aPerm) {
       case this.PERM_ALLOW:
        this._state = this.STATE_WHITELIST; 
        break;
      case this.PERM_DENY:
        this._state = this.STATE_BLACKLIST
        break;
      case this.PERM_SESSION:
        this._state = this.STATE_WHITELIST_SESSION;
        break;
      default:
        if (aHost != null)
          this._state = this.STATE_UNLISTED;
        else
          this._state = this.STATE_UNKNOWN;
        break;
    }
    this._notifyListeners();
  },
  
  _notifyListeners : function() {
    for each (var listener in this._listeners)
      listener.modelUpdate(this);
  },
  
  addListener : function(aListener) {
    this._listeners.push(aListener);
  },
  
  getState : function() {
    return this._state;
  },
  
  QueryInterface : function(aIID) {
    if (
      aIID.equals(this.nsIWPL) ||
      aIID.equals(this.nsISWR) ||
      aIID.equals(this.nsIS))
        return this;
    
    throw Components.results.NS_NOINTERFACE;
  },
  
  onLocationChange : function() {
    this._checkCurrentHost(false);
  },
  
  onProgressChange : function() {},
  onStateChange : function() {},
  onStatusChange : function() {},
  onSecurityChange : function() {},
  
  observe : function (aSubject, aTopic, aData) {
    if (aTopic != "perm-changed")
      return;
    if (!(aSubject instanceof this.nsIP) || aSubject.type != "cookie")
      return;
    
    this._checkCurrentHost(true);
  },
  
  init : function() {
    this._checkCurrentHost(true);
    
    gBrowser.addProgressListener(this);
    Services.obs.addObserver(this, "perm-changed", false);
  },
  
  cleanup : function() {
    Services.obs.removeObserver(this, "perm-changed");
  }
}
