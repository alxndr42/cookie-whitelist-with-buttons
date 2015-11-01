// Copyright 2013 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

if (!cwwb) var cwwb = {};

(function () {
  const PREF_REMOVE_WWW = "extensions.cwwb.remove_www";
  const PERM_ALLOW   = Components.interfaces.nsICookiePermission.ACCESS_ALLOW;
  const PERM_DEFAULT = Components.interfaces.nsICookiePermission.ACCESS_DEFAULT;
  const PERM_SESSION = Components.interfaces.nsICookiePermission.ACCESS_SESSION;
  const nsIC2 = Components.interfaces.nsICookie2;

  var addPermission = function (origin, sessionCookies) {
    var uri = undefined;
    var type = sessionCookies ? PERM_SESSION : PERM_ALLOW;
    try {
      uri = Services.io.newURI(origin, null, null);
      Services.perms.add(uri, "cookie", type);
    }
    catch (e) {
      Application.console.log(
        "CWWB: Error while adding permission for '" + origin + "': " + e);
    }
  };

  // Returns the current HTTP(S) URI's origin, or an empty string
  // A "www." prefix is removed by default
  var getShortOrigin = function () {
    var origin = "";
    var uri = gBrowser.currentURI;
    var removeWWW = undefined;
    if (uri && (uri.schemeIs("http") || uri.schemeIs("https"))) {
      origin = uri.host;
      removeWWW = Application.prefs.getValue(PREF_REMOVE_WWW, true);
      if (removeWWW && origin.indexOf("www.") === 0) {
        origin = origin.substring(4);
      }
      origin = uri.scheme + "://" + origin;
    }
    return origin;
  };

  // TODO Handle domain cookies correctly

  var shouldPurgeCookie = function (cookie) {
    var uri = Services.io.newURI("https://" + cookie.rawHost, null, null);
    var perm = Services.perms.testPermission(uri, "cookie");
    if (perm === PERM_DEFAULT && !cookie.isSecure) {
      uri = Services.io.newURI("http://" + cookie.rawHost, null, null);
      perm = Services.perms.testPermission(uri, "cookie");
    }
    return (perm === PERM_DEFAULT);
  } ;

  var purgeCookies = function () {
    var cookies = undefined;
    var cookie = undefined;
    var key = undefined;
    var purge = {};

    cookies = Services.cookies.enumerator;
    try {
      while (cookies.hasMoreElements()) {
        cookie = cookies.getNext().QueryInterface(nsIC2);
        key = (cookie.isSecure ? "secure:" : "any:") + cookie.rawHost;
        if (!purge.hasOwnProperty(key)) {
          purge[key] = shouldPurgeCookie(cookie);
        }
        if (purge[key]) {
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
    getShortOrigin : getShortOrigin,
    purgeCookies : purgeCookies
  };
}());
