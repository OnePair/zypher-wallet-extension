var constants = require("../constants");
var createPassword = require("./create-password").createPassword;
var showSeed = require("./show-seed");
var snackbar = require("./snackbar");
var ZypherWallet = require("zypher-client").ZypherWallet;
var ZypherAgentClient = require("../zypher-agent-client").ZypherAgentClient;
var Web3 = require("web3");
var util = require("util");

const PROTOCOL = "eth";

var zypherWallet;
var zypherAgentClient;

module.exports.loadEthAccount = () => {
  if (window.zypherWallet == undefined) {
    window.zypherWallet = new ZypherWallet(constants.AUTHID_AGENT_HOST);
    window.web3 = new Web3(new Web3.providers.HttpProvider(constants.ETH_NODE));
    window.zypherAgentClient = new ZypherAgentClient();
  }

  /*
   * Check if an account already exists
   */
  chrome.storage.local.get(["eth-account"], (accountDetails) => {
    if ($.isEmptyObject(accountDetails))
      loadAccountSetup();
    else
      loadAccount(accountDetails);
  });
}

function loadAccountSetup() {
  $("#eth-account-div").css({
    "display": "none"
  });

  createAccount();
}

function createAccount() {
  return new Promise(async (onSuccess, onError) => {
    $("#eth-account-setup-div").css({
      "display": "block"
    });

    var passwordReceipt = await createPassword(window.zypherWallet, true);

    if (!passwordReceipt["seedConfirmed"])
      await showSeed.showSeed(window.zypherWallet, PROTOCOL, passwordReceipt["password"]);

    var accountDetails = await updateAccountDetails(passwordReceipt["password"]);
    await loadAccount(accountDetails);
  });
}

function updateAccountDetails(password) {
  return new Promise(async (onSuccess, onError) => {
    var address = await window.zypherWallet.getAddress(PROTOCOL, password);
    var walletInfo = await window.zypherWallet.getInfo(PROTOCOL, password);

    let accountInfo = {
      address: address
    };

    if ("name" in walletInfo["info"])
      accountInfo["name"] = walletInfo["info"]["name"];

    if ("did" in walletInfo["info"])
      accountInfo["did"] = walletInfo["info"]["did"];

    // store the account info
    chrome.storage.local.set({
      "eth-account": accountInfo
    }, () => {
      console.log("Account created!");
      onSuccess({
        "eth-account": accountInfo
      });
    });
  });
}

/*
 * TODO: disable register did div when needed
 */
function loadAccount(accountDetails) {
  return new Promise(async (onSuccess, onError) => {
    // Set the current protocol to ETH
    await window.zypherAgentClient.setProtocol(PROTOCOL);

    var ethAccount = accountDetails["eth-account"];

    // Set the did
    if ("did" in ethAccount) {
      var profileId;

      if ("name" in ethAccount)
        profileId = ethAccount["name"] + ".eth";
      else
        profileId = ethAccount["did"];

      $("#profile-id-view").val(profileId);
      $("#register-eth-did-button").prop("disabled", true);
    }

    updateAddressBalance(ethAccount["address"]["address"]);

    $("#eth-account-div").css({
      "display": "block"
    });

    onSuccess();
  });
}

/*
 * Try recursive
 */
function updateAddressBalance(address) {
  return new Promise(async (onSuccess, onError) => {
    var balance = await window.web3.eth.getBalance(address);
    var balanceEther = web3.utils.fromWei(balance, "ether");

    $("#eth-balance-div").text(util.format("%s ETH", balanceEther));

    setTimeout(async () => {
      onSuccess();
      await updateAddressBalance(address);
    }, 3000);

  });
}

function copyTextToClipboard(text) {
  var copyFrom = $('<textarea/>');
  copyFrom.text(text);
  $("body").append(copyFrom);
  copyFrom.select();
  document.execCommand("copy");
  copyFrom.remove();
}


/*
 * On click listeners
 */

$(document).ready(() => {
  $("#receive-eth-address-button").unbind();
  $("#receive-eth-address-button").click(() => {

    chrome.storage.local.get(["eth-account"], (accountDetails) => {
      var address = accountDetails["eth-account"]["address"]["address"];
      copyTextToClipboard(address);

      snackbar.showSnackbar("Ethereum address copied to clipboard!", 3000);
    });
  });

  $("#register-eth-did-button").unbind();
  $("#register-eth-did-button").click(() => {
    window.zypherAgentClient.registerDID().then((response) => {
      console.log("RESPONSE:", response);
      location.reload();
    }).
    catch((err) => {
      console.log("ERROR:", err);
    });

  });
});
