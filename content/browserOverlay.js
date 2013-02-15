// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

if (!cwwb) var cwwb = {};

(function () {
  const TOOLBAR_INSTALL_PREF = "extensions.cwwb.toolbar_install";

  var record = undefined;

  var updateContextMenu = function () {
    var thirdParty = document.getElementById("cwwb-context-third-party");
    thirdParty.setAttribute("checked", record.isThirdParty());
  };

  var checkToolbarInstall = function () {
    var installed = Application.prefs.getValue(TOOLBAR_INSTALL_PREF, false);
    if (installed) {
      return;
    }

    // if CWWB is already in the browser, mark it as installed
    var cwwbToolbar = document.getElementById("cwwb-toolbar");
    if (cwwbToolbar) {
      Application.prefs.setValue(TOOLBAR_INSTALL_PREF, true);
      return;
    }

    var navBar = document.getElementById("nav-bar");
    if (!navBar) {
      return;
    }

    try {
      navBar.insertItem("cwwb-toolbar");
      navBar.setAttribute("currentset", navBar.currentSet);
      document.persist(navBar.id, "currentset");
      Application.prefs.setValue(TOOLBAR_INSTALL_PREF, true);
      cwwb.Toolbar.updateAll();
    } catch (e) {
      Application.console.log("Error during toolbar install: " + e);
    }
  };

  cwwb.showAddDialog = function () {
    window.openDialog(
      "chrome://cwwb/content/dialog/addSite.xul",
      "_blank",
      "modal,centerscreen",
      gBrowser.currentURI.host);
  };

  cwwb.showWhitelist = function () {
    var properties = document.getElementById("cwwb-properties");
    var params = {
      blockVisible   : false,
      sessionVisible : true,
      allowVisible   : true,
      prefilledHost  : "",
      permissionType : "cookie",
      windowTitle    : properties.getString("whitelist.title"),
      introText      : properties.getString("whitelist.intro")
    }

    window.openDialog(
      "chrome://browser/content/preferences/permissions.xul",
      "Browser:Permissions",
      "dialog=no,centerscreen",
      params);
  };

  cwwb.showCookies = function () {
    window.openDialog(
      "chrome://browser/content/preferences/cookies.xul",
      "Browser:Cookies",
      "dialog=no,centerscreen",
      null);
  };

  cwwb.toggleThirdParty = function () {
    record.toggleThirdParty();
  };

  cwwb.toggleCookieMode = function () {
    record.toggleBehavior();
  };

  cwwb.init = function () {
    Components.utils.import("resource://gre/modules/Services.jsm");

    record = cwwb.RecordModel;

    cwwb.AddModel.init();
    cwwb.RecordModel.init();
    cwwb.Toolbar.init();

    record.addListener(function () { updateContextMenu(); });
    updateContextMenu();
    checkToolbarInstall();
  };

  cwwb.cleanup = function () {
    cwwb.Toolbar.cleanup();
    cwwb.RecordModel.cleanup();
    cwwb.AddModel.cleanup();
  };
}());

window.addEventListener("load", function () { cwwb.init(); }, false);
window.addEventListener("unload", function () { cwwb.cleanup(); }, false);
