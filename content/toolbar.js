// Copyright 2012 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

const CWWBToolbar = {
  _props   : undefined,
  
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
  
  updateAll : function() {
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
    this._props = document.getElementById("cwwb-properties");
    this.updateAll();
    
    var toolbox = document.getElementById("navigator-toolbox");
    toolbox.addEventListener("customizationchange", function() { CWWBToolbar.updateAll(); });
    CWWB.add.addListener(this);
    CWWB.record.addListener(this);
  },
  
  cleanup : function() {
  }
};
