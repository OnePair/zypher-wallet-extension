var constants = require("../constants");
var ZypherWallet = require("zypher-client").ZypherWallet;
var ZypherAgent = require("zypher-client").ZypherAgent;

// Default for now
var protocol = "eth";


var zypherWallet = new ZypherWallet(constants.AUTHID_AGENT_HOST);
var zypherAgent = new ZypherAgent(constants.AUTHID_AGENT_HOST);

var methodRequests = {};

chrome.browserAction.onClicked.addListener((tab) => {
  chrome.tabs.update(null, {
    url: "wallet-page.html"
  });
});


/*
 * TODO: sendResponse
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!("method" in request)) {
    sendResponse({
      err: "Invalid request format"
    });
  } else {
    switch (request.method) {
      case "respond":
        var tabId = methodRequests[request.requestID];
        delete methodRequests[request.requestID];

        chrome.tabs.sendMessage(tabId, {
          type: "response",
          requestID: request.requestID,
          result: request.result
        });

        break;

      case "setProtocol":
        protocol = request.params.protocol;

        sendResponse({
          protocol: protocol
        });
        break;

      case "getProtocol":
        sendResponse({
          protocol: protocol
        });
        break;

      case "getAddress":
        var requestID = generateID();
        userConfirmation("getAddress", requestID, null, sender);

        sendResponse({
          requestID: requestID
        });
        break;

      case "registerDID":
        var requestID = generateID();
        userConfirmation("registerDID", requestID, null, sender);

        sendResponse({
          requestID: requestID
        });
        break;

      case "importDID":
        var requestID = generateID();
        userConfirmation("importDID", requestID, request.params, sender);

        sendResponse({
          requestID: requestID
        });
        break;

      case "authorizeProcessor":
        var requestID = generateID();
        userConfirmation("authorizeProcessor", requestID, request.params, sender);

        sendResponse({
          requestID: requestID
        });
        break;

      case "importProcessor":
        var requestID = generateID();
        userConfirmation("importProcessor", requestID, request.params, sender);

        sendResponse({
          requestID: requestID
        });
        break;

      case "revokeProcessor":
        var requestID = generateID();
        userConfirmation("revokeProcessor", requestID, request.params, sender);

        sendResponse({
          requestID: requestID
        });
        break;

      case "createJwt":
        var requestID = generateID();
        userConfirmation("createJwt", requestID, request.params, sender);

        sendResponse({
          requestID: requestID
        });
        break;

      case "getPublicKeys":
        var requestID = generateID();
        userConfirmation("getPublicKeys", requestID, null, sender);

        sendResponse({
          requestID: requestID
        });
        break;

      default:
        sendResponse({
          response: "Invalid request!"
        });
    }
  }
});


function userConfirmation(method, requestID, params, sender) {
  return new Promise(async (onSuccess) => {
    var tab = await createTab("user-confirmation.html");

    methodRequests[requestID] = sender.tab.id;

    chrome.tabs.sendMessage(tab.id, {
      method: method,
      requestID: requestID,
      params: params
    });
    onSuccess();
  });
}


function createTab(url) {
  return new Promise((onSuccess) => {
    chrome.tabs.create({
      url
    }, async tab => {
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (info.status === 'complete' && tabId === tab.id) {
          chrome.tabs.onUpdated.removeListener(listener);
          onSuccess(tab);
        }
      });
    });
  });
}

function generateID() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
