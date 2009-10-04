// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

const CWWBPermissionTracker = {
  _pManager : undefined,
  _pCache   : undefined,
  _tabCo    : undefined,
  
  // Checks the current URI against permission cache or manager.
  checkCurrentURI : function() {
    const uri  = gBrowser.currentURI;
    const host = this._filterHost(uri);
    const idx  = this._tabCo.selectedIndex;
    
    var perm = null;
    if (host != null) {
      if (host == this._pCache[idx].host) {
        perm = this._pCache[idx].perm;
      }
      else {
        perm = this._pManager.testPermission(uri, "cookie");
        this._pCache[idx].host = host;
        this._pCache[idx].perm = perm;
      }
    }
    else {
      this._pCache[idx].host = null;
      this._pCache[idx].perm = null;
    }
    CWWBAdd.updateState(host, perm);
  },
  
  tabOpen : function(aTab, aIndex) {
    this._pCache.splice(aIndex, 0, new CWWBCacheItem(aTab, null ,null));
  },
  
  tabClose : function(aTab, aIndex) {
    this._pCache.splice(aIndex, 1);
  },
  
  tabMove : function(aTab, aIndex) {
    var oldIndex;
    for (var i = 0; i < this._pCache.length; i++) {
      if (this._pCache[i].tab == aTab) {
        oldIndex = i;
        break;
      }
    }
    
    const temp = this._pCache[oldIndex];
    this._pCache.splice(oldIndex, 1);
    this._pCache.splice(aIndex, 0, temp);
  },
  
  permissionChange : function(aChange, aHost, aPermission) {
    this._syncCache();
    this.checkCurrentURI();
  },
  
  // Creates a cache item for every tab.
  _syncCache : function() {
    const browsers = gBrowser.browsers;
    this._pCache.length = browsers.length;
    
    for (var i = 0; i < browsers.length; i++) {
      const tab  = this._tabCo.getItemAtIndex(i);
      const uri  = browsers[i].currentURI;
      const host = this._filterHost(uri);
      
      var perm;
      if (host != null)
        perm = this._pManager.testPermission(uri, "cookie");
      else
        perm = null;
      
      this._pCache[i] = new CWWBCacheItem(tab, host, perm);
    }
  },
  
  // Returns the host of the given HTTP(S) URI, or null.
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
    this._tabCo = gBrowser.tabContainer;
    
    this._syncCache();
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

// Stores one tuple of browser tab, URI host and permission in the cache.
// Host and permission can be null.
function CWWBCacheItem(aTab, aHost, aPerm) {
  this.tab  = aTab;
  this.host = aHost;
  this.perm = aPerm;
}
