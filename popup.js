"use strict";

let postHeaders;
let linkInfo;
let searchResults;
let topicInfo;

function prefixUrl(url) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  } else {
    return "http://" + url;
  }
}

function resetLinkInfo() {
  linkInfo = undefined;
  $(".link-info").hide();
  $(".link-info > span").text("果果正在解析链接...💪");
}

function resetTopicInfo() {
  topicInfo = undefined;
  $(".topic-info").hide();
  $(".topic-info > p > span").text("主题名");
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
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(
      tabs
    ) {
      const url = tabs[0].url;
      $.ajax({
        url: "https://app.jike.ruguoapp.com/1.0/readability/extract",
        type: "post",
        data: JSON.stringify({
          link: url
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
      $("#link-input").val(url);
      $("#add-link").prop("disabled", false);
      $("#add-link")
        .addClass("btn-primary")
        .removeClass("btn-disabled");
      $(".link-info > span").text("果果正在解析链接...💪");
      $(".link-info").show();
      $("#link-uploader").hide();
    });
  }
});

$(document).ready(function() {
  $(".input").val("");
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
  $(".link-info > span").text("果果正在解析链接...💪");
  $(".link-info").show();
  $("#link-uploader").hide();
});

$("#link-info-remove").click(function(event) {
  resetLinkInfo();
});

$("#search-input").on("input", function(event) {
  if (event.target.value) {
    $.ajax({
      url: "https://app.jike.ruguoapp.com/1.0/users/topics/search",
      type: "post",
      data: JSON.stringify({
        keywords: event.target.value,
        limit: 8,
        onlyUserPostEnabled: true,
        type: "ALL"
      }),
      contentType: "application/json",
      headers: postHeaders,
      dataType: "json",
      success: function(data) {
        if (data.count) {
          searchResults = data.data;
          $(".post-creator-topic-search-result").show();
          const searchResultList = $(".result-list");
          searchResultList.empty();
          for (const result of searchResults) {
            searchResultList.append(`<li class="result-item">
            <svg class="symbol symbol-topic">
              <use xlink:href="#symbol-topic"></use>
            </svg>
            <span>${result.content}</span>
          </li>`);
          }
        }
      }
    });
  } else {
    $(".post-creator-topic-search-result").hide();
    $(".result-list").empty();
  }
});

$(".result-list").on("click", "li", function(event) {
  const topicName = $(this)
    .text()
    .trim();
  for (const t of searchResults) {
    if (t.content === topicName) {
      topicInfo = t;
      break;
    }
  }
  $(".topic-info > p > span").text(topicInfo.content);
  $(".topic-info").show();
  $(".post-creator-topic-search-result").hide();
  $(".result-list").empty();
  $("#topic-search").hide();
});

$("#topic-info-remove").click(function(event) {
  resetTopicInfo();
});

$("#send").click(function(event) {
  const content = $(".input")
    .val()
    .trim();
  if (content || linkInfo) {
    const data = { content: content };
    if (linkInfo) {
      data.linkInfo = linkInfo;
    }
    if (topicInfo) {
      data.submitToTopic = topicInfo.id;
    }
    $.ajax({
      url: "https://app.jike.ruguoapp.com/1.0/originalPosts/create",
      type: "post",
      data: JSON.stringify(data),
      contentType: "application/json",
      headers: postHeaders,
      dataType: "json",
      success: function(data) {
        $(".input").val("");
        resetLinkInfo();
        resetTopicInfo();
        $("#toast > span").text(data.toast);
        $("#toast").show();
        setTimeout(function() {
          $("#toast").hide();
        }, 3000);
      },
      statusCode: {
        401: function() {
          $("#toast > span").text("Auth Token已过期，请重新授权");
          $("#toast").show();
          $("#auth-warning").show();
          chrome.storage.sync.remove("authToken");
        }
      }
    });
  }
});
