// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

if (!cwwb) var cwwb = {};

(function () {
  const TOOLBAR_INSTALL_PREF = "extensions.cwwb.toolbar_install";
  const PERM_DEFAULT = Components.interfaces.nsICookiePermission.ACCESS_DEFAULT;
  const nsIC2 = Components.interfaces.nsICookie2;

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
      Application.console.log("CWWB: Error during toolbar install: " + e);
    }
  };

  var purgeCookies = function () {
    var cookies = undefined;
    var cookie = undefined;
    var uri = undefined;
    var perm = undefined;
    var purge = {};

    cookies = Services.cookies.enumerator;
    try {
      while (cookies.hasMoreElements()) {
        cookie = cookies.getNext().QueryInterface(nsIC2);
        if (!purge.hasOwnProperty(cookie.rawHost)) {
          uri = Services.io.newURI("http://" + cookie.rawHost, null, null);
          perm = Services.perms.testPermission(uri, "cookie");
          purge[cookie.rawHost] = (perm === PERM_DEFAULT);
        }
        if (purge[cookie.rawHost]) {
          Services.cookies.remove(cookie.host, cookie.name, cookie.path, false);
        }
      }
    }
    catch (e) {
      Application.console.log("CWWB: Error while purging cookies: " + e);
    }
  };

  cwwb.showAddDialog = function () {
    var model = cwwb.AddModel;
    if (model.getState() !== model.STATE_UNLISTED) {
      return;
    }

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
    var purge = (record.getBehavior() !== record.BEHAVIOR_REJECT);
    record.toggleBehavior();
    if (purge && record.isPurgeCookies()) {
      purgeCookies();
    }
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
