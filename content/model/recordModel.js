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
  
  _prefBranch : undefined,
  _behavior   : undefined,
  _lifetime   : undefined,
  _acceptAll  : undefined,
  _listeners  : [],
  
  _setBehavior : function(aBehavior) {
    if (this._behavior == aBehavior)
      return;
    
    if (this._lifetime != this.LIFETIME_SESSION)
      this._prefBranch.setIntPref(this.LIFETIME_PREF, this.LIFETIME_SESSION);
    
    this._prefBranch.setIntPref(this.BEHAVIOR_PREF, aBehavior);
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
    if (!CWWB.isFirstWindow())
      return;
    
    var startupState = this._prefBranch.getIntPref(this.STARTUP_STATE_PREF);
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
    this._behavior = this._prefBranch.getIntPref(this.BEHAVIOR_PREF);
    this._lifetime = this._prefBranch.getIntPref(this.LIFETIME_PREF);
    this._acceptAll = this._prefBranch.getBoolPref(this.THIRD_PARTY_PREF);
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
  
  setAcceptAll : function(aAcceptAll) {
    this._prefBranch.setBoolPref(this.THIRD_PARTY_PREF, aAcceptAll);
  },
  
  observe : function(aSubject, aTopic, aData) {
    if (aTopic != "nsPref:changed")
      return;
    
    if (aData == this.BEHAVIOR_PREF ||
        aData == this.LIFETIME_PREF ||
        aData == this.THIRD_PARTY_PREF) {
      this._syncPrefs();
      this._enforceThirdPartyPref();
      this._notifyListeners();
    }
  },
  
  init : function() {
    this._prefBranch =
      CWWB.prefs.getBranch(null).QueryInterface(
        Components.interfaces.nsIPrefBranch2);
    this._prefBranch.addObserver(this.BEHAVIOR_PREF, this, false);
    this._prefBranch.addObserver(this.LIFETIME_PREF, this, false);
    this._prefBranch.addObserver(this.THIRD_PARTY_PREF, this, false);
    
    this._syncPrefs();
    this._setStartupState();
  },
  
  cleanup : function() {
    this._prefBranch.removeObserver(this.BEHAVIOR_PREF, this);
    this._prefBranch.removeObserver(this.LIFETIME_PREF, this);
    this._prefBranch.removeObserver(this.THIRD_PARTY_PREF, this);
  }
};
