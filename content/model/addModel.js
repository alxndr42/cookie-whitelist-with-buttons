// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

if (!cwwb) var cwwb = {};

(function () {
  const STATE_UNLISTED          = 0;
  const STATE_WHITELIST         = 1;
  const STATE_WHITELIST_SESSION = 2;
  const STATE_BLACKLIST         = 3;
  const STATE_UNKNOWN           = 4;

  const PERM_DEFAULT = Components.interfaces.nsICookiePermission.ACCESS_DEFAULT;
  const PERM_ALLOW   = Components.interfaces.nsICookiePermission.ACCESS_ALLOW;
  const PERM_DENY    = Components.interfaces.nsICookiePermission.ACCESS_DENY;
  const PERM_SESSION = Components.interfaces.nsICookiePermission.ACCESS_SESSION;

  const nsIP   = Components.interfaces.nsIPermission;
  const nsIWPL = Components.interfaces.nsIWebProgressListener;
  const nsISWR = Components.interfaces.nsISupportsWeakReference;
  const nsIS   = Components.interfaces.nsISupports;

  var currentOrigin = null;
  var currentPerm = null;
  var state       = STATE_UNKNOWN;
  var listeners   = [];

  var notifyListeners = function () {
    listeners.forEach(function (listener) { listener(); });
  };

  var updateState = function (aOrigin, aPerm) {
    currentOrigin = aOrigin;
    currentPerm = aPerm;

    switch (aPerm) {
       case PERM_ALLOW:
        state = STATE_WHITELIST;
        break;
      case PERM_DENY:
        state = STATE_BLACKLIST
        break;
      case PERM_SESSION:
        state = STATE_WHITELIST_SESSION;
        break;
      default:
        if (aOrigin !== null) {
          state = STATE_UNLISTED;
        } else {
          state = STATE_UNKNOWN;
        }
        break;
    }

    notifyListeners();
  };

  // Checks the current origin's permission
  var checkCurrentOrigin = function (aForce) {
    var uri = gBrowser.currentURI;
    var origin = filterOrigin(uri);
    if (origin === currentOrigin && !aForce) {
      return;
    }

    var perm = null;
    if (origin !== null) {
      perm = Services.perms.testPermission(uri, "cookie");
    }
    if (origin === currentOrigin && perm === currentPerm) {
      return;
    }

    updateState(origin, perm);
  };

  // Returns the origin of the given HTTP(S) URI, or null
  var filterOrigin = function (aURI) {
    var origin = null;
    if (aURI && (aURI.schemeIs("http") || aURI.schemeIs("https"))) {
      try {
        origin = aURI.prePath;
      }
      catch (e) {
        // ignore and return null
      }
    }
    return origin;
  };

  var addListener = function (aListener) {
    listeners.push(aListener);
  };

  var getState = function () {
    return state;
  };

  var QueryInterface = function (aIID) {
    if (
      aIID.equals(nsIWPL) ||
      aIID.equals(nsISWR) ||
      aIID.equals(nsIS)) {
        return this;
    }

    throw Components.results.NS_NOINTERFACE;
  };

  var onLocationChange = function () {
    checkCurrentOrigin(false);
  };

  var onProgressChange = function () {};
  var onStateChange = function () {};
  var onStatusChange = function () {};
  var onSecurityChange = function () {};

  var observe = function (aSubject, aTopic, aData) {
    if (aTopic !== "perm-changed") {
      return;
    }
    if (!(aSubject instanceof nsIP) || aSubject.type !== "cookie") {
      return;
    }

    checkCurrentOrigin(true);
  };

  var init = function () {
    checkCurrentOrigin(true);
    gBrowser.addProgressListener(this);
    Services.obs.addObserver(this, "perm-changed", false);
  };

  var cleanup = function () {
    Services.obs.removeObserver(this, "perm-changed");
  };

  cwwb.AddModel = {
    STATE_UNLISTED : STATE_UNLISTED,
    STATE_WHITELIST : STATE_WHITELIST,
    STATE_WHITELIST_SESSION : STATE_WHITELIST_SESSION,
    STATE_BLACKLIST : STATE_BLACKLIST,
    STATE_UNKNOWN : STATE_UNKNOWN,
    addListener : addListener,
    getState : getState,
    QueryInterface : QueryInterface,
    onLocationChange : onLocationChange,
    onProgressChange : onProgressChange,
    onStateChange : onStateChange,
    onStatusChange : onStatusChange,
    onSecurityChange : onSecurityChange,
    observe : observe,
    init : init,
    cleanup : cleanup
  };
}());
