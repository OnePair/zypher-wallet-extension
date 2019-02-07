var constants = require("./constants");
var ZypherWallet = require("zypher-client").ZypherWallet;
var ZypherAgent = require("zypher-client").ZypherAgent;

/*
 * TODO: set authidProvider to this in web pages
 */
module.exports.ZypherAgentClient = class {
  constructor() {
    this.zypherAgent = new ZypherAgent(constants.AUTHID_AGENT_HOST);
    this.zypherWallet = new ZypherWallet(constants.AUTHID_AGENT_HOST);

    this.initMessageListener();
    this.requests = {};
  }

  /*
   * Set the id protocol
   */
  setProtocol(protocol) {
    return new Promise(async (onSuccess, onError) => {
      try {
        chrome.runtime.sendMessage({
          method: "setProtocol",
          params: {
            protocol: protocol
          }
        }, (response) => {
          onSuccess(response);
        });
      } catch (err) {
        onError(err);
      }
    });
  }

  getProtocol() {
    return new Promise(async (onSuccess, onError) => {
      try {
        chrome.runtime.sendMessage({
          method: "getProtocol"
        }, (response) => {
          onSuccess(response["protocol"]);
        });
      } catch (err) {
        onError(err);
      }
    });
  }

  getAddress() {
    return new Promise(async (onSuccess, onError) => {
      try {
        chrome.runtime.sendMessage({
          method: "getAddress"
        }, (response) => {
          this.addResponseListener(response.requestID, (result) => {
            if (result["result"]) {
              onSuccess(result);
            } else {
              onError(result)
            }
          });
        });
      } catch (err) {
        onError(err);
      }
    });
  }

  registerDID() {
    return new Promise(async (onSuccess, onError) => {
      try {
        chrome.runtime.sendMessage({
          method: "registerDID"
        }, (response) => {
          this.addResponseListener(response.requestID, (result) => {
            if (result["result"]) {
              onSuccess(result);
            } else {
              onError(result)
            }
          });
        });
      } catch (err) {
        onError(err);
      }
    });
  }

  importDID(did) {
    return new Promise(async (onSuccess, onError) => {
      try {
        chrome.runtime.sendMessage({
          method: "importDID",
          params: {
            did: did
          }
        }, (response) => {
          this.addResponseListener(response.requestID, (result) => {
            if (result["result"]) {
              onSuccess(result);
            } else {
              onError(result)
            }
          });
        });
      } catch (err) {
        onError(err);
      }
    });
  }

  authorizeProcessor(processorId, publicKey, sig, auth) {
    return new Promise(async (onSuccess, onError) => {
      try {
        chrome.runtime.sendMessage({
          method: "authorizeProcessor",
          params: {
            processorId: processorId,
            publicKey: publicKey,
            sig: sig,
            auth: auth
          }
        }, (response) => {
          this.addResponseListener(response.requestID, (result) => {
            if (result["result"]) {
              onSuccess(result);
            } else {
              onError(result)
            }
          });
        });
      } catch (err) {
        onError(err);
      }
    });
  }

  importProcessor(processorId, processorToken, privateKey) {
    return new Promise(async (onSuccess, onError) => {
      try {
        chrome.runtime.sendMessage({
          method: "importProcessor",
          params: {
            processorId: processorId,
            processorToken: processorToken,
            privateKey: privateKey
          }
        }, (response) => {
          this.addResponseListener(response.requestID, (result) => {
            if (result["result"]) {
              onSuccess(result);
            } else {
              onError(result)
            }
          });
        });
      } catch (err) {
        onError(err);
      }
    });
  }

  revokeProcessor(processorId) {
    return new Promise(async (onSuccess, onError) => {
      try {
        chrome.runtime.sendMessage({
          method: "revokeProcessor",
          params: {
            processorId: processorId
          }
        }, (response) => {
          this.addResponseListener(response.requestID, (result) => {
            if (result["result"]) {
              onSuccess(result);
            } else {
              onError(result)
            }
          });
        });
      } catch (err) {
        onError(err);
      }
    });
  }

  createJwt(claims, expiresIn) {
    return new Promise(async (onSuccess, onError) => {
      try {
        chrome.runtime.sendMessage({
          method: "createJwt",
          params: {
            claims: claims,
            expiresIn: expiresIn
          }
        }, (response) => {
          this.addResponseListener(response.requestID, (result) => {
            if (result["result"]) {
              onSuccess(result);
            } else {
              onError(result)
            }
          });
        });
      } catch (err) {
        onError(err);
      }
    });
  }

  verifyJwt(jwt, id) {
    return new Promise(async (onSuccess, onError) => {
      try {
        var verificationResult = await this.zypherAgent.verifyJwt(jwt, id);

        var result = {
          result: true,
          verification: verificationResult
        }

        onSuccess(result);
      } catch (err) {
        onError(err);
      }
    });
  }

  getInfo() {
    return new Promise(async (onSuccess, onError) => {
      try {
        var protocol = await this.getProtocol();
        var info = await this.zypherWallet.getInfo(protocol);
        onSuccess(info);
      } catch (err) {
        onError(err);
      }
    });
  }
  getPublicKeys() {
    return new Promise(async (onSuccess, onError) => {
      try {
        chrome.runtime.sendMessage({
          method: "getPublicKeys"
        }, (response) => {
          this.addResponseListener(response.requestID, (result) => {
            if (result["result"]) {
              onSuccess(result);
            } else {
              onError(result)
            }
          });
        });
      } catch (err) {
        onError(err);
      }
    });
  }

  addResponseListener(requestID, listener) {
    this.requests[requestID] = listener;
  }

  initMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if ("type" in request) {
        switch (request.type) {
          case "response":
            this.requests[request.requestID](request.result);
            delete this.requests[request.requestID]
            break;
          default:
            break;
        }
      }

    });
  }
}