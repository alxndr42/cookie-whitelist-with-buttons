// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

if (!cwwb) var cwwb = {};

(function () {
  var dialog  = undefined;
  var textbox = undefined;

  var allowCookies = function (sessionCookies) {
    var origin = textbox.value.trim();
    if (origin) {
      cwwb.Tools.addPermission(origin, sessionCookies);
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
    textbox.setSelectionRange(textbox.value.length, textbox.value.length);
  };

  cwwb.AddDialog = {
    allowCookies : allowCookies,
    init : init
  };
}());

window.addEventListener("load", function () { cwwb.AddDialog.init(); }, false);
