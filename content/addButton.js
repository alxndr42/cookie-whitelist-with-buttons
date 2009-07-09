// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

const CWWBAdd = {
  REMOVE_WWW_PREF       : "extensions.cwwb.remove_www",
  SELECT_SUBDOMAIN_PREF : "extensions.cwwb.select_subdomain",
  
  PERM_DEFAULT : Components.interfaces.nsICookiePermission.ACCESS_DEFAULT,
  
  _addButton       : undefined,
  _clickable       : undefined,
  _tooltip         : undefined,
  _currentHost     : undefined,
  _currentPerm     : undefined,
  _prefBranch      : undefined,
  _removeWWW       : undefined,
  _selectSubdomain : undefined,
  
  setNeutralState : function() {
    this._clickable = false;
    this._addButton.src = "chrome://cwwb/skin/add-off.png";
    this._addButton.tooltipText = "";
    this._currentHost = null;
    this._currentPerm = this.PERM_DEFAULT;
  },
  
  updateState : function(aHost, aPerm) {
    if (aHost == this._currentHost && aPerm == this._currentPerm)
      return;
    
    if (aPerm == this.PERM_DEFAULT) {
      this._clickable = true;
      this._addButton.src = "chrome://cwwb/skin/add-on.png";
      this._addButton.tooltipText = this._tooltip;
      this._currentHost = aHost;
      this._currentPerm = aPerm;
    }
    else {
      this.setNeutralState();
    }
  },
  
  _onClick : function(aEvent) {
    if (aEvent.button != 0)
      return false;
    if (!this._clickable)
      return true;
    
    const host = this._getHost();
    window.openDialog(
      "chrome://cwwb/content/addDialog.xul",
      "_blank",
      "modal,centerscreen",
      host,
      this._getSelectionEnd(host));
    
    return true;
  },
  
  _getHost : function() {
    var host = gBrowser.currentURI.host;
    
    if (this._removeWWW && host.indexOf("www.") == 0)
      host = host.substring(4);
    
    return host;
  },
  
  _getSelectionEnd : function(aHost) {
    if (!this._selectSubdomain)
      return 0;
    
    const parts = aHost.split(".");
    if (parts.length < 3)
      return 0;
    
    const tld = parts[parts.length - 1];
    var spare = 0;
    if (tld.length < 3)
      spare = 3;
    else
      spare = 2;
    
    var end = 0;
    for (i = parts.length - spare - 1; i >= 0; i--)
      end += parts[i].length + 1;
    return end;
  },
  
  observe : function(aSubject, aTopic, aData) {
    if (aTopic != "nsPref:changed")
      return;
    
    if (aData == this.REMOVE_WWW_PREF) {
      this._syncRemoveWWWPref();
    }
    else
    if (aData == this.SELECT_SUBDOMAIN_PREF) {
      this._syncSelectSubdomainPref();
    }
  },
  
  _syncRemoveWWWPref : function() {
    this._removeWWW = this._prefBranch.getBoolPref(this.REMOVE_WWW_PREF);
  },
  
  _syncSelectSubdomainPref : function() {
    this._selectSubdomain =
      this._prefBranch.getBoolPref(this.SELECT_SUBDOMAIN_PREF);
  },
  
   _syncAllPrefs : function() {
    this._syncRemoveWWWPref();
    this._syncSelectSubdomainPref();
  },
  
  _addPrefObservers : function() {
    this._prefBranch.addObserver(this.REMOVE_WWW_PREF, this, false);
    this._prefBranch.addObserver(this.SELECT_SUBDOMAIN_PREF, this, false);
  },
  
  _removePrefObservers : function() {
    this._prefBranch.removeObserver(this.REMOVE_WWW_PREF, this);
    this._prefBranch.removeObserver(this.SELECT_SUBDOMAIN_PREF, this);
  },
  
  init : function() {
    this._addButton = document.getElementById("cwwb-add-button");
    const properties = document.getElementById("cwwb-properties");
    this._tooltip = properties.getString("addEnabled.tooltip");
    
    const prefs =
      Components.classes["@mozilla.org/preferences-service;1"].getService(
        Components.interfaces.nsIPrefService);
    this._prefBranch =
      prefs.getBranch(null).QueryInterface(
        Components.interfaces.nsIPrefBranch2);
    this._addPrefObservers();
    
    this._syncAllPrefs();
    this.setNeutralState();
    
    this._addButton.addEventListener(
      "click",
      function(event) { return CWWBAdd._onClick(event) },
      true);
  },
  
  cleanup : function() {
    this._removePrefObservers();
  }
};
