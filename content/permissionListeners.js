// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

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
  onSecurityChange : function() {},
  onStateChange : function() {},
  onStatusChange : function() {},
  
  init : function() {
    gBrowser.addProgressListener(
      CWWBProgressListener,
      Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
  },
  
  cleanup : function() {
  }
};

// Observes tab open/close/move events
const CWWBTabListener = {
  _tabCo : undefined,
  
  _onTabOpen : function(aEvent) {
    const tab = aEvent.target;
    const idx = this._tabCo.getIndexOfItem(tab);
    CWWBPermissionTracker.tabOpen(tab, idx);
  },
  
  _onTabClose : function(aEvent) {
    const tab = aEvent.target;
    const idx = this._tabCo.getIndexOfItem(tab);
    CWWBPermissionTracker.tabClose(tab, idx);
  },
  
  _onTabMove : function(aEvent) {
    const tab = aEvent.target;
    const idx = this._tabCo.getIndexOfItem(tab);
    CWWBPermissionTracker.tabMove(tab, idx);
  },
  
  init : function() {
    this._tabCo = gBrowser.tabContainer;
    this._tabCo.addEventListener(
      "TabOpen",
      function(event) { CWWBTabListener._onTabOpen(event); },
      false);
    this._tabCo.addEventListener(
      "TabClose",
      function(event) { CWWBTabListener._onTabClose(event); },
      false);
    this._tabCo.addEventListener(
      "TabMove",
      function(event) { CWWBTabListener._onTabMove(event); },
      false);
  },
  
  cleanup : function() {
  }
};

// Observes cookie permission changes
const CWWBPermissionListener = {
  nsIP : Components.interfaces.nsIPermission,
  
  _obsService : undefined,
  
  observe : function (aSubject, aTopic, aData) {
    if (aTopic != "perm-changed")
      return;
    if (!(aSubject instanceof this.nsIP) || aSubject.type != "cookie")
      return;
    
    CWWBPermissionTracker.permissionChange(aData, aSubject.host, aSubject.capability);
  },
  
  init : function() {
    this._obsService =
      Components.classes["@mozilla.org/observer-service;1"].getService(
        Components.interfaces.nsIObserverService);
    this._obsService.addObserver(this, "perm-changed", false);
  },
  
  cleanup : function() {
    this._obsService.removeObserver(this, "perm-changed");
  }
};
