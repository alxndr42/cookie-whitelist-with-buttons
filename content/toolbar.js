// Copyright 2012 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

const CWWBToolbar = {
  TOOLBAR_BUTTONS_PREF   : "extensions.cwwb.toolbar_buttons",
  TOOLBAR_BUTTONS_BOTH   : 0, // show both buttons
  TOOLBAR_BUTTONS_RECORD : 1, // show record button
  TOOLBAR_BUTTONS_ADD    : 2, // show add button
  
  _prefs : undefined,
  _props : undefined,
  
  _updateVisibility : function() {
    var add = document.getElementById("cwwb-toolbar-add");
    var record = document.getElementById("cwwb-toolbar-record");
    if (!add || !record)
      return;
    
    var buttons = this._prefs.getValue(this.TOOLBAR_BUTTONS_PREF, this.TOOLBAR_BUTTONS_BOTH);
    switch (buttons) {
      case this.TOOLBAR_BUTTONS_RECORD:
        record.setAttribute("hidden", false);
        add.setAttribute("hidden", true);
        break;
      case this.TOOLBAR_BUTTONS_ADD:
        record.setAttribute("hidden", true);
        add.setAttribute("hidden", false);
        break;
      default:
        record.setAttribute("hidden", false);
        add.setAttribute("hidden", false);
        break;
    }
  },
  
  _updateAdd : function() {
    var button = document.getElementById("cwwb-toolbar-add");
    if (!button)
      return;
    
    var model = CWWB.add;
    if (model.getState() == model.STATE_UNLISTED) {
      button.disabled = false;
      button.tooltipText = this._props.getString("addButtonUnlisted.tooltip");
    } else {
      button.disabled = true;
      switch (model.getState()) {
        case model.STATE_WHITELIST:
          button.tooltipText = this._props.getString("addButtonAllow.tooltip");
          break;
        case model.STATE_WHITELIST_SESSION:
          button.tooltipText = this._props.getString("addButtonSession.tooltip");
          break;
        case model.STATE_BLACKLIST:
          button.tooltipText = this._props.getString("addButtonDeny.tooltip");
          break;
        default:
          button.tooltipText = "";
          break;
      }
    }
  },
  
  _updateRecord : function() {
    var button = document.getElementById("cwwb-toolbar-record");
    if (!button)
      return;
    
    var model = CWWB.record;
    if (model.getBehavior() == model.BEHAVIOR_REJECT) {
      button.setAttribute("cwwb-record", "off");
      button.tooltipText = this._props.getString("recordOff.tooltip");
    } else {
      button.setAttribute("cwwb-record", "on");
      button.tooltipText = this._props.getString("recordOn.tooltip");
    }
  },
  
  handleEvent : function(aEvent) {
    var data = aEvent.data;
    if (data == this.TOOLBAR_BUTTONS_PREF)
      this._updateVisibility();
  },
  
  updateAll : function() {
    this._updateVisibility();
    this._updateAdd();
    this._updateRecord();
  },
  
  modelUpdate : function(aModel) {
    if (aModel === CWWB.add) {
      this._updateAdd();
    } else {
      this._updateRecord();
    }
  },
  
  init : function() {
    this._prefs = Application.prefs;
    this._props = document.getElementById("cwwb-properties");
    this.updateAll();
    
    this._prefs.events.addListener("change", this);
    var toolbox = document.getElementById("navigator-toolbox");
    toolbox.addEventListener("customizationchange", function() { CWWBToolbar.updateAll(); }, false);
    CWWB.add.addListener(this);
    CWWB.record.addListener(this);
  },
  
  cleanup : function() {
    this._prefs.events.removeListener("change", this);
  }
};
