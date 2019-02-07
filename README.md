
# zypher-wallet-extension

> A zypher wallet chrome extension.

This chrome extension enables web pages to interact a zypher-wallet.

## Install

```npm run install```

## Build

1. ```npm run build```
2. to enable the extension load the ```dist``` directory in ```chrome://extensions```.


## Usage

In a web page

```js

$(document).ready(() => {
	authID.getAddress().then((address) => {
    	console.log("got address:", address);
    });
});

```