function onlyBlockRedirectsCheckboxClicked() {
	localStorage.setItem("onlyBlockRedirects", document.getElementById("toggle_only_block_redirects").checked);
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
    });
}

document.getElementById("toggle_only_block_redirects").onclick = onlyBlockRedirectsCheckboxClicked;

document.getElementById("toggle_only_block_redirects").checked = (localStorage.getItem("onlyBlockRedirects") == "true");
