// Copyright 2013 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

if (!cwwb) var cwwb = {};

(function () {
  const PREF_REMOVE_WWW = "extensions.cwwb.remove_www";
  const PERM_ALLOW   = Components.interfaces.nsICookiePermission.ACCESS_ALLOW;
  const PERM_DEFAULT = Components.interfaces.nsICookiePermission.ACCESS_DEFAULT;
  const PERM_SESSION = Components.interfaces.nsICookiePermission.ACCESS_SESSION;
  const nsIC2 = Components.interfaces.nsICookie2;

  var addPermission = function (host, sessionCookies) {
    var uri = undefined;
    var type = sessionCookies ? PERM_SESSION : PERM_ALLOW;
    try {
      uri = Services.io.newURI("http://" + host, null, null);
      Services.perms.add(uri, "cookie", type);
    }
    catch (e) {
      Application.console.log(
        "CWWB: Error while adding permission for host '" + host + "': " + e);
    }
  };

  var getCurrentHost = function () {
    var host = "";
    var uri = gBrowser.currentURI;
    var removeWWW = undefined;
    if (uri && (uri.schemeIs("http") || uri.schemeIs("https"))) {
      host = gBrowser.currentURI.host;
      removeWWW = Application.prefs.getValue(PREF_REMOVE_WWW, true);
      if (removeWWW && host.indexOf("www.") === 0) {
        host = host.substring(4);
      }
    }
    return host;
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

  cwwb.Tools = {
    addPermission : addPermission,
    getCurrentHost : getCurrentHost,
    purgeCookies : purgeCookies
  };
}());
