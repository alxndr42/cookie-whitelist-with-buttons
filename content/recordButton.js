// Copyright 2008 Alexander Dietrich <alexander@dietrich.cx>
// Released under the terms of the GNU General Public License version 2 or later.

const CWWBRecord = {
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
  
  _recordButton : undefined,
  _prefBranch   : undefined,
  _behavior     : undefined,
  _lifetime     : undefined,
  _acceptAll    : undefined,
  _tooltipOff   : undefined,
  _tooltipOn    : undefined,
  
  _updateUI : function() {
    if (this._behavior == this.BEHAVIOR_REJECT) {
      this._recordButton.src = "chrome://cwwb/skin/record-off.png";
      this._recordButton.tooltipText = this._tooltipOff;
    }
    else {
      this._recordButton.src = "chrome://cwwb/skin/record-on.png";
      this._recordButton.tooltipText = this._tooltipOn;
    }
  },
  
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
    const startupState = this._prefBranch.getIntPref(this.STARTUP_STATE_PREF);
    if (startupState == this.STARTUP_STATE_LAST)
      return;
    
    if (this._getWindowCount() > 1)
      return;
    
    const recordOn = (startupState == this.STARTUP_STATE_ON);
    this._setState(recordOn);
  },
  
  _getWindowCount : function() {
    const mediator =
      Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(
        Components.interfaces.nsIWindowMediator);
    const enumerator = mediator.getEnumerator("navigator:browser");
    
    var count = 0;
    while (enumerator.hasMoreElements()) {
      enumerator.getNext();
      count++;
    }
    
    return count;
  },
  
  _enforceThirdPartyPref : function() {
    if (this._acceptAll && this._behavior == this.BEHAVIOR_ACCEPT)
      this._setBehavior(this.BEHAVIOR_ACCEPT_ALL);
    else
    if (!this._acceptAll && this._behavior == this.BEHAVIOR_ACCEPT_ALL)
      this._setBehavior(this.BEHAVIOR_ACCEPT);
  },
  
  _syncBehaviorPref : function() {
    this._behavior = this._prefBranch.getIntPref(this.BEHAVIOR_PREF);
  },
  
  _syncLifetimePref : function() {
    this._lifetime = this._prefBranch.getIntPref(this.LIFETIME_PREF);
  },
  
  _syncThirdPartyPref : function() {
    this._acceptAll = this._prefBranch.getBoolPref(this.THIRD_PARTY_PREF);
  },
  
  _syncAllPrefs : function() {
    this._syncBehaviorPref();
    this._syncLifetimePref();
    this._syncThirdPartyPref();
  },
  
  _addPrefObservers : function() {
    this._prefBranch.addObserver(this.BEHAVIOR_PREF, this, false);
    this._prefBranch.addObserver(this.LIFETIME_PREF, this, false);
    this._prefBranch.addObserver(this.THIRD_PARTY_PREF, this, false);
  },
  
  _removePrefObservers : function() {
    this._prefBranch.removeObserver(this.BEHAVIOR_PREF, this);
    this._prefBranch.removeObserver(this.LIFETIME_PREF, this);
    this._prefBranch.removeObserver(this.THIRD_PARTY_PREF, this);
  },
  
  _onClick : function(aEvent) {
    if (aEvent.button != 0)
      return false;
    
    const recordOn = (this._behavior == this.BEHAVIOR_REJECT);
    this._setState(recordOn);
    
    return true;
  },
  
  observe : function(aSubject, aTopic, aData) {
    if (aTopic != "nsPref:changed")
      return;
    
    if (aData == this.BEHAVIOR_PREF) {
      this._syncBehaviorPref();
      this._enforceThirdPartyPref();
      this._updateUI();
    }
    else
    if (aData == this.LIFETIME_PREF) {
      this._syncLifetimePref();
    }
    else
    if (aData == this.THIRD_PARTY_PREF) {
      this._syncThirdPartyPref();
      this._enforceThirdPartyPref();
    }
  },
  
  init : function() {
    this._recordButton = document.getElementById("cwwb-record-button");
    
    const properties = document.getElementById("cwwb-properties");
    this._tooltipOff = properties.getString("recordOff.tooltip");
    this._tooltipOn  = properties.getString("recordOn.tooltip");
    
    const prefs =
      Components.classes["@mozilla.org/preferences-service;1"].getService(
        Components.interfaces.nsIPrefService);
    this._prefBranch =
      prefs.getBranch(null).QueryInterface(
        Components.interfaces.nsIPrefBranch2);
    this._addPrefObservers();
    
    this._syncAllPrefs();
    this._setStartupState();
    this._updateUI();
    
    this._recordButton.addEventListener(
      "click",
      function(event) { return CWWBRecord._onClick(event) },
      true);
  },
  
  cleanup : function() {
    this._removePrefObservers();
  }
};
