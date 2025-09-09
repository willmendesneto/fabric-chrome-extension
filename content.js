(() => {
  /**
   * @fileoverview Content script for Copilot for Merchandisers.
   * Acts as an intermediary between the background script and a script
   * injected into the main page context to update the DOM.
   */

  // Listen for messages from the main page context (from the script we inject)
  window.addEventListener('message', (event) => {
    // Only accept messages from ourselves
    if (event.source !== window) return;

    if (event.data.type === 'SEND_HTML_TO_EXTENSION') {
      const fullHtml = event.data.payload;
      // Send the HTML to the background script
      chrome.runtime.sendMessage({
        type: 'PROCESS_HTML',
        payload: fullHtml,
      });
    }
  });

  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'LLM_RESPONSE_UPDATE') {
      // Forward the LLM's response to a script injected in the main world
      window.postMessage({ type: 'UPDATE_PAGE_CONTENT', payload: request.payload }, '*');
      // Send a message back to the popup to indicate success
      chrome.runtime.sendMessage({ type: 'UPDATE_SUCCESS', payload: request.payload });
    }
  });
})();