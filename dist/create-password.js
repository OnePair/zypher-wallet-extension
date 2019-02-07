(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const PROTOCOL = "eth";

/*
 * Create a wallet password.
 *
 * @return {boolean, string} Seed confirmed, password
 */
module.exports.createPassword = (zypherWallet, showImportSeedOption) => {
  return new Promise((onSuccess, onError) => {
    // Remove all click event listeners
    $("#create-password-button").unbind();
    $("#import-seed-span").unbind();

    // 1) Add the create password div
    $("#eth-account-setup-div").append($("#create-password-container"));
    $("#create-password-container").css({
      "display": "block"
    });

    // Add the create password div
    $("#create-password-container").append($("#create-password-div"));
    $("#create-password-div").css({
      "display": "block"
    });

    $("#create-password-button").click(() => {
      var password = $("#create-password-input").val();
      var confirmPassword = $("#confirm-password-input").val();

      if (password.length < 8)
        showPasswordMessage("Password needs to be at least 8 characters long!");
      else if (password != confirmPassword)
        showPasswordMessage("Passwords do not match!");
      else {
        showPasswordMessage("");

        var seedConfirmed = true;
        if (showImportSeedOption)
          seedConfirmed = false;

        onSuccess({
          password: password,
          seedConfirmed: seedConfirmed
        });

        // Remove the password div
        $("#create-password-div").css({
          "display": "none"
        });
      }
    });

    if (showImportSeedOption) {
      $("#import-seed-span").css({
        "display": "block"
      });

      // Import from seed
      $("#import-seed-span").click(async () => {
        try {
          var password = await importSeed(zypherWallet);
          onSuccess({
            password: password,
            seedConfirmed: true
          });
        } catch (err) {
          return module.exports.createPassword(zypherWallet, showImportSeedOption);
        }
      });
    } else {
      // Remove the import from seed span
      $("#import-seed-span").css({
        "display": "none"
      });
    }

  });
}

/*
 * @param {ZypherWallet} The wallet instance
 *
 * @return {string} password
 */
function importSeed(zypherWallet) {
  return new Promise((onSuccess, onError) => {
    // Clear event listeners
    $("#import-seed-button").unbind();

    $("#create-password-container").append($("#import-seed-div"));

    $("#create-password-div").css({
      "display": "none"
    });

    $("#import-seed-div").css({
      "display": "block"
    });

    // Back button
    $("#import-seed-back-button").click(() => {
      $("#import-seed-div").css({
        "display": "none"
      });
      onError();
    });

    // Import button
    $("#import-seed-button").click(async () => {
      $("#import-seed-div").css({
        "display": "none"
      });

      var seedPhrase = $("#seed-phrase-input").val();
      var password = await module.exports.createPassword(zypherWallet, false);

      // Try to import the seed and password into the wallet

      try {
        var result = await zypherWallet.recoverFromSeedPhrase(PROTOCOL, password["password"], seedPhrase);
        onSuccess(password["password"]);
      } catch (err) {
        onError();
        alert("Could not recover from seed phrase!");
      }

    });
  });
}

function showPasswordMessage(message) {
  $("#password-error-span").text(message);
}

},{}]},{},[1]);
