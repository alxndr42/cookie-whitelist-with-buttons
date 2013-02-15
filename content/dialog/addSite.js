// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

if (!cwwb) var cwwb = {};

(function () {
  const PREF_REMOVE_WWW       = "extensions.cwwb.remove_www";
  const PREF_SELECT_SUBDOMAIN = "extensions.cwwb.select_subdomain";

  const PERM_ALLOW   = Components.interfaces.nsICookiePermission.ACCESS_ALLOW;
  const PERM_SESSION = Components.interfaces.nsICookiePermission.ACCESS_SESSION;

  var dialog  = undefined;
  var textbox = undefined;

  // Returns a valid URI from the textbox value, or null.
  var getURI = function () {
    // trim any leading space and scheme part
    var host = textbox.value.replace(/^\s*([-\w]*:\/+)?/, "");
    if (host.length === 0) {
      return null;
    }

    try {
      return Services.io.newURI("http://" + host, null, null);
    }
    catch (e) {
      return null;
    }
  };

  // Adds the given permission for valid hosts.
  var addPermission = function (type) {
    var uri = getURI();
    if (uri !== null) {
      Services.perms.add(uri, "cookie", type);
      return true;
    } else {
      return false;
    }
  };

  // Attempts to detect the subdomain part of the current host,
  // for preselection in the textbox.
  var getSelectionEnd = function (aHost) {
    var parts = aHost.split(".");
    if (parts.length < 3) {
      return 0;
    }

    var tld = parts[parts.length - 1];
    var spare = 0;
    if (tld.length < 3) {
      spare = 3;
    } else {
      spare = 2;
    }

    var end = 0;
    for (i = parts.length - spare - 1; i >= 0; i--) {
      end += parts[i].length + 1;
    }
    return end;
  };

  var onAllow = function () {
    if (addPermission(PERM_ALLOW)) {
      dialog.acceptDialog();
    } else {
      dialog.cancelDialog();
    }
  };

  var onSession = function () {
    if (addPermission(PERM_SESSION)) {
      dialog.acceptDialog();
    } else {
      dialog.cancelDialog();
    }
  };

  var init = function () {
    Components.utils.import("resource://gre/modules/Services.jsm");
    var prefs = Application.prefs;

    var host = window.arguments[0];
    var removeWWW = prefs.getValue(PREF_REMOVE_WWW, true);
    if (removeWWW && host.indexOf("www.") === 0) {
      host = host.substring(4);
    }

    var selectSub = prefs.getValue(PREF_SELECT_SUBDOMAIN, true);
    var selectionEnd = (selectSub ? getSelectionEnd(host) : 0);

    dialog = document.getElementById("cwwb-addsite");
    textbox = document.getElementById("cwwb-addsite-textbox");
    textbox.value = host;
    // Without a prior select(), the range setting is overridden
    // and the entire text selected when the dialog appears.
    textbox.select();
    textbox.setSelectionRange(0, selectionEnd);
  };

  cwwb.AddDialog = {
    onAllow : onAllow,
    onSession : onSession,
    init : init
  };
}());

window.addEventListener("load", function () { cwwb.AddDialog.init(); }, false);
