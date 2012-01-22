// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

const CWWBAddDialog = {
  PREF_REMOVE_WWW       : "extensions.cwwb.remove_www",
  PREF_SELECT_SUBDOMAIN : "extensions.cwwb.select_subdomain",
  
  PERM_ALLOW   : Components.interfaces.nsICookiePermission.ACCESS_ALLOW,
  PERM_SESSION : Components.interfaces.nsICookiePermission.ACCESS_SESSION,
  
  _dialog          : undefined,
  _textbox         : undefined,
  _selectSubdomain : undefined,
  
  // Adds the given permission for valid hosts.
  _addPermission : function(type) {
    var uri = this._getURI();
    if (uri != null) {
      var pManager =
        Components.classes["@mozilla.org/permissionmanager;1"].getService(
          Components.interfaces.nsIPermissionManager);
      pManager.add(uri, "cookie", type);
      return true;
    }
    
    return false;
  },
  
  // Returns a valid URI from the textbox value, or null.
  _getURI : function() {
    // trim any leading space and scheme part
    var host = this._textbox.value.replace(/^\s*([-\w]*:\/+)?/, "");
    if (host.length == 0)
      return null;
    
    try {
      var ioService =
        Components.classes["@mozilla.org/network/io-service;1"].getService(
          Components.interfaces.nsIIOService);
      return ioService.newURI("http://" + host, null, null);
    }
    catch (e) {
      return null;
    }
  },
  
  // Attempts to detect the subdomain part of the current host,
  // for preselection in the textbox.
  _getSelectionEnd : function(aHost) {
    if (!this._selectSubdomain)
      return 0;
    
    var parts = aHost.split(".");
    if (parts.length < 3)
      return 0;
    
    var tld = parts[parts.length - 1];
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
  
  onAllow : function() {
    if (this._addPermission(this.PERM_ALLOW))
      this._dialog.acceptDialog();
    else
      this._dialog.cancelDialog();
  },
  
  onSession : function() {
    if (this._addPermission(this.PERM_SESSION))
      this._dialog.acceptDialog();
    else
      this._dialog.cancelDialog();
  },
  
  init : function() {
    var prefs =
      Components.classes["@mozilla.org/preferences-service;1"].getService(
        Components.interfaces.nsIPrefService);
    var prefBranch =
      prefs.getBranch(null).QueryInterface(
        Components.interfaces.nsIPrefBranch2);
    var removeWWW = prefBranch.getBoolPref(this.PREF_REMOVE_WWW);
    this._selectSubdomain = prefBranch.getBoolPref(this.PREF_SELECT_SUBDOMAIN);
    
    var host = window.arguments[0];
    if (removeWWW && host.indexOf("www.") == 0)
      host = host.substring(4);
    
    this._dialog = document.getElementById("cwwb-addsite");
    this._textbox = document.getElementById("cwwb-addsite-textbox");
    this._textbox.value = host;
    // Without a prior select(), the range setting is overriden
    // and the entire text selected when the dialog appears...
    this._textbox.select();
    this._textbox.setSelectionRange(0, this._getSelectionEnd(host));
  }
}

window.addEventListener("load", function() { CWWBAddDialog.init(); }, false);
