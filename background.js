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
      url: "https://web.okjike.com"
    },
    function(tab) {
      chrome.tabs.executeScript(
        tab.id,
        {
          code: "localStorage['access-token']"
        },
        function(results) {
          chrome.storage.sync.set({ authToken: results[0] });
        }
      );
    }
  );
}
