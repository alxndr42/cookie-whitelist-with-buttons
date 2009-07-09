// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

const CWWBAddDialog = {
  PERM_ALLOW : Components.interfaces.nsICookiePermission.ACCESS_ALLOW,
  PERM_SESSION : Components.interfaces.nsICookiePermission.ACCESS_SESSION,
  
  _dialog : undefined,
  _textbox : undefined,
  
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
  
  // Adds the given permission for valid hosts.
  _addPermission : function(type) {
    const uri = this._getURI();
    if (uri != null) {
      const pManager =
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
    const host = this._textbox.value.replace(/^\s*([-\w]*:\/+)?/, "");
    if (host.length == 0)
      return null;
    
    try {
      const ioService =
        Components.classes["@mozilla.org/network/io-service;1"].getService(
          Components.interfaces.nsIIOService);
      return ioService.newURI("http://" + host, null, null);
    }
    catch (e) {
      return null;
    }
  },
  
  init : function() {
    this._dialog = document.getElementById("cwwb-add-dialog");
    this._textbox = document.getElementById("cwwb-add-textbox");
    this._textbox.value = window.arguments[0];
    // Without a prior select(), the range setting is overriden
    // and the entire text selected when the dialog appears...
    this._textbox.select();
    this._textbox.setSelectionRange(0, window.arguments[1]);
  }
}

window.addEventListener("load", function() { CWWBAddDialog.init(); }, false);
