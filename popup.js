"use strict";

let postHeaders;
let linkInfo;
let topicInfo;

function prefixUrl(url) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  } else {
    return "http://" + url;
  }
}

chrome.storage.sync.get("authToken", function(data) {
  if (!data.authToken) {
    const authWarning = $("#auth-warning");
    if (authWarning.css("display") === "none") {
      authWarning.show();
    }
  } else {
    postHeaders = {
      Accept: "application/json",
      "App-Version": "4.1.0",
      "Content-Type": "application/json",
      // DNT: 1,
      // Origin: "http://web.okjike.com",
      platform: "web",
      // Referer: "http://web.okjike.com",
      // "User-Agent": "Jike Post Office",
      "x-jike-app-auth-jwt": data.authToken
    };
  }
});

$("#auth-btn").click(function(event) {
  chrome.runtime.sendMessage("setAuthToken");
});

$("#toggle-link").click(function(event) {
  $("#topic-search").hide();
  const linkUploader = $("#link-uploader");
  if (linkUploader.css("display") === "none") {
    linkUploader.show();
  } else {
    linkUploader.hide();
  }
});

$("#toggle-topic").click(function(event) {
  $("#link-uploader").hide();
  const topicSearch = $("#topic-search");
  if (topicSearch.css("display") === "none") {
    topicSearch.show();
  } else {
    topicSearch.hide();
  }
});

$("#link-input").on("input", function(event) {
  const addLink = $("#add-link");
  if (event.target.value) {
    addLink.prop("disabled", false);
    addLink.addClass("btn-primary").removeClass("btn-disabled");
  } else {
    addLink.prop("disabled", true);
    addLink.addClass("btn-disabled").removeClass("btn-primary");
  }
});

$("#add-link").click(function(event) {
  $.ajax({
    url: "https://app.jike.ruguoapp.com/1.0/readability/extract",
    type: "post",
    data: JSON.stringify({
      link: prefixUrl($("#link-input").val())
    }),
    contentType: "application/json",
    headers: postHeaders,
    dataType: "json",
    success: function(data) {
      if (data.success) {
        linkInfo = data.data;
        $(".link-info > span").text(linkInfo.title);
        
      }
    }
  });
  $(".link-info").show();
  $("#link-uploader").hide();
});
