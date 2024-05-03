document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('saveApiKey').addEventListener('click', function() {
    var apiKey = document.getElementById('apiKey').value;
    chrome.storage.sync.set({apiKey: apiKey}, function() {
      console.log('API key saved');
    });
  });
});