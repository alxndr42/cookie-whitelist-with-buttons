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
  const STARTUP_STATE_PREF  = "extensions.cwwb.record_button_startup";
  const STARTUP_STATE_OFF   = 0;
  const STARTUP_STATE_ON    = 1;
  const STARTUP_STATE_LAST  = 2;
  const THIRD_PARTY_PREF    = "extensions.cwwb.accept_third_party";

  var prefs     = undefined;
  var behavior  = undefined;
  var lifetime  = undefined;
  var acceptAll = undefined;
  var listeners = [];

  var notifyListeners = function () {
    listeners.forEach(function (listener) { listener(); });
  };

  var setBehavior = function (aBehavior) {
    if (behavior === aBehavior) {
      return;
    }

    if (lifetime !== LIFETIME_SESSION) {
      prefs.setValue(LIFETIME_PREF, LIFETIME_SESSION);
    }

    prefs.setValue(BEHAVIOR_PREF, aBehavior);
  };

  var setState = function (aRecordOn) {
    if (aRecordOn) {
      if (acceptAll) {
        setBehavior(BEHAVIOR_ACCEPT_ALL);
      } else {
        setBehavior(BEHAVIOR_ACCEPT);
      }
    }
    else {
      setBehavior(BEHAVIOR_REJECT);
    }
  };

  var setStartupState = function () {
    if (Application.windows.length > 1) {
      return;
    }

    var startupState = prefs.getValue(STARTUP_STATE_PREF, STARTUP_STATE_OFF);
    if (startupState === STARTUP_STATE_LAST) {
      return;
    }

    var recordOn = (startupState === STARTUP_STATE_ON);
    setState(recordOn);
  };

  var enforceThirdPartyPref = function () {
    if (acceptAll && behavior === BEHAVIOR_ACCEPT) {
      setBehavior(BEHAVIOR_ACCEPT_ALL);
    } else {
      if (!acceptAll && behavior === BEHAVIOR_ACCEPT_ALL) {
        setBehavior(BEHAVIOR_ACCEPT);
      }
    }
  };

  var syncPrefs = function () {
    behavior = prefs.getValue(BEHAVIOR_PREF, BEHAVIOR_REJECT);
    lifetime = prefs.getValue(LIFETIME_PREF, LIFETIME_SESSION);
    acceptAll = prefs.getValue(THIRD_PARTY_PREF, false);
  };

  var addListener = function (aListener) {
    listeners.push(aListener);
  };

  var getBehavior = function () {
    return behavior;
  };

  var toggle = function () {
    setState(behavior === BEHAVIOR_REJECT);
  };

  var isAcceptAll = function () {
    return acceptAll;
  };

  var toggleAcceptAll = function () {
    prefs.setValue(THIRD_PARTY_PREF, !acceptAll);
  };

  var handleEvent = function (aEvent) {
    var data = aEvent.data;
    if (data === BEHAVIOR_PREF ||
        data === LIFETIME_PREF ||
        data === THIRD_PARTY_PREF) {
      syncPrefs();
      enforceThirdPartyPref();
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
    toggle : toggle,
    isAcceptAll : isAcceptAll,
    toggleAcceptAll : toggleAcceptAll,
    handleEvent : handleEvent,
    init : init,
    cleanup : cleanup
  };
}());
