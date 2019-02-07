var constants = require("../constants");
var ethAccount = require("./eth-account");
var snackbar = require("./snackbar");

/*
 * On page load
 */
$(document).ready(() => {
  console.log("on ready");
  // Check if agent is running
  $.get({
    url: constants.AUTHID_AGENT_HOST,
    error: (xhr) => {
      if (xhr.status == 0) {
        alert("Make sure that you have an AuthID agent running on your device.");
        // exit
        chrome.tabs.update(null, {
          url: "http://www.onepair.ca" // Should be the zypher help page
        });
      } else {
        ethAccount.loadEthAccount(); // The first tab
      }
    }
  });

  // Copy the ID to the clip board
  $("#profile-id-view").click(() => {
    copyTextToClipboard($("#profile-id-view").val());

    snackbar.showSnackbar("Copied!", 3000);
  });
});


function copyTextToClipboard(text) {
  var copyFrom = $('<textarea/>');
  copyFrom.text(text);
  $("body").append(copyFrom);
  copyFrom.select();
  document.execCommand("copy");
  copyFrom.remove();
}
