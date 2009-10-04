// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

const CWWBAdd = {
  PREF_REMOVE_WWW       : "extensions.cwwb.remove_www",
  PREF_SELECT_SUBDOMAIN : "extensions.cwwb.select_subdomain",
  
  PERM_DEFAULT : Components.interfaces.nsICookiePermission.ACCESS_DEFAULT,
  PERM_ALLOW   : Components.interfaces.nsICookiePermission.ACCESS_ALLOW,
  PERM_DENY    : Components.interfaces.nsICookiePermission.ACCESS_DENY,
  PERM_SESSION : Components.interfaces.nsICookiePermission.ACCESS_SESSION,
  
  _addButton       : undefined,
  _properties      : undefined,
  _clickable       : undefined,
  _currentHost     : undefined,
  _currentPerm     : undefined,
  _prefBranch      : undefined,
  _removeWWW       : undefined,
  _selectSubdomain : undefined,
  
  updateState : function(aHost, aPerm) {
    if (aHost == this._currentHost && aPerm == this._currentPerm)
      return;
    
    this._currentHost = aHost;
    this._currentPerm = aPerm;
    if (aHost != null && aPerm == this.PERM_DEFAULT)
      this._setEnabled();
    else
      this._setDisabled();
  },
  
  _setEnabled : function() {
    this._clickable = true;
    this._addButton.src = "chrome://cwwb/skin/add-on.png";
    this._addButton.tooltipText = this._properties.getString("addButtonUnlisted.tooltip");
  },
  
  _setDisabled : function() {
    this._clickable = false;
    this._addButton.src = "chrome://cwwb/skin/add-off.png";
    switch (this._currentPerm) {
    case this.PERM_ALLOW:
      this._addButton.tooltipText = this._properties.getString("addButtonAllow.tooltip");
      break;
    case this.PERM_DENY:
      this._addButton.tooltipText = this._properties.getString("addButtonDeny.tooltip");
      break;
    case this.PERM_SESSION:
      this._addButton.tooltipText = this._properties.getString("addButtonSession.tooltip");
      break;
    default:
      this._addButton.tooltipText = "";
      break;
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
	
    this._syncPrefs();
  },
  
  _syncPrefs : function() {
    this._removeWWW = this._prefBranch.getBoolPref(this.PREF_REMOVE_WWW);
    this._selectSubdomain =
      this._prefBranch.getBoolPref(this.PREF_SELECT_SUBDOMAIN);
  },
  
  _addPrefObservers : function() {
    this._prefBranch.addObserver(this.PREF_REMOVE_WWW, this, false);
    this._prefBranch.addObserver(this.PREF_SELECT_SUBDOMAIN, this, false);
  },
  
  _removePrefObservers : function() {
    this._prefBranch.removeObserver(this.PREF_REMOVE_WWW, this);
    this._prefBranch.removeObserver(this.PREF_SELECT_SUBDOMAIN, this);
  },
  
  init : function() {
    this._addButton = document.getElementById("cwwb-add-button");
    this._properties = document.getElementById("cwwb-properties");
    
    const prefs =
      Components.classes["@mozilla.org/preferences-service;1"].getService(
        Components.interfaces.nsIPrefService);
    this._prefBranch =
      prefs.getBranch(null).QueryInterface(
        Components.interfaces.nsIPrefBranch2);
    this._addPrefObservers();
    
    this._syncPrefs();
    this._setDisabled();
    
    this._addButton.addEventListener(
      "click",
      function(event) { return CWWBAdd._onClick(event) },
      true);
  },
  
  cleanup : function() {
    this._removePrefObservers();
  }
};
