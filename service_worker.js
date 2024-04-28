chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "showFromCM",
    title: "Get Info",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "showFromCM") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: showLoadingBox,
      args: [info.selectionText]
    });
  }
});

async function showLoadingBox(selectedText) {
  var textBox = document.createElement('div');
  textBox.style.position = 'fixed';
  textBox.style.zIndex = '999999999';
  textBox.id = 'loadingBox'
  textBox.style.left = '20px';
  textBox.style.top = '20px';
  textBox.style.padding = '10px';
  textBox.style.fontSize = '16px';
  textBox.style.borderRadius = '5px';
  textBox.style.border = '1px solid #ccc';
  textBox.style.backgroundColor = '#f8f8f8';
  textBox.style.color = '#333';
  textBox.innerHTML = "<i>Fetching info about: " + selectedText + "...</i>";
  document.body.appendChild(textBox);
}

function sendMessageToContentScript(message){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
      console.log("response recieved!" + response);
    });
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "showFromCM") {
    sendMessageToContentScript({destination: "fetch_gemini", message: info.selectionText});
  }
});