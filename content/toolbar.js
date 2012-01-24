// Copyright 2012 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

const CWWBToolbar = {
  _props   : undefined,
  
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
    this._updateRecord();
  },
  
  modelUpdate : function(aModel) {
    if (aModel === CWWB.record) {
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
