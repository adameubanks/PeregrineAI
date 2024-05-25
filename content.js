chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  fetch_gemini(request.message)
    .then(response => {
      sendResponse(response);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  return true;
});

document.addEventListener('mouseup', function(e) {
  var selectedText = window.getSelection().toString().trim();
  //show selected text
  if (selectedText.length > 0) {
    showSelected(selectedText);
  }
  //remove selected text
  else {
    var imgBox = document.querySelector('#showSelected');
    if (imgBox) {
      document.body.removeChild(imgBox);
    }
  }
});

function showSelected(selectedText) {
  // Create an img element
  var imgBox = document.createElement('img');
  imgBox.style.position = 'fixed';
  imgBox.style.zIndex = '999999999';
  imgBox.id = 'showSelected';
  imgBox.style.cursor = 'pointer';
  imgBox.style.right = '20px';
  imgBox.style.top = '20px';
  imgBox.style.maxWidth = '50px';
  imgBox.style.maxHeight = '50px';

  // Set the source of the image
  imgBox.src = 'https://raw.githubusercontent.com/adameubanks/PeregrineAI/main/PeregrineAILogo.png';

  document.body.appendChild(imgBox);

  // Add event listener to imgBox
  imgBox.addEventListener('click', function(event) {
    console.log(selectedText);
    document.body.removeChild(imgBox);
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
    fetch_gemini(selectedText)
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  });

}

function markdownToHTML(markdown) {
  // Convert headers
  markdown = markdown.replace(/^(#+)(.*)/gm, (match, p1, p2) => {
      const level = p1.length;
      return `<h${level}>${p2.trim()}</h${level}>`;
  });
  // Convert code blocks
  markdown = markdown.replace(/```(\w*)\n([\s\S]*?)\n```/g, (match, language, code) => {
      return `<pre><code class="language-${language}">${code.trim()}</code></pre>`;
  });
  // Convert inline code
  markdown = markdown.replace(/`(.+?)`/g, (match, p1) => {
      return `<code>${p1}</code>`;
  });
  // Convert bold text
  markdown = markdown.replace(/\*\*(.+?)\*\*/g, (match, p1) => {
      return `<strong>${p1}</strong>`;
  });
  // Convert italic text
  markdown = markdown.replace(/\*(.+?)\*/g, (match, p1) => {
      return `<em>${p1}</em>`;
  });
  // Convert links
  markdown = markdown.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, (match, text, url) => {
      return `<a href="${url}">${text}</a>`;
  });
  // Convert unordered lists
  markdown = markdown.replace(/^\s*[-*]\s*(.*)$/gm, (match, p1) => {
    return `<li>${p1}</li>`;
});
  // markdown = `<ul>${markdown}</ul>`;
  // Convert ordered lists
  markdown = markdown.replace(/^\s*\d+\.\s*(.*)$/gm, (match, p1) => {
      return `<li>${p1}</li>`;
  });
  // Convert paragraphs
  markdown = markdown.replace(/\n\s*\n/g, '</p><p>');
  markdown = `<p>${markdown}</p>`;

  return markdown;
}

function getApiKey() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('apiKey', function(data) {
      if (chrome.runtime.lastError) {
        return alert('Invalid API Key. Make sure you have properly inputed your API key');
      }
      resolve(data.apiKey);
    });
  });
}

