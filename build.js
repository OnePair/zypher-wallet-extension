var browserify = require("browserify");
var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");

const DIST_DIR = path.join(__dirname, "dist");

// 1) Make the dist directory if it does not exists
mkdirp.sync(DIST_DIR);

// 2) Copy the manifest file to the dist directory
fs.copyFileSync("manifest.json", path.join(DIST_DIR, "manifest.json"));


function buildJsFile(filePath, fileName) {
  var fileStream = fs.createWriteStream(path.join(DIST_DIR, fileName));
  browserify()
    .add(filePath)
    .bundle()
    .on("error", (error) => {
      console.error(error.toString());
    })
    .pipe(fileStream);
}

function buildReactFile(filePath, fileName) {
  var fileStream = fs.createWriteStream(path.join(DIST_DIR, fileName));
  browserify()
    .add(filePath)
    .transform("babelify", {
      presets: ["@babel/preset-react"]
    })
    .bundle()
    .on("error", (error) => {
      console.error(error.toString());
    })
    .pipe(fileStream);
}

buildJsFile("./src/js/background/zypher-agent.js", "zypher-agent.js");


buildJsFile("./src/js/constants.js", "constants.js");
buildJsFile("./src/js/zypher-agent-client.js", "zypher-agent-client.js");


buildJsFile("./src/js/content-scripts/zypher-content.js", "zypher-content.js");

buildJsFile("./src/js/web-pages/zypher-webpage-client.js", "zypher-webpage-client.js");

/*
 * The web app functions
 */
buildJsFile("./src/js/web-app/user-confirmation.js", "user-confirmation.js");
buildJsFile("./src/js/web-app/wallet-page.js", "wallet-page.js");
buildJsFile("./src/js/web-app/eth-account.js", "eth-account.js");
buildJsFile("./src/js/web-app/create-password.js", "create-password.js");
buildJsFile("./src/js/web-app/show-seed.js", "show-seed.js");
buildJsFile("./src/js/web-app/snackbar.js", "snackbar.js");
