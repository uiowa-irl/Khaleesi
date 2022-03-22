let chains = {
	"http": {},
	"js": {},
};

let requestIdToCallStack = {}; // So we don't need to throw the stack for both request and response

function initializeChains(details, topOfCallStack) {
	let pslParsedUrl = parse(details.url);

	chains.http[details.requestId] = {
		"requestFeatures": [getRequestFeatures(details, pslParsedUrl)],
		"responseFeatures": [getResponseFeatures(null)],
		"sequentialFeatures": [getSequentialFeatures(null)],
		"parsedUrls": [pslParsedUrl],
		"predictions": []
	};

	if (topOfCallStack == "")
		return;
	
	chains.js[topOfCallStack] = {
		"requestFeatures": [getRequestFeatures(details, pslParsedUrl)],
		"responseFeatures": [getResponseFeatures(null)],
		"sequentialFeatures": [getSequentialFeatures(null)],
		"parsedUrls": [pslParsedUrl],
		"predictions": []
	};
}

function insertChainRequest(details, topOfCallStack = "") {
	let targetChain;
	if (topOfCallStack == "")
		targetChain = chains.http[details.requestId];
	else
		targetChain = chains.js[topOfCallStack];
	
	let pslParsedUrl = parse(details.url);
	let currentRequestFeatures = getRequestFeatures(details, pslParsedUrl);
	
	targetChain.requestFeatures.push(currentRequestFeatures);
	targetChain.parsedUrls.push(pslParsedUrl);

	targetChain.sequentialFeatures.push(getSequentialFeatures(details, topOfCallStack));
}

function insertChainResponse(details, topOfCallStack = "") {
	let targetChain;
	if (topOfCallStack == "")
		targetChain = chains.http[details.requestId];
	else
		targetChain = chains.js[topOfCallStack];

	let currentResponseFeatures = getResponseFeatures(details);
	targetChain.responseFeatures.push(currentResponseFeatures);
}

function getChainLatestFeatures(requestId, topOfCallStack = "") {
	let targetChain;
	if (topOfCallStack == "")
		targetChain = chains.http[requestId];
	else
		targetChain = chains.js[topOfCallStack];
		
	let requestFeatures = targetChain.requestFeatures[targetChain.requestFeatures.length - 1];
	
	let responseFeatures = targetChain.responseFeatures[targetChain.responseFeatures.length - 1];

	let sequentialFeatures = targetChain.sequentialFeatures[targetChain.sequentialFeatures.length -1];

	return [requestFeatures, responseFeatures, sequentialFeatures];
}
