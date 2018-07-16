"use strict";

chrome.runtime.onInstalled.addListener(function() {
  console.log("extension installed");
  setContextMenus();
});

chrome.runtime.onMessage.addListener(function(request) {
  if (request === "setAuthToken") {
    setAuthToken();
  }
});

function setContextMenus() {
  chrome.contextMenus.create({
    id: "jike-post-office-context-menu",
    title: "即刻发动态",
    contexts: ["link"]
  });
}

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
