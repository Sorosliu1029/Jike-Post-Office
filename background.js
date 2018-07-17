"use strict";

chrome.runtime.onInstalled.addListener(function() {
  console.log("extension installed");
});

chrome.runtime.onMessage.addListener(function(request) {
  if (request === "setAuthToken") {
    setAuthToken();
  }
});

function setAuthToken() {
  chrome.tabs.create(
    {
      url: "http://web.okjike.com"
    },
    function(tab) {
      chrome.tabs.executeScript(
        tab.id,
        {
          code: "localStorage['auth-token']"
        },
        function(results) {
          chrome.storage.sync.set({ authToken: results[0] });
        }
      );
    }
  );
}
