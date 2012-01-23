// Copyright 2012 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

const CWWBToolbarRecord = {
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
      this._button.setAttribute("cwwb-record", "off");
      this._button.tooltipText = this._properties.getString("recordOff.tooltip");
    }
    else {
      this._button.setAttribute("cwwb-record", "on");
      this._button.tooltipText = this._properties.getString("recordOn.tooltip");
    }
  },
  
  init : function() {
    this._button = document.getElementById("cwwb-toolbar-record");
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
