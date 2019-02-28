var constants = require("../constants");
var ZypherWallet = require("zypher-client").ZypherWallet;
var ZypherAgent = require("zypher-client").ZypherAgent;
var ZypherAgentClient = require("../zypher-agent-client").ZypherAgentClient;

/*
 * Listen for messages from the background script
 */


var zypherWallet;
var zypherAgent;
var zypherAgentClient; // The extenstion background client

/*
 * TODO: respond on window close
 */
$(document).ready(() => {
  window.zypherWallet = new ZypherWallet(constants.AUTHID_AGENT_HOST);
  window.zypherAgent = new ZypherAgent(constants.AUTHID_AGENT_HOST);
  window.zypherAgentClient = new ZypherAgentClient();

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!("method" in request)) {
      sendResponse({
        err: "Invalid request format"
      });
    } else {
      switch (request.method) {
        case "getAddress":
          getAddress(request.requestID);
          break;

        case "registerDID":
          registerDID(request.requestID);
          break;

        case "importDID":
          console.log("import did request:", request);
          importDID(request.requestID, request.params.did);
          break;

        case "authorizeProcessor":
          authorizeProcessor(request.requestID, request.params.processorId,
            request.params.publicKey, request.params.sig, request.params.auth);
          break;

        case "importProcessor":
          importProcessor(request.requestID, request.params.processorId,
            request.params.processorToken, request.params.privateKey);
          break;

        case "revokeProcessor":
          revokeProcessor(request.requestID, request.params.processorId);
          break;

        case "createJwt":
          createJwt(request.requestID, request.params.claims, request.params.expiresIn);
          break;

        case "getPublicKeys":
          getPublicKeys(request.requestID);
          break;

        default:
          console.log("Invalid function");
          respondToAgent(request.requestID, {
            result: false
          }).then(() => {
            window.close();
          });
      }

      $("#cancel-button").click(async () => {
        await respondToAgent(request.requestID, {
          result: false
        });
        window.close();
      });
    }
  });
});

function getAddress(requestID) {
  return new Promise(async (onSuccess, onError) => {
    var protocol = await window.zypherAgentClient.getProtocol();

    getAccountInfo(protocol, async (accountInfo) => {
      $("#command-text-view").val("GET ADDRESS");
      /*
       * Here is where the real action happens
       */
      $("#confirm-button").click(async () => {
        var password = $("#password-input").val();

        /*
         * Try to register the did
         */
        try {
          var address = await window.zypherWallet.getAddress(protocol, password);
          await respondToAgent(requestID, {
            result: true,
            address: address
          });

          onSuccess();
          window.close();
        } catch (err) {
          await respondToAgent(requestID, {
            result: false
          });

          alert("Could not get address!");
          onError(err);
          window.close();
        }

      });
    });
  });
}

function registerDID(requestID) {
  return new Promise(async (onSuccess, onError) => {
    var protocol = await window.zypherAgentClient.getProtocol();

    getAccountInfo(protocol, async (accountInfo) => {
      if ("did" in accountInfo) {
        await respondToAgent(requestID, {
          result: false
        });
        alert("An ID already exists for this account.");
        window.close();
      } else {
        $("#command-text-view").val("REGISTER DID");

        /*
         * Here is where the real action happens
         */
        $("#confirm-button").click(async () => {
          var password = $("#password-input").val();

          try {
            var did = await window.zypherAgent.registerDID(protocol, password);
            await updateAccountDetails(protocol, password, did);
            await respondToAgent(requestID, {
              result: true,
              did: did
            });

            onSuccess();
            window.close();
          } catch (err) {
            console.log("error:", err);
            await respondToAgent(requestID, {
              result: false
            });

            alert("Could not register DID!");
            onError(err);
            window.close();
          }

        });
      }
    });
  });
}

function importDID(requestID, did) {
  return new Promise(async (onSuccess, onError) => {
    var protocol = await window.zypherAgentClient.getProtocol();

    getAccountInfo(protocol, async (accountInfo) => {
      if ("did" in accountInfo) {
        await respondToAgent(requestID, {
          result: false
        });
        alert("An ID already exists for this account.");
        window.close();
      } else {
        $("#command-text-view").val("IMPORT DID");

        /*
         * Here is where the real action happens
         */
        $("#confirm-button").click(async () => {
          var password = $("#password-input").val();

          try {
            await window.zypherAgent.importDID(password, did);
            await updateAccountDetails(protocol, password, did);
            await respondToAgent(requestID, {
              result: true
            });

            onSuccess();
            window.close();
          } catch (err) {
            await respondToAgent(requestID, {
              result: false
            });

            alert("Could not import DID!");
            onError(err);
            window.close();
          }
        });
      }
    });
  });
}

