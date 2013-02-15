// Copyright 2012 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

if (!cwwb) var cwwb = {};

(function () {
  const TOOLBAR_BUTTONS_PREF   = "extensions.cwwb.toolbar_buttons";
  const TOOLBAR_BUTTONS_BOTH   = 0; // show both buttons
  const TOOLBAR_BUTTONS_RECORD = 1; // show record button
  const TOOLBAR_BUTTONS_ADD    = 2; // show add button

  var prefs = undefined;
  var props = undefined;

  var updateVisibility = function () {
    var add = document.getElementById("cwwb-toolbar-add");
    var record = document.getElementById("cwwb-toolbar-record");
    if (!add || !record) {
      return;
    }

    var buttons = prefs.getValue(TOOLBAR_BUTTONS_PREF, TOOLBAR_BUTTONS_BOTH);
    switch (buttons) {
      case TOOLBAR_BUTTONS_RECORD:
        record.setAttribute("hidden", false);
        add.setAttribute("hidden", true);
        break;
      case TOOLBAR_BUTTONS_ADD:
        record.setAttribute("hidden", true);
        add.setAttribute("hidden", false);
        break;
      default:
        record.setAttribute("hidden", false);
        add.setAttribute("hidden", false);
        break;
    }
  };

  var updateAdd = function () {
    var button = document.getElementById("cwwb-toolbar-add");
    if (!button) {
      return;
    }

    var model = cwwb.AddModel;
    if (model.getState() === model.STATE_UNLISTED) {
      button.disabled = false;
      button.tooltipText = props.getString("addButtonUnlisted.tooltip");
    } else {
      button.disabled = true;
      switch (model.getState()) {
        case model.STATE_WHITELIST:
          button.tooltipText = props.getString("addButtonAllow.tooltip");
          break;
        case model.STATE_WHITELIST_SESSION:
          button.tooltipText = props.getString("addButtonSession.tooltip");
          break;
        case model.STATE_BLACKLIST:
          button.tooltipText = props.getString("addButtonDeny.tooltip");
          break;
        default:
          button.tooltipText = "";
          break;
      }
    }
  };

  var updateRecord = function () {
    var button = document.getElementById("cwwb-toolbar-record");
    if (!button) {
      return;
    }

    var model = cwwb.RecordModel;
    if (model.getBehavior() === model.BEHAVIOR_REJECT) {
      button.setAttribute("cwwb-record", "off");
      button.tooltipText = props.getString("recordOff.tooltip");
    } else {
      button.setAttribute("cwwb-record", "on");
      button.tooltipText = props.getString("recordOn.tooltip");
    }
  };

  var handleEvent = function (aEvent) {
    if (aEvent.data === TOOLBAR_BUTTONS_PREF) {
      updateVisibility();
    }
  };

  var updateAll = function () {
    updateVisibility();
    updateAdd();
    updateRecord();
  };

  var init = function() {
    prefs = Application.prefs;
    props = document.getElementById("cwwb-properties");
    updateAll();

    prefs.events.addListener("change", this);
    var toolbox = document.getElementById("navigator-toolbox");
    toolbox.addEventListener("customizationchange", function () { updateAll(); }, false);
    cwwb.AddModel.addListener(function () { updateAdd(); });
    cwwb.RecordModel.addListener(function () { updateRecord(); });
  };

  var cleanup = function() {
    prefs.events.removeListener("change", this);
  };

  cwwb.Toolbar = {
    handleEvent : handleEvent,
    updateAll : updateAll,
    init : init,
    cleanup : cleanup
  };
}());
