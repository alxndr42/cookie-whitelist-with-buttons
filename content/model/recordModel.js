// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

if (!cwwb) var cwwb = {};

(function () {
  const BEHAVIOR_PREF       = "network.cookie.cookieBehavior";
  const BEHAVIOR_ACCEPT_ALL = 0; // accept cookies from everyone
  const BEHAVIOR_ACCEPT     = 1; // accept cookies from original site only
  const BEHAVIOR_REJECT     = 2; // reject cookies
  const LIFETIME_PREF       = "network.cookie.lifetimePolicy";
  const LIFETIME_SESSION    = 2; // accept cookies for session
  const PURGE_COOKIES_PREF  = "extensions.cwwb.purge_cookies";
  const STARTUP_STATE_PREF  = "extensions.cwwb.record_button_startup";
  const STARTUP_STATE_OFF   = 0;
  const STARTUP_STATE_ON    = 1;
  const STARTUP_STATE_LAST  = 2;

  var prefs        = undefined;
  var behavior     = undefined;
  var lifetime     = undefined;
  var purgeCookies = undefined;
  var listeners    = [];

  var notifyListeners = function () {
    listeners.forEach(function (listener) { listener(); });
  };

  var setBehavior = function (aBehavior) {
    if (behavior !== aBehavior) {
      prefs.setValue(BEHAVIOR_PREF, aBehavior);
    }
  };

  var setState = function (aRecordOn) {
    if (aRecordOn) {
      setBehavior(BEHAVIOR_ACCEPT);
    } else {
      setBehavior(BEHAVIOR_REJECT);
    }
  };

  var setLifetime = function () {
    if (lifetime !== LIFETIME_SESSION) {
      prefs.setValue(LIFETIME_PREF, LIFETIME_SESSION);
    }
  };

  var setStartupState = function () {
    if (Application.windows.length > 1) {
      return;
    }

    setLifetime();

    var startupState = prefs.getValue(STARTUP_STATE_PREF, STARTUP_STATE_OFF);
    if (startupState === STARTUP_STATE_LAST) {
      return;
    }

    setState(startupState === STARTUP_STATE_ON);
  };

  var syncPrefs = function () {
    behavior = prefs.getValue(BEHAVIOR_PREF, BEHAVIOR_REJECT);
    lifetime = prefs.getValue(LIFETIME_PREF, LIFETIME_SESSION);
    purgeCookies = prefs.getValue(PURGE_COOKIES_PREF, true);
  };

  var addListener = function (aListener) {
    listeners.push(aListener);
  };

  var getBehavior = function () {
    return behavior;
  };

  var toggleBehavior = function () {
    setState(behavior === BEHAVIOR_REJECT);
  };

  var isPurgeCookies = function () {
    return purgeCookies;
  };

  var handleEvent = function (aEvent) {
    var data = aEvent.data;
    if (data === BEHAVIOR_PREF ||
        data === LIFETIME_PREF ||
        data === PURGE_COOKIES_PREF) {
      syncPrefs();
      setLifetime();
      setState(behavior !== BEHAVIOR_REJECT);
      notifyListeners();
    }
  };

  var init = function () {
    prefs = Application.prefs;
    prefs.events.addListener("change", this);
    syncPrefs();
    setStartupState();
  };

  var cleanup = function () {
    prefs.events.removeListener("change", this);
  };

  cwwb.RecordModel = {
    BEHAVIOR_ACCEPT_ALL : BEHAVIOR_ACCEPT_ALL,
    BEHAVIOR_ACCEPT : BEHAVIOR_ACCEPT,
    BEHAVIOR_REJECT : BEHAVIOR_REJECT,
    addListener : addListener,
    getBehavior : getBehavior,
    toggleBehavior : toggleBehavior,
    isPurgeCookies : isPurgeCookies,
    handleEvent : handleEvent,
    init : init,
    cleanup : cleanup
  };
}());
