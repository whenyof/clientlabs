/**
 * ClientLabs SDK — production CDN bundle
 * Reads window.clientlabsConfig, exposes window.clientlabs.track, sends events to /api/v1/ingest
 */
!(function () {
  "use strict";

  var config;
  var key = "";
  var debug = false;
  try {
    config = (typeof window !== "undefined" && window.clientlabsConfig) || {};
    key = typeof config.key === "string" ? config.key : "";
    debug = config.debug === true;
    if (!config || (config && typeof config.key === "undefined")) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn("[ClientLabs] clientlabsConfig missing or invalid; events will be dropped until key is set.");
      }
    }
  } catch (e) {
    if (typeof console !== "undefined" && console.warn) {
      console.warn("[ClientLabs] Failed to read config:", e);
    }
  }

  if (debug && typeof console !== "undefined") {
    console.log("ClientLabs SDK loaded");
  }

  function generateFallbackUUID() {
    try {
      var bytes = new Uint8Array(16);
      if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        crypto.getRandomValues(bytes);
      } else {
        for (var i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
      }
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      var hex = Array.prototype.map.call(bytes, function (b) {
        return ("0" + (b & 0xff).toString(16)).slice(-2);
      }).join("");
      return hex.slice(0, 8) + "-" + hex.slice(8, 12) + "-" + hex.slice(12, 16) + "-" + hex.slice(16, 20) + "-" + hex.slice(20);
    } catch (e) {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0;
        var v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
  }

  function getVisitorId() {
    try {
      var id = null;
      if (typeof localStorage !== "undefined") {
        id = localStorage.getItem("cl_vid");
      }
      if (!id) {
        id = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : generateFallbackUUID();
        try {
          if (typeof localStorage !== "undefined") {
            localStorage.setItem("cl_vid", id);
          }
        } catch (e) {}
      }
      return id;
    } catch (e) {
      return (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : generateFallbackUUID();
    }
  }

  var SESSION_KEY = "_cl_sid";
  function getSessionId() {
    try {
      if (typeof sessionStorage === "undefined") return generateFallbackUUID();
      var existing = sessionStorage.getItem(SESSION_KEY);
      if (existing) return existing;
      var id = generateFallbackUUID();
      sessionStorage.setItem(SESSION_KEY, id);
      return id;
    } catch (e) {
      return generateFallbackUUID();
    }
  }

  var queue = [];
  var flushTimer = null;
  var FLUSH_INTERVAL_MS = 5000;
  var MAX_QUEUE_BATCH = 20;
  var ENDPOINT = "/api/v1/ingest";
  var MAX_RETRIES = 3;

  function sendBatch(payload, retryCount) {
    retryCount = retryCount || 0;
    var url = "";
    try {
      url = (typeof window !== "undefined" && window.location && window.location.origin) ? window.location.origin + ENDPOINT : ENDPOINT;
    } catch (e) {
      url = ENDPOINT;
    }
    var body = "";
    try {
      body = JSON.stringify(payload);
    } catch (e) {
      return;
    }
    try {
      if (retryCount === 0 && typeof navigator !== "undefined" && navigator.sendBeacon) {
        var blob = new Blob([body], { type: "application/json" });
        if (navigator.sendBeacon(url, blob)) return;
      }
    } catch (e) {}
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
      keepalive: true,
    }).then(function (res) {
      if (!res.ok && retryCount < MAX_RETRIES) {
        var delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        setTimeout(function () {
          sendBatch(payload, retryCount + 1);
        }, delay);
      }
    }).catch(function () {
      if (retryCount < MAX_RETRIES) {
        var delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        setTimeout(function () {
          sendBatch(payload, retryCount + 1);
        }, delay);
      }
    });
  }

  function flush() {
    if (queue.length === 0) return;
    var batch = queue.splice(0, MAX_QUEUE_BATCH);
    var now = Date.now();
    var events = batch.map(function (e) {
      var ts = e.timestamp;
      var tsMs = typeof ts === "number" && ts > 0 ? ts : (typeof ts === "string" ? new Date(ts).getTime() : now);
      if (isNaN(tsMs)) tsMs = now;
      return {
        type: e.type,
        visitor_id: e.visitorId,
        session_id: e.sessionId,
        timestamp: tsMs,
        properties: e.properties,
      };
    });
    var payload = { api_key: key, events: events };
    sendBatch(payload, 0);
  }

  function scheduleFlush() {
    if (flushTimer) return;
    flushTimer = setTimeout(function () {
      flushTimer = null;
      flush();
    }, FLUSH_INTERVAL_MS);
  }

  function track(eventType, properties) {
    try {
      if (!eventType || typeof eventType !== "string") return;
      if (!key) {
        if (debug && typeof console !== "undefined") {
          console.warn("[ClientLabs] No key in clientlabsConfig; event dropped.");
        }
        return;
      }
      var props = (properties != null && typeof properties === "object" && !Array.isArray(properties)) ? properties : {};
      var event = {
        type: eventType,
        visitorId: getVisitorId(),
        sessionId: getSessionId(),
        timestamp: new Date().toISOString(),
        properties: props,
      };
      if (debug && typeof console !== "undefined") {
        console.log("ClientLabs event:", event);
      }
      queue.push(event);
      if (queue.length >= MAX_QUEUE_BATCH) {
        flush();
      } else {
        scheduleFlush();
      }
    } catch (e) {
      if (debug && typeof console !== "undefined") {
        console.warn("[ClientLabs] track error:", e);
      }
    }
  }

  var api = { track: track };

  if (typeof window !== "undefined") {
    var preQueue = window.clientlabs && window.clientlabs.q;
    window.clientlabs = api;
    try {
      if (preQueue && (Array.isArray(preQueue) || (typeof preQueue.length === "number" && preQueue.length > 0))) {
        var len = preQueue.length;
        for (var i = 0; i < len; i++) {
          var args = preQueue[i];
          if (args && typeof args.length !== "undefined" && args.length >= 2 && args[0] === "track") {
            track(args[1], args[2] || {});
          }
        }
      }
    } catch (e) {
      if (debug && typeof console !== "undefined") {
        console.warn("[ClientLabs] pre-load queue processing error:", e);
      }
    }
  }
})();
