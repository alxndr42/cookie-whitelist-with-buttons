// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

const CWWBStatusbar = {
  _addButton    : undefined,
  _recordButton : undefined,
  _separator    : undefined,
  _panel        : undefined,
  _prefBranch   : undefined,
  
  _update : function() {
    var hideAdd = this._prefBranch.getBoolPref(CWWB.HIDE_ADD_PREF);
    var hideRecord = this._prefBranch.getBoolPref(CWWB.HIDE_RECORD_PREF);
    this._addButton.hidden = hideAdd;
    this._recordButton.hidden = hideRecord;
    this._separator.hidden = (hideAdd || hideRecord);
    this._panel.hidden = (hideAdd && hideRecord);
  },
  
  observe : function(aSubject, aTopic, aData) {
    if (aTopic != "nsPref:changed")
      return;
    
    if (aData == CWWB.HIDE_ADD_PREF || aData == CWWB.HIDE_RECORD_PREF)
      this._update();
  },
  
  init : function() {
    this._addButton    = document.getElementById("cwwb-statusbar-add");
    this._recordButton = document.getElementById("cwwb-statusbar-record");
    this._separator    = document.getElementById("cwwb-statusbar-separator");
    this._panel        = document.getElementById("cwwb-statusbar");
    this._prefBranch =
      CWWB.prefs.getBranch(null).QueryInterface(
        Components.interfaces.nsIPrefBranch2);
    this._prefBranch.addObserver(CWWB.HIDE_ADD_PREF, this, false);
    this._prefBranch.addObserver(CWWB.HIDE_RECORD_PREF, this, false);
    
    this._update();
    CWWBStatusbarAdd.init();
    CWWBStatusbarRecord.init();
  },
  
  cleanup : function() {
    this._prefBranch.removeObserver(CWWB.HIDE_ADD_PREF, this);
    this._prefBranch.removeObserver(CWWB.HIDE_RECORD_PREF, this);
    CWWBStatusbarRecord.cleanup();
    CWWBStatusbarAdd.cleanup();
  }
};
