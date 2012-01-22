// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

const CWWBStatusbarAdd = {
  _addButton  : undefined,
  _properties : undefined,
  _clickable  : undefined,
  
  _onClick : function(aEvent) {
    if (aEvent.button != 0)
      return false;
    if (!this._clickable)
      return true;
    
    CWWB.showAddDialog();    
    return true;
  },
  
  modelUpdate : function(aModel) {
    if (aModel.getState() == aModel.STATE_UNLISTED) {
      this._clickable = true;
      this._addButton.src = "chrome://cwwb/skin/add-on.png";
      this._addButton.tooltipText = this._properties.getString("addButtonUnlisted.tooltip");
    } else {
      this._clickable = false;
      this._addButton.src = "chrome://cwwb/skin/add-off.png";
      switch (aModel.getState()) {
        case aModel.STATE_WHITELIST:
          this._addButton.tooltipText = this._properties.getString("addButtonAllow.tooltip");
          break;
        case aModel.STATE_WHITELIST_SESSION:
          this._addButton.tooltipText = this._properties.getString("addButtonSession.tooltip");
          break;
        case aModel.STATE_BLACKLIST:
          this._addButton.tooltipText = this._properties.getString("addButtonDeny.tooltip");
          break;
        default:
          this._addButton.tooltipText = "";
          break;
      }
    }
  },
  
  init : function() {
    this._addButton = document.getElementById("cwwb-statusbar-add");
    this._properties = document.getElementById("cwwb-properties");
    CWWB.add.addListener(this);
    this.modelUpdate(CWWB.add);
    
    var add = this;
    this._addButton.addEventListener(
      "click",
      function(event) { return add._onClick(event) },
      true);
  },
  
  cleanup : function() {
  }
};
