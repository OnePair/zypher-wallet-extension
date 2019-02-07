(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports.showSeed = (zypherWallet, protocol, password) => {

  return new Promise(async (onSuccess, onError) => {
    try {
      // Unbind buttons
      $("#copied-seed-button").unbind();

      var seedPhrase = await zypherWallet.getSeedPhrase(protocol, password);

      $("#eth-account-setup-div").append($("#seed-phrase-div"));
      // Make the seed phrase div visible
      $("#seed-phrase-div").css({
        "display": "block"
      });

      // Make the seed view div visible
      $("#seed-phrase-view-div").css({
        "display": "block"
      });

      $("#seed-view").text(seedPhrase["seedPhrase"]);

      // When wants to go to the next step
      $("#copied-seed-button").click(async () => {
        try {
          await confirmSeed(seedPhrase["seedPhrase"]);
          $("#seed-phrase-div").css({
            "display": "none"
          });
          onSuccess();
        } catch (err) {
          return module.exports.showSeed(zypherWallet, protocol, password);
        }
      });
    } catch (err) {
      alert("A password has already been set on your device." +
        " Please retry with the correct password.");
      location.reload();
    }
  });
}


function confirmSeed(seed) {
  return new Promise(async (onSuccess, onError) => {
    // Unbund buttons
    $("#seed-confirm-back-button").unbind();
    $("#confirm-seed-button").unbind();

    // Make the seed view div invisible
    $("#seed-phrase-view-div").css({
      "display": "none"
    });

    $("#seed-confirm-div").css({
      "display": "block"
    });

    $("#seed-confirm-back-button").click(() => {
      $("#seed-confirm-div").css({
        "display": "none"
      });
      onError();
    });

    $("#confirm-seed-button").click(() => {
      var confirmedSeed = "";
      for (var i = 1; i <= 24; i++) {
        var wordInputId = "#seed-word-confirm" + i;
        var seedWord = $(wordInputId).val().replace(/\s+/g, "").toLowerCase();

        confirmedSeed += seedWord;
        if (i != 24)
          confirmedSeed += " ";
      }
      if (confirmedSeed != seed)
        alert("Please try again.");
      else
        onSuccess();
    });
  });
}

},{}]},{},[1]);