function fetch_gemini(message){
  return new Promise((resolve, reject) => {
    const data = {"contents": [{"parts": [{"text": "what is "+message+"?"}]}]};
    getApiKey().then(apiKey => {
      const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key="+apiKey;
      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => {
        if (!response.ok) {
          alert('Invalid API Key. Make sure you have properly inputed your API key');
        }
        return response.json();
      })
      .then(result => {
        const response = result.candidates[0].content.parts[0].text;
        
        var textBox = document.createElement('div');
        textBox.style.position = 'fixed';
        textBox.style.zIndex = '999999999';
        textBox.style.left = '20px';
        textBox.style.top = '20px';
        textBox.style.width = '400px';
        textBox.style.height = '200px';
        textBox.style.padding = '10px';
        textBox.style.fontSize = '16px';
        textBox.style.borderRadius = '5px';
        textBox.style.border = '1px solid #ccc';
        textBox.style.backgroundColor = '#f8f8f8';
        textBox.style.color = '#333';
        textBox.style.overflow = 'auto';
        textBox.style.resize = 'both'; // Allow the user to resize the element in both directions (horizontal and vertical)
        textBox.style.overflow = 'auto'; // An overflow value other than "visible" (its default) is required for "resize" to work
        textBox.innerHTML = "<h4>Info about: " + message + "</h4>" + markdownToHTML(response);
      
        // Create a handle for dragging
        var dragHandle = document.createElement('div');
        dragHandle.style.width = '20px';
        dragHandle.style.height = '20px';
        dragHandle.style.cursor = 'move';
        dragHandle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M352.2 425.8l-79.2 79.2c-9.4 9.4-24.6 9.4-33.9 0l-79.2-79.2c-15.1-15.1-4.4-41 17-41h51.2L228 284H127.2v51.2c0 21.4-25.9 32.1-41 17L7 272.9c-9.4-9.4-9.4-24.6 0-33.9L86.2 159.8c15.1-15.1 41-4.4 41 17V228H228V127.2h-51.2c-21.4 0-32.1-25.9-17-41l79.2-79.2c9.4-9.4 24.6-9.4 33.9 0l79.2 79.2c15.1 15.1 4.4 41-17 41h-51.2V228h100.8v-51.2c0-21.4 25.9-32.1 41-17l79.2 79.2c9.4 9.4 9.4 24.6 0 33.9L425.8 352.2c-15.1 15.1-41 4.4-41-17V284H284v100.8h51.2c21.4 0 32.1 25.9 17 41z"/></svg>';
      
        // Position the handle in the top left corner of the textBox
        dragHandle.style.position = 'absolute';
        dragHandle.style.top = '0';
        dragHandle.style.left = '0';
      
        textBox.appendChild(dragHandle);
      
        // Make the div draggable
        dragHandle.onmousedown = function(event) {
          // Calculate the distance between the mouse and the top-left corner of the textbox
          var shiftX = event.clientX - textBox.getBoundingClientRect().left;
          var shiftY = event.clientY - textBox.getBoundingClientRect().top;
      
          textBox.style.position = 'absolute';
          textBox.style.zIndex = 1000;
      
          function moveAt(pageX, pageY) {
            // Take the distance into account when setting the position of the textbox
            textBox.style.left = pageX - shiftX + 'px';
            textBox.style.top = pageY - shiftY + 'px';
          }
      
          moveAt(event.pageX, event.pageY);
      
          function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
          }
      
          document.addEventListener('mousemove', onMouseMove);
      
          dragHandle.onmouseup = function() {
            document.removeEventListener('mousemove', onMouseMove);
            dragHandle.onmouseup = null;
          };
        };
      
        dragHandle.ondragstart = function() {
          return false;
        };
        
        // Create a close button
        var closeButton = document.createElement('div');
        closeButton.style.width = '20px';
        closeButton.style.height = '20px';
        closeButton.style.cursor = 'pointer';
        closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z"/></svg>';
      
        // Position the handle in the top left corner of the textBox
        closeButton.style.position = 'absolute';
        closeButton.style.top = '0';
        closeButton.style.right = '0';
      
        textBox.appendChild(closeButton);
      
        // Add a click event listener to the close button
        closeButton.onclick = function() {
          document.body.removeChild(textBox);
        };
      
        // Add the close button to the div
        textBox.appendChild(closeButton);
      
        document.body.appendChild(textBox);

        //remove loading box
        var loadingBox = document.querySelector('#loadingBox');
        if (loadingBox) {
          document.body.removeChild(loadingBox);
        }
      })
    })
  })
};