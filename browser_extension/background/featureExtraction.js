function isDimensionsInQueryString(queryString) {
	return queryString.match("\\d{2,4}[xX]\\d{2,4}") != null;
}

function isUUIDInQueryString(queryString) {
	return queryString.match(/........-....-....-....-............/) != null;
}

function matchKeywordInUrl(url) {
	let matchKeywords = ["pagead", "measure", "promote", "banner", "2mdn", "adsystem", "adsense", "beacon", "openx", "aralego", "usermatch", "metrics", "appnexus", "popunder", "punder", "tpid", "pixel", "uuid", "advertising", "dspid", "dpid", "dpuuid", "tracking", "adserver", "1x1", "analytics", "adform", "advert", "iframe", "googlead", "advertise", "track", "prebid", "zoneid", "siteid", "pageid", "viewid", "zone_id", "google_afc", "google_afs", "google_gid", "google_cver", "sync", "doubleclick", "match", "google_nid", "google_dbm", "google_cm", "google_sc"];
	for (var i = 0; i < matchKeywords.length; ++i) {
        if (url.toLowerCase().includes(matchKeywords[i]))
			return true;
    }
	return false;
}

function matchRegexKeywordInUrl(url) {
	let regexMatchKeywords = ["click", "measurement", "measure", "promoted", "pagead", "hit", "banner", "2mdn", "adsystem", "adsense", "ptracking", "beacon", "openx", "aralego", "usermatch", "appnexus", "popunder", "punder", "metrics", "tpid", "pixel", "idsync", "uuid", "uid", "advertising", "adsync", "dspid", "dpid", "dpuuid", "tracking", "ad", "delivery", "pid", "id_sync", "pxl", "1x1", "px", "pix", "analytics", "csync", "cksync", "adserver", "bidder", "ads", "adform", "advert", "iframe", "googlead", "advertise", "track", "prebid", "bid", "zoneid", "siteid", "pageid", "viewid", "zone_id", "google_afc" , "google_afs", "google_gid", "google_cver", "pix", "rtb", "ssp", "dsp", "dmt", "sync", "doubleclick", "match", "tid", "google_nid", "google_dbm", "google_cm", "google_sc"];
	for (let i = 0; i < regexMatchKeywords.length; i++) {
        let regex = new RegExp('[^0-9a-zA-Z]' + regexMatchKeywords[i] + '[^0-9a-zA-Z]');
        if (regex.test(url.toLowerCase()))
          	return true;
    }
	return false;
}

function getRequestFeatures(details, pslParsedUrl) {
	let requestFeatures = {};

	let parsedUrl = new URL(details.url);
	let parsedTopLevelUrl, pslParsedTopLevelUrl;
	if (details.documentUrl) {
		[parsedTopLevelUrl, pslParsedTopLevelUrl] = [new URL(details.documentUrl), parse(details.documentUrl)];
	}	
	else {
		[parsedTopLevelUrl, pslParsedTopLevelUrl] = [new URL(details.url), parse(details.url)];
	}

	requestFeatures.lengthOfUrl = details.url.length;

	requestFeatures.requestMethod = details.method;

	requestFeatures.acceptType = details.type;
	
	requestFeatures.lengthOfQueryString = parsedUrl.search.length - 1;
	if (requestFeatures.lengthOfQueryString == -1)
		requestFeatures.lengthOfQueryString = 0;

	requestFeatures.numNonAlphanumericCharsInQueryString = parsedUrl.search.replace(/[0-9a-z]/gi, "").length - 1;
	if (requestFeatures.numNonAlphanumericCharsInQueryString == -1)
		requestFeatures.numNonAlphanumericCharsInQueryString = 0;

	requestFeatures.semicolonsInUrl = parsedUrl.search.includes(";");

	requestFeatures.dimensionsInQueryString = isDimensionsInQueryString(parsedUrl.search);

	requestFeatures.UUIDInQueryString = isUUIDInQueryString(parsedUrl.search);
	
	requestFeatures.hasSubdomains = true;
	if (["", "www"].includes(pslParsedUrl.subdomain))
		requestFeatures.hasSubdomains = false;
	
	requestFeatures.subdomainOfTopLevelDomain = pslParsedUrl.domain == parsedTopLevelUrl.domain &&
												pslParsedUrl.hostname != parsedTopLevelUrl.hostname;

	requestFeatures.topLevelDomainInQueryString = parsedUrl.search.includes(pslParsedTopLevelUrl.domain);
	
	requestFeatures.thirdPartyDomain = pslParsedUrl.domain != pslParsedTopLevelUrl.domain;

	requestFeatures.numRequestHeaders = details.requestHeaders.length;

	requestFeatures.numRequestCookies = 0;
	for (let i = 0; i < details.requestHeaders.length; i++) {
		if (details.requestHeaders[i].name.toLowerCase() != "cookie")
			continue;
		requestFeatures.numRequestCookies = JSON.stringify(details.requestHeaders[i]).split(";").length;
		break;
	}

	requestFeatures.keywordInUrl = matchKeywordInUrl(details.url);
	requestFeatures.regexKeywordInUrl = matchRegexKeywordInUrl(details.url);

	return requestFeatures;
}

