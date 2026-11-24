(function () {
  "use strict";
  var KEY = "mossplanet-motion";
  var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var userOff = false;
  try { userOff = window.localStorage.getItem(KEY) === "off"; } catch (e) { userOff = false; }
  var listeners = [];
  var root = document.documentElement;
  function apply() { root.classList.toggle("motion-off", userOff); }
  function fire() {
    var ev = { matches: api.matches };
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](ev); } catch (e) { /* 他の処理を止めない */ }
    }
  }
  var api = {
    get matches() { return mq.matches || userOff; },
    systemOff: function () { return mq.matches; },
    userOff: function () { return userOff; },
    setUserOff: function (off) {
      userOff = !!off;
      try {
        if (userOff) window.localStorage.setItem(KEY, "off");
        else window.localStorage.removeItem(KEY);
      } catch (e) { /* 保存できなくても、このページでは効く */ }
      apply();
      fire();
    },
    addEventListener: function (type, fn) { if (type === "change") listeners.push(fn); },
    addListener: function (fn) { listeners.push(fn); }
  };
  if (mq.addEventListener) mq.addEventListener("change", fire);
  else if (mq.addListener) mq.addListener(fire);
  apply();
  window.mossReduceMotion = api;
})();
