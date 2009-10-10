// Copyright 2008, 2009 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

const CWWB = {
  HIDE_ADD_PREF    : "extensions.cwwb.hide_add_button",
  HIDE_RECORD_PREF : "extensions.cwwb.hide_record_button",
  
  _addButton    : undefined,
  _recordButton : undefined,
  _separator    : undefined,
  _panel        : undefined,
  _prefBranch   : undefined,
  _hideAdd      : undefined,
  _hideRecord   : undefined,
  
  _updateUI : function() {
    this._addButton.hidden = this._hideAdd;
    this._recordButton.hidden = this._hideRecord;
    this._separator.hidden = (this._hideAdd || this._hideRecord);
    this._panel.hidden = (this._hideAdd && this._hideRecord);
  },
  
  _syncAddPref : function() {
    this._hideAdd = this._prefBranch.getBoolPref(this.HIDE_ADD_PREF);
  },
  
  _syncRecordPref : function() {
    this._hideRecord = this._prefBranch.getBoolPref(this.HIDE_RECORD_PREF);
  },
  
  showWhitelist : function() {
    const properties = document.getElementById("cwwb-properties");
    const params = {
      blockVisible   : false,
      sessionVisible : true,
      allowVisible   : true,
      prefilledHost  : "",
      permissionType : "cookie",
      windowTitle    : properties.getString("whitelist.title"),
      introText      : properties.getString("whitelist.intro")
    };
    
    window.openDialog(
      "chrome://browser/content/preferences/permissions.xul",
      "Browser:Permissions",
      "dialog=no,centerscreen",
      params); 
  },
  
  showCookies : function() {
    window.openDialog(
      "chrome://browser/content/preferences/cookies.xul",
      "Browser:Cookies",
      "dialog=no,centerscreen",
      null);
  },
  
  // Reacts to changes to the Add and Record Button hide preferences
  observe : function(aSubject, aTopic, aData) {
    if (aTopic != "nsPref:changed")
      return;
    
    if (aData == this.HIDE_ADD_PREF)
      this._syncAddPref();
    else
    if (aData == this.HIDE_RECORD_PREF)
      this._syncRecordPref();
    
    this._updateUI();
  },
  
  init : function() {
    this._addButton    = document.getElementById("cwwb-add-button");
    this._recordButton = document.getElementById("cwwb-record-button");
    this._separator    = document.getElementById("cwwb-separator");
    this._panel        = document.getElementById("cwwb-panel");
    
    const prefs =
      Components.classes["@mozilla.org/preferences-service;1"].getService(
        Components.interfaces.nsIPrefService);
    this._prefBranch =
      prefs.getBranch(null).QueryInterface(
        Components.interfaces.nsIPrefBranch2);
    this._prefBranch.addObserver(this.HIDE_ADD_PREF, this, false);
    this._prefBranch.addObserver(this.HIDE_RECORD_PREF, this, false);
    
    this._syncAddPref();
    this._syncRecordPref();
    this._updateUI();
    
    CWWBAdd.init();
    CWWBRecord.init();
  },
  
  cleanup : function() {
    CWWBRecord.cleanup();
    CWWBAdd.cleanup();
    
    this._prefBranch.removeObserver(this.HIDE_ADD_PREF, this);
    this._prefBranch.removeObserver(this.HIDE_RECORD_PREF, this);
  }
}

window.addEventListener("load", function() { CWWB.init(); }, false);
window.addEventListener("unload", function() { CWWB.cleanup(); }, false);
