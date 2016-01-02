// Copyright 2012 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

if (!cwwb) var cwwb = {};

(function () {
  const TOOLBAR_INSTALL_PREF   = "extensions.cwwb.toolbar_install_v3";

  var prefs = undefined;
  var props = undefined;
  var cui = undefined;

  var getButton = function (id) {
    var button = undefined;
    var wrapper = cui.getWidget(id);
    if (wrapper && wrapper.isGroup) {
      wrapper = wrapper.forWindow(window);
    }
    if (wrapper) {
      button = wrapper.node;
    }
    return button;
  };

  var checkInstall = function () {
    var installed = Application.prefs.getValue(TOOLBAR_INSTALL_PREF, false);
    if (installed) {
      return;
    }

    try {
      cui.addWidgetToArea("cwwb-toolbar-record", cui.AREA_NAVBAR);
      cui.addWidgetToArea("cwwb-toolbar-add", cui.AREA_NAVBAR);
      Application.prefs.setValue(TOOLBAR_INSTALL_PREF, true);
    } catch (e) {
      Application.console.log("CWWB: Error during toolbar install: " + e);
    }
  };

  var updateAdd = function () {
    var button = getButton("cwwb-toolbar-add");
    if (!button) {
      return;
    }

    var model = cwwb.AddModel;
    if (model.getState() === model.STATE_UNLISTED) {
      button.disabled = false;
      button.setAttribute("cwwb-add", "on");
      button.tooltipText = props.getString("addButtonUnlisted.tooltip");
    } else {
      button.disabled = true;
      button.setAttribute("cwwb-add", "off");
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
    var button = getButton("cwwb-toolbar-record");
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

  var updateAll = function () {
    updateAdd();
    updateRecord();
  };

  var init = function() {
    Components.utils.import("resource:///modules/CustomizableUI.jsm", this);
    prefs = Application.prefs;
    props = document.getElementById("cwwb-properties");
    cui = CustomizableUI;
    checkInstall();
    updateAll();

    cwwb.AddModel.addListener(function () { updateAdd(); });
    cwwb.RecordModel.addListener(function () { updateRecord(); });
    let toolbox = document.getElementById("navigator-toolbox");
    if (toolbox) {
      toolbox.addEventListener("customizationchange", function () { updateAll(); }, false);
    }
  };

  var cleanup = function() {
    // empty
  };

  cwwb.Toolbar = {
    init : init,
    cleanup : cleanup
  };
}());
