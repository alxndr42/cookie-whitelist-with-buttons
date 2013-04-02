// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

if (!cwwb) var cwwb = {};

(function () {
  const PREF_SELECT_SUBDOMAIN = "extensions.cwwb.select_subdomain";

  var dialog  = undefined;
  var textbox = undefined;

  // Attempts to detect the subdomain part of the current host,
  // for preselection in the textbox.
  var getSelectionEnd = function () {
    var selectionEnd = 0;
    var selectSub = Application.prefs.getValue(PREF_SELECT_SUBDOMAIN, true);
    var parts = textbox.value.split(".");
    var tld = undefined;
    var skip = undefined;
    var i = undefined;
    if (selectSub && parts.length > 2) {
      tld = parts[parts.length - 1];
      skip = tld.length < 3 ? 3 : 2;
      for (i = parts.length - skip - 1; i >= 0; i--) {
        selectionEnd += parts[i].length + 1;
      }
    }
    return selectionEnd;
  };

  var allowCookies = function (sessionCookies) {
    var host = textbox.value.trim();
    if (host) {
      cwwb.Tools.addPermission(host, sessionCookies);
    }
    dialog.acceptDialog();
  };

  var init = function () {
    Components.utils.import("resource://gre/modules/Services.jsm");

    dialog = document.getElementById("cwwb-addsite");
    textbox = document.getElementById("cwwb-addsite-textbox");
    textbox.value = window.arguments[0];
    // Without a prior select(), the range setting is overridden
    // and the entire text selected when the dialog appears.
    textbox.select();
    textbox.setSelectionRange(0, getSelectionEnd());
  };

  cwwb.AddDialog = {
    allowCookies : allowCookies,
    init : init
  };
}());

window.addEventListener("load", function () { cwwb.AddDialog.init(); }, false);
