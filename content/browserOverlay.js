// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

if (!cwwb) var cwwb = {};

(function () {
  var record = undefined;
  var tools = undefined;

  cwwb.showAddDialog = function () {
    var model = cwwb.AddModel;
    if (model.getState() !== model.STATE_UNLISTED) {
      return;
    }

    window.openDialog(
      "chrome://cwwb/content/dialog/addSite.xul",
      "_blank",
      "modal,centerscreen",
      tools.getShortOrigin());
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
    };

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
      tools.purgeCookies();
    }
  };

  cwwb.allowCookies = function (sessionCookies) {
    var model = cwwb.AddModel;
    if (model.getState() !== model.STATE_UNLISTED) {
      return;
    }

    tools.addPermission(tools.getShortOrigin(), sessionCookies);
  };

  cwwb.init = function () {
    Components.utils.import("resource://gre/modules/Services.jsm");

    cwwb.AddModel.init();
    cwwb.RecordModel.init();
    cwwb.Toolbar.init();

    record = cwwb.RecordModel;
    tools = cwwb.Tools;
  };

  cwwb.cleanup = function () {
    cwwb.Toolbar.cleanup();
    cwwb.RecordModel.cleanup();
    cwwb.AddModel.cleanup();
  };
}());

window.addEventListener("load", function () { cwwb.init(); }, false);
window.addEventListener("unload", function () { cwwb.cleanup(); }, false);
