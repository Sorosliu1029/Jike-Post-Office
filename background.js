"use strict";

chrome.runtime.onInstalled.addListener(function() {
  console.log("extension installed");
  setContextMenus();
});

function setContextMenus() {
  chrome.contextMenus.create({
    id: "jike-post-office-context-menu",
    title: "即刻发动态",
    contexts: ["link"]
  });
}
