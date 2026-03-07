!(function(){
  if (window.clientlabs && !window.clientlabs.q) return;
  if (document.querySelector('script[src*="sdk.js"]')) return;
  window.clientlabs = function(){ (window.clientlabs.q = window.clientlabs.q || []).push(arguments); };
  window.clientlabs.l = Date.now();
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://cdn.clientlabs.io/v1/sdk.js";
  var f = document.getElementsByTagName("script")[0];
  if (f && f.parentNode) f.parentNode.insertBefore(s, f);
})();