function getResponseType(contentType) {
	if (/application/i.test(contentType)) return 1;
	if (/audio/i.test(contentType)) return 2;
	if (/image/i.test(contentType)) return 3;
	if (/text/i.test(contentType)) return 4;
	if (/video/i.test(contentType)) return 5;
	if (/font/i.test(contentType)) return 6;
	if (/model/i.test(contentType)) return 7;
	return 0;
}

function getResponseSubtype(contentType) {
	if (/html/i.test(contentType)) return 1;
	if (/css/i.test(contentType)) return 2;
	if (/javascript/i.test(contentType)) return 3;
	if (/gif/i.test(contentType)) return 4;
	if (/png/i.test(contentType)) return 5;
	if (/jpeg/i.test(contentType)) return 6;
	if (/plain/i.test(contentType)) return 7;
	if (/json/i.test(contentType)) return 8;
	return 0;
}

function getResponseFeatures(details) {
	let responseFeatures = {
		"etagInResponseHeaders": "?",
		"p3pInResponseHeaders": "?",
		"responseSetsCookies": "?",
		"responseType": "?",
		"responseSubtype": "?",
		"contentLength": "?",
		"numResponseHeaders": "?",
		"responseStatus": "?"
	};

	if (!details) {
		return responseFeatures;
	}

	responseFeatures.etagInResponseHeaders = false;
	responseFeatures.p3pInResponseHeaders = false;
	responseFeatures.responseSetsCookies = false;
	for (let i = 0; i < details.responseHeaders.length; i++) {
		let responseHeaderName = details.responseHeaders[i].name.toLowerCase();
		let responseHeaderValue = details.responseHeaders[i].value.toLowerCase();
		switch(responseHeaderName) {
			case "etag":
				responseFeatures.etagInResponseHeaders = true;
				break;
			case "p3p":
				responseFeatures.p3pInResponseHeaders = true;
				break;
			case "set-cookie":
				responseFeatures.responseSetsCookies = true;
				break;
			case "content-type":
				responseFeatures.responseType = getResponseType(responseHeaderValue);
				responseFeatures.responseSubtype = getResponseSubtype(responseHeaderValue);
				break;
			case "content-length":
				responseFeatures.contentLength = parseInt(responseHeaderValue);
				break;
		}
	}

	responseFeatures.numResponseHeaders = details.responseHeaders.length;

	responseFeatures.responseStatus = details.statusCode;
	
	return responseFeatures;
}

function getSequentialFeatures(details, topOfCallStack = "") {
	let sequentialFeatures = {
		"lengthOfChain": 1,
		"redirectToNewDomain": "?",
		"numUniqueDomains": 1,
		"previousPrediction": "?",
		"averagePreviousPredictions": "?",
	};

	if (!details) {
		return sequentialFeatures;
	}

	let targetChain;
	if (topOfCallStack == "")
		targetChain = chains.http[details.requestId];
	else
		targetChain = chains.js[topOfCallStack];

	sequentialFeatures.lengthOfChain = targetChain.requestFeatures.length;
	
	sequentialFeatures.redirectToNewDomain = "?";
	if (targetChain.parsedUrls.length >= 2) {
		sequentialFeatures.redirectToNewDomain = targetChain.parsedUrls[targetChain.parsedUrls.length-1].domain != 
											  	targetChain.parsedUrls[targetChain.parsedUrls.length-2].domain;
	}

	let uniqueDomains = new Set();
	for (let i = 0; i < targetChain.parsedUrls.length; i++) {
		uniqueDomains.add(targetChain.parsedUrls[i].domain);
	}

	sequentialFeatures.numUniqueDomains = uniqueDomains.size;

	let predictionSum = 0.0;
	for (let i = 0; i < targetChain.predictions.length; i++) {
		predictionSum += targetChain.predictions[i];
	}

	sequentialFeatures.previousPrediction = "?";
	sequentialFeatures.averagePreviousPredictions = "?";
	if (targetChain.predictions.length > 0) {
		sequentialFeatures.previousPrediction = targetChain.predictions[targetChain.predictions.length - 1];
		sequentialFeatures.averagePreviousPredictions = predictionSum / targetChain.predictions.length;
	}
	
	return sequentialFeatures;
}
