'use strict';

chrome.storage.sync.get('authToken', function(data) {
  console.log(data.authToken)
});

function setAuthToken() {
  chrome.tabs.create(
    {
      url: "http://web.okjike.com"
    },
    function(tab) {
      chrome.tabs.executeScript(tab.id, {
        code: "localStorage['auth-token']"
      }, function(results) {
        console.log(results[0])
      });
    }
  );
}