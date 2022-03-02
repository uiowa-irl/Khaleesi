class OneHotEncoder {
    constructor(uniqueValues) {
        this.uniqueValues = uniqueValues;
    }

    fit(column) {
        var counts = {};
        for (var i = 0; i < column.length; i++) {
            counts[column[i]] = 1 + (counts[column[i]] || 0);
        }
        this.uniqueValues = [... new Set(column)].sort();
    }

    transform(column) {
        let transformedColumn = [];
        for (var i = 0; i < column.length; i++) {
            var encodedRow = []
            for (var j = 0; j < this.uniqueValues.length; j++) {
                if (column[i] == this.uniqueValues[j]) {
                    encodedRow.push(1);
                }
                else {
                    encodedRow.push(0);
                }
            }
            transformedColumn.push(encodedRow);
        }
        return transformedColumn;
    }
}

class Imputer {
    constructor(missingValue) {
        this.missingValue = missingValue;
    }

    transform(value) {
        if (typeof value != "number") {
            return this.missingValue;
        }
        return value;
    }
}

var encoders = {};
function buildEncoders() {
    encoders.requestMethod = new OneHotEncoder(["GET", "HEAD", "OPTIONS", "POST", "PUT", "SEARCH"]);
    encoders.responseStatus = new OneHotEncoder(["0", "200", "201", "202", "203", "204", "205", "206", "207", "244", "301", "302", "303", "304", "307", "308", "400", "401", "403", "404", "405", "406", "410", "412", "414", "422", "429", "458", "500", "502", "503", "504", "551", "?"]);
    encoders.etagInResponseHeaders = new OneHotEncoder(["0", "1", "?"]);
    encoders.p3pInResponseHeaders = new OneHotEncoder(["0", "1", "?"]);
    encoders.acceptType = new OneHotEncoder(["beacon", "font", "image", "imageset", "main_frame", "media", "object", "other", "script", "stylesheet", "sub_frame", "xmlhttprequest"]);
    encoders.responseSetsCookies = new OneHotEncoder(["0", "1", "?"]);
    encoders.responseType = new OneHotEncoder(["0", "1", "2", "3", "4", "5", "6", "?"]);
    encoders.responseSubtype = new OneHotEncoder(["0", "1", "2", "3", "4", "5", "6", "7", "8", "?"]);
    encoders.redirectToNewDomain = new OneHotEncoder(["0", "1", "?"]);

    encoders.contentLength = new Imputer(10905.9);
    encoders.numResponseHeaders = new Imputer(12.5);
    encoders.previousPrediction = new Imputer(0.608);
    encoders.averagePreviousPredictions = new Imputer(0.608);
}

function transformFeatures(requestId, topOfCallStack = "") {
    let [requestFeatures, responseFeatures, sequentialFeatures] = getChainLatestFeatures(requestId, topOfCallStack);
    
    let tempTransformedFeatures = [
        requestFeatures.lengthOfUrl,
        requestFeatures.hasSubdomains,
        requestFeatures.subdomainOfTopLevelDomain,
        requestFeatures.UUIDInQueryString,
        requestFeatures.dimensionsInQueryString,
        requestFeatures.numNonAlphanumericCharsInQueryString,
        requestFeatures.topLevelDomainInQueryString,
        requestFeatures.numRequestCookies,
        requestFeatures.semicolonsInUrl,
        requestFeatures.lengthOfQueryString,
        requestFeatures.regexKeywordInUrl,
        requestFeatures.keywordInUrl,
        sequentialFeatures.lengthOfChain,
        sequentialFeatures.numUniqueDomains,
        requestFeatures.numRequestHeaders,
        topOfCallStack != "", // http/js chain
        encoders.requestMethod.transform([requestFeatures.requestMethod]),
        encoders.responseStatus.transform([responseFeatures.responseStatus]),
        encoders.etagInResponseHeaders.transform([responseFeatures.etagInResponseHeaders]),
        encoders.p3pInResponseHeaders.transform([responseFeatures.p3pInResponseHeaders]),
        encoders.acceptType.transform([requestFeatures.acceptType]),
        encoders.responseSetsCookies.transform([responseFeatures.responseSetsCookies]),
        encoders.responseType.transform([responseFeatures.responseType]),
        encoders.responseSubtype.transform([responseFeatures.responseSubtype]),
        encoders.redirectToNewDomain.transform([sequentialFeatures.redirectToNewDomain]),
        encoders.contentLength.transform(responseFeatures.contentLength),
        encoders.numResponseHeaders.transform(responseFeatures.numResponseHeaders),
        encoders.previousPrediction.transform(sequentialFeatures.previousPrediction),
        encoders.averagePreviousPredictions.transform(sequentialFeatures.averagePreviousPredictions)
    ];

    let transformedFeatures = [];
    for (let i = 0; i < tempTransformedFeatures.length; i++) {
        if ((typeof tempTransformedFeatures[i]) == "number" || (typeof tempTransformedFeatures[i]) == "boolean") {
            transformedFeatures.push(tempTransformedFeatures[i]);
        }
        else {
			for (let j = 0; j < tempTransformedFeatures[i][0].length; j++) {
				transformedFeatures.push(tempTransformedFeatures[i][0][j]);
			}
        }
    }
    
    return transformedFeatures;
}

buildEncoders();
