function pageScript() {
	var xhrStacktrace = null;
	var fetchStacktrace = null;

	function getStacktrace() {
		try {
			throw new Error('myError');
		}
		catch (e) {
			return e.stack;
		}
	}

	var originalXMLHttpRequest = window.XMLHttpRequest.prototype.open;
	var hkXMLHttpRequest = function () {
		xhrStacktrace = getStacktrace();
		return originalXMLHttpRequest.apply(this, [].slice.call(arguments));
	}

	var originalFetch = window.fetch;
	var hkFetch = function () {
		fetchStacktrace = getStacktrace();
		return originalFetch.apply(this, arguments);
	}

	var initiateFunctionHooks = function () {
		window.XMLHttpRequest.prototype.open = hkXMLHttpRequest;
		window.fetch = hkFetch;
	}

	document.addEventListener('khaleesiStackRequest',
		function (e) {
			if (xhrStacktrace) {
				document.dispatchEvent(new CustomEvent('khaleesiStackResponse', { detail: { stacktrace: xhrStacktrace.split('\n') } }));
				xhrStacktrace = null;
			}
			else if (fetchStacktrace) {
				document.dispatchEvent(new CustomEvent('khaleesiStackResponse', { detail: { stacktrace: fetchStacktrace.split('\n') } }));
				fetchStacktrace = null;
			}
		}
	);
	(initiateFunctionHooks)();
}

function injectScript(text) {
	var parent = document.documentElement,
		script = document.createElement('script');
	script.text = text;
	script.async = false;
	parent.insertBefore(script, parent.firstChild);
	parent.removeChild(script);
}

injectScript(pageScript.toString().slice(pageScript.toString().indexOf('{') + 1, pageScript.toString().lastIndexOf('}')));

var stacktrace = null;

document.addEventListener('khaleesiStackResponse',
	function (e) {
		stacktrace = e.detail;
	}
);

function returnStack(content, sender, sendResponse) {
	document.dispatchEvent(new CustomEvent('khaleesiStackRequest'));
	sendResponse({ stacktrace: stacktrace });
	stacktrace = null;
}

browser.runtime.onMessage.addListener(returnStack);