class ZypherAuthIDClient {

  constructor() {
    this.initResponseListener();
    this.requests = {};
  }

  getAddress() {
    return new Promise(async (onSuccess, onError) => {
      var requestID = generateID();
      var request = {
        requestType: "zypherRequest",
        requestID: requestID,
        method: "getAddress"
      };

      this.addResponseListener(requestID, (result) => {
        if (result["result"]) {
          onSuccess(result["address"]);
        } else {
          onError(result)
        }
      });

      window.postMessage(request, "*");
    });
  }

  registerDID() {
    return new Promise(async (onSuccess, onError) => {
      var requestID = generateID();
      var request = {
        requestType: "zypherRequest",
        requestID: requestID,
        method: "registerDID"
      }

      this.addResponseListener(requestID, (result) => {
        if (result["result"]) {
          onSuccess(result["did"]);
        } else {
          onError(result)
        }
      });

      window.postMessage(request, "*");
    });
  }

  importDID(did) {
    return new Promise(async (onSuccess, onError) => {
      var requestID = generateID();
      var request = {
        requestType: "zypherRequest",
        requestID: requestID,
        method: "importDID",
        params: {
          did: did
        }
      }

      this.addResponseListener(requestID, (result) => {
        if (result["result"]) {
          onSuccess(result);
        } else {
          onError(result)
        }
      });

      window.postMessage(request, "*");
    });
  }

  authorizeProcessor(processorId, publicKey, sig, auth) {
    return new Promise(async (onSuccess, onError) => {
      var requestID = generateID();
      var request = {
        requestType: "zypherRequest",
        requestID: requestID,
        method: "authorizeProcessor",
        params: {
          processorId: processorId,
          publicKey: publicKey,
          sig: sig,
          auth: auth
        }
      }

      this.addResponseListener(requestID, (result) => {
        if (result["result"]) {
          onSuccess(result["processor"]);
        } else {
          onError(result)
        }
      });

      window.postMessage(request, "*");
    });
  }

  importProcessor(processorId, processorToken, privateKey) {
    return new Promise(async (onSuccess, onError) => {
      var requestID = generateID();
      var request = {
        requestType: "zypherRequest",
        requestID: requestID,
        method: "importProcessor",
        params: {
          processorId: processorId,
          processorToken: processorToken,
          privateKey: privateKey
        }
      }

      this.addResponseListener(requestID, (result) => {
        if (result["result"]) {
          onSuccess(result);
        } else {
          onError(result)
        }
      });

      window.postMessage(request, "*");
    });
  }

  revokeProcessor(processorId) {
    return new Promise(async (onSuccess, onError) => {
      var requestID = generateID();
      var request = {
        requestType: "zypherRequest",
        requestID: requestID,
        method: "revokeProcessor",
        params: {
          processorId: processorId
        }
      }

      this.addResponseListener(requestID, (result) => {
        if (result["result"]) {
          onSuccess(result);
        } else {
          onError(result)
        }
      });

      window.postMessage(request, "*");
    });
  }

  createJwt(claims, expiresIn) {
    return new Promise(async (onSuccess, onError) => {
      var requestID = generateID();
      var request = {
        requestType: "zypherRequest",
        requestID: requestID,
        method: "createJwt",
        params: {
          claims: claims,
          expiresIn: expiresIn
        }
      }

      this.addResponseListener(requestID, (result) => {
        if (result["result"]) {
          onSuccess(result["jwt"]);
        } else {
          onError(result)
        }
      });

      window.postMessage(request, "*");
    });
  }

  verifyJwt(jwt, id) {
    return new Promise(async (onSuccess, onError) => {
      var requestID = generateID();
      var request = {
        requestType: "zypherRequest",
        requestID: requestID,
        method: "verifyJwt",
        params: {
          jwt: jwt,
          id: id
        }
      }

      this.addResponseListener(requestID, (result) => {
        console.log("VERIFY JWT RESULT:", result);
        if (result["result"]) {
          onSuccess(result["verification"]);
        } else {
          onError(result)
        }
      });

      window.postMessage(request, "*");
    });
  }

  getInfo() {
    return new Promise(async (onSuccess, onError) => {
      var requestID = generateID();
      var request = {
        requestType: "zypherRequest",
        requestID: requestID,
        method: "getInfo"
      }

      this.addResponseListener(requestID, (result) => {
        if (result["result"]) {
          onSuccess(result["info"]);
        } else {
          onError(result)
        }
      });

      window.postMessage(request, "*");
    });
  }

  getPublicKeys() {
    return new Promise(async (onSuccess, onError) => {
      var requestID = generateID();
      var request = {
        requestType: "zypherRequest",
        requestID: requestID,
        method: "getPublicKeys"
      }

      this.addResponseListener(requestID, (result) => {
        if (result["result"]) {
          onSuccess(result["publicKeys"]);
        } else {
          onError(result)
        }
      });

      window.postMessage(request, "*");
    });
  }

  addResponseListener(requestID, responseListener) {
    this.requests[requestID] = responseListener;
  }

  /*
   * TODO: Only receive from this window!
   */
  initResponseListener() {
    window.addEventListener("message", (event) => {
      var request = event.data;

      if (request.requestType == "zypherResponse") {
        this.requests[request.requestID](request.result);
        delete this.requests[request.requestID]
      }
    });
  }

}

function generateID() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

global.authID = new ZypherAuthIDClient();
