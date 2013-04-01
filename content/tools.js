// Copyright 2013 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

if (!cwwb) var cwwb = {};

(function () {
  const PERM_DEFAULT = Components.interfaces.nsICookiePermission.ACCESS_DEFAULT;

  const nsIC2 = Components.interfaces.nsICookie2;

  cwwb.Tools = {};

  cwwb.Tools.purgeCookies = function () {
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
}());
