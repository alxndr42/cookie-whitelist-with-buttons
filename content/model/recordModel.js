// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

const CWWBRecordModel = {
  BEHAVIOR_PREF       : "network.cookie.cookieBehavior",
  BEHAVIOR_ACCEPT_ALL : 0, // accept cookies from everyone
  BEHAVIOR_ACCEPT     : 1, // accept cookies from original site only
  BEHAVIOR_REJECT     : 2, // reject cookies
  LIFETIME_PREF       : "network.cookie.lifetimePolicy",
  LIFETIME_SESSION    : 2, // accept cookies for session
  STARTUP_STATE_PREF  : "extensions.cwwb.record_button_startup",
  STARTUP_STATE_OFF   : 0,
  STARTUP_STATE_ON    : 1,
  STARTUP_STATE_LAST  : 2,
  THIRD_PARTY_PREF    : "extensions.cwwb.accept_third_party",
  
  _prefs     : undefined,
  _behavior  : undefined,
  _lifetime  : undefined,
  _acceptAll : undefined,
  _listeners : [],
  
  _setBehavior : function(aBehavior) {
    if (this._behavior == aBehavior)
      return;
    
    if (this._lifetime != this.LIFETIME_SESSION)
      this._prefs.setValue(this.LIFETIME_PREF, this.LIFETIME_SESSION);
    
    this._prefs.setValue(this.BEHAVIOR_PREF, aBehavior);
  },
  
  _setState : function(aRecordOn) {
    if (aRecordOn) {
      if (this._acceptAll)
        this._setBehavior(this.BEHAVIOR_ACCEPT_ALL);
      else
        this._setBehavior(this.BEHAVIOR_ACCEPT);
    }
    else {
      this._setBehavior(this.BEHAVIOR_REJECT);
    }
  },
  
  _setStartupState : function() {
    if (Application.windows.length > 1)
      return;
    
    var startupState = this._prefs.getValue(this.STARTUP_STATE_PREF, this.STARTUP_STATE_OFF);
    if (startupState == this.STARTUP_STATE_LAST)
      return;
    
    var recordOn = (startupState == this.STARTUP_STATE_ON);
    this._setState(recordOn);
  },
  
  _enforceThirdPartyPref : function() {
    if (this._acceptAll && this._behavior == this.BEHAVIOR_ACCEPT)
      this._setBehavior(this.BEHAVIOR_ACCEPT_ALL);
    else
    if (!this._acceptAll && this._behavior == this.BEHAVIOR_ACCEPT_ALL)
      this._setBehavior(this.BEHAVIOR_ACCEPT);
  },
  
  _syncPrefs : function() {
    this._behavior = this._prefs.getValue(this.BEHAVIOR_PREF, this.BEHAVIOR_REJECT);
    this._lifetime = this._prefs.getValue(this.LIFETIME_PREF, this.LIFETIME_SESSION);
    this._acceptAll = this._prefs.getValue(this.THIRD_PARTY_PREF, false);
  },
  
  _notifyListeners : function() {
    for each (var listener in this._listeners)
      listener.modelUpdate(this);
  },
  
  addListener : function(aListener) {
    this._listeners.push(aListener);
  },
  
  getBehavior : function() {
    return this._behavior;
  },
  
  toggle : function() {
    this._setState(this._behavior == this.BEHAVIOR_REJECT);
  },
  
  isAcceptAll : function() {
    return this._acceptAll;
  },
  
  toggleAcceptAll : function() {
    this._prefs.setValue(this.THIRD_PARTY_PREF, !this._acceptAll);
  },
  
  handleEvent : function(aEvent) {
    var data = aEvent.data;
    if (data == this.BEHAVIOR_PREF ||
        data == this.LIFETIME_PREF ||
        data == this.THIRD_PARTY_PREF) {
      this._syncPrefs();
      this._enforceThirdPartyPref();
      this._notifyListeners();
    }
  },
  
  init : function() {
    this._prefs = Application.prefs;
    this._prefs.events.addListener("change", this);
    
    this._syncPrefs();
    this._setStartupState();
  },
  
  cleanup : function() {
    this._prefs.events.removeListener("change", this);
  }
};
