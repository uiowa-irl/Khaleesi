browser.webRequest.onBeforeSendHeaders.addListener(async details => {
	if (details.type == "main_frame" || details.tabId == -1) {
		return;
	}

	let contentScriptPromise = new Promise((resolve) => {
		setTimeout(() => resolve(""), 1);
		browser.tabs.sendMessage(details.tabId, { content: details.url }, function (response) {
			if (response) {
				resolve(response.stacktrace);
			}
		});
	});
	let contentScriptResponse = await contentScriptPromise;
	let topOfCallStack = "";
	if (contentScriptResponse) {
		topOfCallStack = contentScriptResponse.stacktrace[2];
		topOfCallStack = topOfCallStack.substring(topOfCallStack.indexOf("@")+1, topOfCallStack.length).split(":");
		topOfCallStack.splice(topOfCallStack.length - 2, 2);
		topOfCallStack = topOfCallStack.join(":");
		requestIdToCallStack[details.requestId] = topOfCallStack;
	}
	
	if (details.requestId in chains.http) {
		insertChainRequest(details);
		let prediction = predict_proba(transformFeatures(details.requestId));
		chains.http[details.requestId].predictions.push(prediction);
		if (prediction >= 0.5) {
			console.log("Khaleesi blocked " + details.url);
			return { cancel: true };
		}
	}
	else if (topOfCallStack in chains.js) {
		insertChainRequest(details, topOfCallStack);
		let prediction = predict_proba(transformFeatures(details.requestId, topOfCallStack));
		chains.js[topOfCallStack].predictions.push(prediction);
		if (prediction >= 0.5) {
			console.log("Khaleesi blocked " + details.url);
			return { cancel: true };
		}
	}
	else {
		initializeChains(details, topOfCallStack);
		let features = transformFeatures(details.requestId, topOfCallStack);
		let prediction = predict_proba(features);
		chains.http[details.requestId].predictions.push(prediction);
		if (topOfCallStack) {
			chains.js[topOfCallStack].predictions.push(prediction);
		}
		
		if (prediction >= 0.5 && localStorage.getItem("onlyBlockRedirects") == "false") {
			console.log("Khaleesi blocked " + details.url);
			return { cancel: true };
		}
	}	
}, {
	urls: ["http://*/*", "https://*/*"]
}, ["requestHeaders", "blocking"]);

browser.webRequest.onHeadersReceived.addListener(async details => {
	if (details.requestId in chains.http) {
		insertChainResponse(details);
	}
	else if (details.requestId in requestIdToCallStack) {
		insertChainResponse(details, requestIdToCallStack[details.requestId]);
	}

}, {
	urls: ["http://*/*", "https://*/*"]
}, ["responseHeaders"]);
