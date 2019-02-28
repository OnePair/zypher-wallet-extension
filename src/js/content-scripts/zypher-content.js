var ZypherAgentClient = require("../zypher-agent-client").ZypherAgentClient;

//var authID = new ZypherAgentClient();
injectWepPageClient();

var zypherAgentClient = new ZypherAgentClient();

/*
 * TODO: Only receive messages from current page
 */
window.addEventListener("message", (event) => {
  // We only accept messages the current window
  /*if (event.source != Window) {
    return;
  }*/

  var request = event.data;

  if (request.requestType == "zypherRequest") {
    switch (request.method) {
      case "getAddress":
        getAddress(request.requestID);
        break;

      case "registerDID":
        registerDID(request.requestID);
        break;

      case "importDID":
        importDID(request.requestID, request.params);
        break;

      case "authorizeProcessor":
        authorizeProcessor(request.requestID, request.params);
        break;

      case "importProcessor":
        importProcessor(request.requestID, request.params);
        break;

      case "revokeProcessor":
        revokeProcessor(request.requestID, request.params);
        break;

      case "createJwt":
        createJwt(request.requestID, request.params);
        break;

      case "verifyJwt":
        verifyJwt(request.requestID, request.params);
        break;

      case "getInfo":
        getInfo(request.requestID);
        break;

      case "getPublicKeys":
        getPublicKeys(request.requestID);
        break;

      default:
        break;
    }
  }
});

function getAddress(requestID) {
  return new Promise(async (onSuccess, onError) => {
    try {
      var result = await zypherAgentClient.getAddress();

      broadcastResponse(requestID, result);

      onSuccess();
    } catch (err) {
      broadcastResponse(requestID, {
        result: false
      });
    }
  });
}

function registerDID(requestID) {
  return new Promise(async (onSuccess, onError) => {
    try {
      var result = await zypherAgentClient.registerDID();

      broadcastResponse(requestID, result);

      onSuccess();
    } catch (err) {
      broadcastResponse(requestID, {
        result: false
      });
    }
  });
}

function importDID(requestID, params) {
  return new Promise(async (onSuccess, onError) => {
    try {
      var result = await zypherAgentClient.importDID(params.did);

      broadcastResponse(requestID, result);

      onSuccess();
    } catch (err) {
      broadcastResponse(requestID, {
        result: false
      });
    }
  });
}

function authorizeProcessor(requestID, params) {
  return new Promise(async (onSuccess, onError) => {
    try {
      var result =
        await zypherAgentClient.authorizeProcessor(params.processorId,
          params.publicKey, params.sig, params.auth);

      broadcastResponse(requestID, result);

      onSuccess();
    } catch (err) {
      broadcastResponse(requestID, {
        result: false
      });
    }
  });
}

function importProcessor(requestID, params) {
  return new Promise(async (onSuccess, onError) => {
    try {
      var result =
        await zypherAgentClient.importProcessor(params.processorId,
          params.processorToken, params.privateKey);

      broadcastResponse(requestID, result);

      onSuccess();
    } catch (err) {
      broadcastResponse(requestID, {
        result: false
      });
    }
  });
}

function revokeProcessor(requestID, params) {
  return new Promise(async (onSuccess, onError) => {
    try {
      var result =
        await zypherAgentClient.revokeProcessor(params.processorId);

      broadcastResponse(requestID, result);

      onSuccess();
    } catch (err) {
      broadcastResponse(requestID, {
        result: false
      });
    }
  });
}

function createJwt(requestID, params) {
  return new Promise(async (onSuccess, onError) => {
    try {
      var result =
        await zypherAgentClient.createJwt(params.claims, params.expiresIn);

      broadcastResponse(requestID, result);

      onSuccess();
    } catch (err) {
      broadcastResponse(requestID, {
        result: false
      });
    }
  });
}

function verifyJwt(requestID, params) {
  return new Promise(async (onSuccess, onError) => {
    try {
      var result =
        await zypherAgentClient.verifyJwt(params.jwt, params.id);

      broadcastResponse(requestID, result);

      onSuccess();
    } catch (err) {
      broadcastResponse(requestID, {
        result: false
      });
    }
  });
}

function getInfo(requestID) {
  return new Promise(async (onSuccess, onError) => {
    try {
      var info =
        await zypherAgentClient.getInfo();

      var result = {
        result: true,
        info: info
      };

      broadcastResponse(requestID, result);

      onSuccess();
    } catch (err) {
      broadcastResponse(requestID, {
        result: false,
        err: err
      });
    }
  });
}

function getPublicKeys(requestID) {
  return new Promise(async (onSuccess, onError) => {
    try {
      var result = await zypherAgentClient.getPublicKeys();

      broadcastResponse(requestID, result);

      onSuccess();
    } catch (err) {
      broadcastResponse(requestID, {
        result: false
      });
    }
  });
}

/*
 * Broadcast response to the web page
 */
function broadcastResponse(requestID, result) {
  var response = {
    requestType: "zypherResponse",
    requestID: requestID,
    result: result
  }
  window.postMessage(response, "*");
}


function injectWepPageClient() {
  var script = document.createElement("script");
  // TODO: add "script.js" to web_accessible_resources in manifest.json
  script.src = chrome.extension.getURL('zypher-webpage-client.js');
  script.onload = function() {
    this.remove();
  };

  (document.head || document.documentElement).appendChild(script);
}
