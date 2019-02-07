module.exports.showSnackbar = (message, length) => {
  return new Promise((onSuccess, onError) => {
    $("#snackbar").html(message);
    $("#snackbar").toggleClass("show");

    setTimeout(() => {
      $("#snackbar").removeClass("show");

      onSuccess();
    }, length);
  });
}
