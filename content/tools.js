// Copyright 2013 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

if (!cwwb) var cwwb = {};

(function () {
  const PREF_REMOVE_WWW = "extensions.cwwb.remove_www";
  const PERM_ALLOW   = Components.interfaces.nsICookiePermission.ACCESS_ALLOW;
  const PERM_DEFAULT = Components.interfaces.nsICookiePermission.ACCESS_DEFAULT;
  const PERM_SESSION = Components.interfaces.nsICookiePermission.ACCESS_SESSION;
  const nsIC2 = Components.interfaces.nsICookie2;

  var addPermission = function (hostPort, sessionCookies) {
    var uri = undefined;
    var type = sessionCookies ? PERM_SESSION : PERM_ALLOW;
    try {
      uri = Services.io.newURI("http://" + hostPort, null, null);
      Services.perms.add(uri, "cookie", type);
      uri = Services.io.newURI("https://" + hostPort, null, null);
      Services.perms.add(uri, "cookie", type);
    }
    catch (e) {
      cwwb.log("Error while adding permission for '" + hostPort + "': " + e);
    }
  };

  // Returns the current HTTP(S) URI's host and port, or an empty string
  // A "www." prefix is removed by default
  var getHostPort = function () {
    var hostPort = "";
    var uri = gBrowser.currentURI;
    var removeWWW = undefined;
    if (uri && (uri.schemeIs("http") || uri.schemeIs("https"))) {
      hostPort = uri.hostPort;
      removeWWW = Services.prefs.getBoolPref(PREF_REMOVE_WWW);
      if (removeWWW && hostPort.indexOf("www.") === 0) {
        hostPort = hostPort.substring(4);
      }
    }
    return hostPort;
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
          Services.cookies.remove(
            cookie.host,
            cookie.name,
            cookie.path,
            false,
            cookie.originAttributes);
        }
      }
    }
    catch (e) {
      cwwb.log("Error while purging cookies: " + e);
    }
  };

  cwwb.Tools = {
    addPermission : addPermission,
    getHostPort : getHostPort,
    purgeCookies : purgeCookies
  };
}());
