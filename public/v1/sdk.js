/**
 * ClientLabs SDK — minimal CDN bundle
 * Reads window.clientlabsConfig, exposes window.clientlabs, sends events to /api/v1/ingest
 */
!(function () {
  "use strict";
  console.log("ClientLabs SDK loaded");

  var config = (typeof window !== "undefined" && window.clientlabsConfig) || {};
  var key = config.key || "";
  var debug = config.debug === true;

  var STORAGE_KEY = "_cl_vid";
  var SESSION_KEY = "_cl_sid";

  function uuidV4() {
    var bytes = new Array(16);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    } else {
      for (var i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    var hex = Array.from(bytes, function (b) { return ("0" + (b & 0xff).toString(16)).slice(-2); }).join("");
    return hex.slice(0, 8) + "-" + hex.slice(8, 12) + "-" + hex.slice(12, 16) + "-" + hex.slice(16, 20) + "-" + hex.slice(20, 32);
  }

  function getOrCreateId(storageKey, fallback) {
    try {
      if (typeof localStorage === "undefined") return fallback();
      var existing = localStorage.getItem(storageKey);
      if (existing && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(existing)) return existing;
    } catch (e) {}
    var id = fallback();
    try {
      localStorage.setItem(storageKey, id);
    } catch (e) {}
    return id;
  }

  function getVisitorId() {
    return getOrCreateId(STORAGE_KEY, uuidV4);
  }

  function getSessionId() {
    try {
      if (typeof sessionStorage === "undefined") return "s_" + Date.now();
      var existing = sessionStorage.getItem(SESSION_KEY);
      if (existing) return existing;
      var id = "s_" + Math.random().toString(36).slice(2, 12) + "_" + Date.now().toString(36);
      sessionStorage.setItem(SESSION_KEY, id);
      return id;
    } catch (e) {
      return "s_" + Date.now();
    }
  }

  var queue = [];
  var flushTimer = null;
  var FLUSH_MS = 2000;
  var ENDPOINT = "/api/v1/ingest";

  function flush() {
    if (queue.length === 0) return;
    var batch = queue.splice(0, 20);
    var payload = {
      api_key: key,
      events: batch.map(function (e) {
        return {
          type: e.type,
          visitor_id: e.visitorId,
          session_id: e.sessionId,
          timestamp: typeof e.timestamp === "string" ? new Date(e.timestamp).getTime() : Date.now(),
          properties: e.properties,
        };
      }),
    };
    var url = (typeof window !== "undefined" && window.location.origin) || "";
    var body = JSON.stringify(payload);
    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        var blob = new Blob([body], { type: "application/json" });
        if (navigator.sendBeacon(url + ENDPOINT, blob)) return;
      }
      fetch(url + ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
        keepalive: true,
      }).catch(function () {});
    } catch (e) {}
  }

  function scheduleFlush() {
    if (flushTimer) return;
    flushTimer = setTimeout(function () {
      flushTimer = null;
      flush();
    }, FLUSH_MS);
  }

  function track(eventType, properties) {
    if (!eventType || typeof eventType !== "string") return;
    if (!key) {
      if (debug) console.warn("[ClientLabs] No key in clientlabsConfig; event dropped.");
      return;
    }
    var event = {
      type: eventType,
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      timestamp: new Date().toISOString(),
      properties: properties && typeof properties === "object" ? properties : {},
    };
    queue.push(event);
    if (queue.length >= 5) flush();
    else scheduleFlush();
    if (debug) console.log("[ClientLabs] track:", eventType, event.properties);
  }

  var api = {
    track: track,
  };

  if (typeof window !== "undefined") {
    var preQueue = window.clientlabs && window.clientlabs.q;
    window.clientlabs = api;
    if (Array.isArray(preQueue) && preQueue.length > 0) {
      for (var i = 0; i < preQueue.length; i++) {
        var args = preQueue[i];
        if (args && args.length >= 1) {
          var method = args[0];
          if (method === "track" && args.length >= 2) {
            track(args[1], args[2] || {});
          }
        }
      }
    }
  }
})();
