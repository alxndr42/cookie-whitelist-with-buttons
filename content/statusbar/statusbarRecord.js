// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

const CWWBStatusbarRecord = {
  _button     : undefined,
  _properties : undefined,
  
  _onClick : function(aEvent) {
    if (aEvent.button != 0)
      return false;
    
    CWWB.record.toggle();
    return true;
  },
  
  modelUpdate : function(aModel) {
    if (aModel.getBehavior() == aModel.BEHAVIOR_REJECT) {
      this._button.src = "chrome://cwwb/skin/record-off.png";
      this._button.tooltipText = this._properties.getString("recordOff.tooltip");
    }
    else {
      this._button.src = "chrome://cwwb/skin/record-on.png";
      this._button.tooltipText = this._properties.getString("recordOn.tooltip");
    }
  },
  
  init : function() {
    this._button = document.getElementById("cwwb-statusbar-record");
    this._properties = document.getElementById("cwwb-properties");
    CWWB.record.addListener(this);
    this.modelUpdate(CWWB.record);
    
    var record = this;
    this._button.addEventListener(
      "click",
      function(event) { return record._onClick(event); },
      true);
  },
  
  cleanup : function() {
  }
};