function authorizeProcessor(requestID, processorId, publicKey, sig, auth) {
  return new Promise(async (onSuccess, onError) => {
    var protocol = await window.zypherAgentClient.getProtocol();

    getAccountInfo(protocol, async (accountInfo) => {

      $("#command-text-view").val("AUTHORIZE");

      /*
       * Here is where the real action happens
       */
      $("#confirm-button").click(async () => {
        var password = $("#password-input").val();

        try {
          var processor = await window.zypherAgent.authorizeProcessor(protocol, password,
            processorId, publicKey, sig, auth);
          await respondToAgent(requestID, {
            result: true,
            processor: processor
          });

          onSuccess();
          window.close();
        } catch (err) {
          console.log("error:", err);
          await respondToAgent(requestID, {
            result: false
          });

          alert("Could not authorize processor!");
          onError(err);
          window.close();
        }
      });
    });
  });
}

function importProcessor(requestID, processorId, processorToken, privateKey) {
  return new Promise(async (onSuccess, onError) => {
    var protocol = await window.zypherAgentClient.getProtocol();

    getAccountInfo(protocol, async (accountInfo) => {

      $("#command-text-view").val("IMPORT");

      /*
       * Here is where the real action happens
       */
      $("#confirm-button").click(async () => {
        var password = $("#password-input").val();

        try {
          var processor = await window.zypherAgent.importProcessor(protocol, password,
            processorId, processorToken, privateKey);
          await respondToAgent(requestID, {
            result: true,
            processor: processor
          });

          onSuccess();
          window.close();
        } catch (err) {
          console.log("error:", err);
          await respondToAgent(requestID, {
            result: false
          });

          alert("Could not import processor!");
          onError(err);
          window.close();
        }
      });
    });
  });
}

function revokeProcessor(requestID, processorId) {
  return new Promise(async (onSuccess, onError) => {
    var protocol = await window.zypherAgentClient.getProtocol();

    getAccountInfo(protocol, async (accountInfo) => {

      $("#command-text-view").val("REVOKE");

      /*
       * Here is where the real action happens
       */
      $("#confirm-button").click(async () => {
        var password = $("#password-input").val();

        try {
          await window.zypherAgent.revokeProcessor(protocol, password, processorId);
          await respondToAgent(requestID, {
            result: true
          });

          onSuccess();
          window.close();
        } catch (err) {
          console.log("error:", err);
          await respondToAgent(requestID, {
            result: false
          });

          alert("Could not revoke processor!");
          onError(err);
          window.close();
        }
      });
    });
  });
}

function createJwt(requestID, claims, expiresIn) {
  return new Promise(async (onSuccess, onError) => {
    var protocol = await window.zypherAgentClient.getProtocol();

    getAccountInfo(protocol, async (accountInfo) => {

      $("#command-text-view").val("SIGN");

      /*
       * Here is where the real action happens
       */
      $("#confirm-button").click(async () => {
        var password = $("#password-input").val();

        try {
          var jwt =
            await window.zypherAgent.createJwt(protocol, password, claims, password);
          await respondToAgent(requestID, {
            result: true,
            jwt: jwt
          });

          onSuccess();
          window.close();
        } catch (err) {
          console.log("error:", err);
          await respondToAgent(requestID, {
            result: false
          });

          alert("Could not sign!");
          onError(err);
          window.close();
        }
      });
    });
  });
}

function getPublicKeys(requestID) {
  return new Promise(async (onSuccess, onError) => {
    var protocol = await window.zypherAgentClient.getProtocol();

    getAccountInfo(protocol, async (accountInfo) => {
      $("#command-text-view").val("GET PUBLIC KEYS");
      /*
       * Here is where the real action happens
       */
      $("#confirm-button").click(async () => {
        var password = $("#password-input").val();

        /*
         * Try to register the did
         */
        try {
          var publicKeys = await window.zypherWallet.getPublicKeys(protocol, password);
          await respondToAgent(requestID, {
            result: true,
            publicKeys: publicKeys
          });

          onSuccess();
          window.close();
        } catch (err) {
          await respondToAgent(requestID, {
            result: false
          });

          alert("Could not get public keys!");
          onError(err);
          window.close();
        }

      });
    });
  });
}

function respondToAgent(requestID, result) {
  return new Promise(async (onSuccess, onError) => {
    try {
      chrome.runtime.sendMessage({
        method: "respond",
        requestID: requestID,
        result: result
      }, (response) => {
        onSuccess(response);
      });
    } catch (err) {
      onError(err);
    }
  });
}

function getAccountInfo(protocol, callback) {
  switch (protocol) {
    case "eth":
      chrome.storage.local.get(["eth-account"], (accountInfo) => {
        callback(accountInfo["eth-account"])
      });
      break;
    default:
      callback(null);
  }
}




function updateAccountDetails(protocol, password) {
  return new Promise(async (onSuccess, onError) => {
    var address = await window.zypherWallet.getAddress(protocol, password);
    var walletInfo = await window.zypherWallet.getInfo(protocol, password);

    let accountInfo = {
      address: address
    };

    if ("did" in walletInfo["info"])
      accountInfo["did"] = walletInfo["info"]["did"];

    // store the account info
    chrome.storage.local.set({
      "eth-account": accountInfo
    }, () => {
      onSuccess({
        "eth-account": accountInfo
      });
    });
  });
}
