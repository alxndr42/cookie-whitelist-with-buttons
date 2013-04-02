// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

if (!cwwb) var cwwb = {};

(function () {
  const PREF_SELECT_SUBDOMAIN = "extensions.cwwb.select_subdomain";

  var dialog  = undefined;
  var textbox = undefined;

  // Returns the length of the subdomain part in the current hostname, or 0.
  var getSubdomainLength = function () {
    var length = 0;
    var baseDomain = undefined;
    var selectSub = Application.prefs.getValue(PREF_SELECT_SUBDOMAIN, true);
    if (selectSub) {
      try {
        baseDomain = Services.eTLD.getBaseDomainFromHost(textbox.value);
        length = textbox.value.length - baseDomain.length;
      }
      catch (e) {
        // possibly an IP address or "localhost"
      }
    }
    return length;
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
    textbox.setSelectionRange(0, getSubdomainLength());
  };

  cwwb.AddDialog = {
    allowCookies : allowCookies,
    init : init
  };
}());

window.addEventListener("load", function () { cwwb.AddDialog.init(); }, false);
