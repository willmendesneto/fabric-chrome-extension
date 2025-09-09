/**
 * @fileoverview Popup script for Copilot for Merchandisers.
 * Manages the UI and communication with the background script.
 */

document.addEventListener('DOMContentLoaded', () => {
  const analyzeButton = document.getElementById('analyzeButton');
  const loading = document.getElementById('loading');
  const successDiv = document.getElementById('success');
  const resultsDiv = document.getElementById('results');
  const errorDiv = document.getElementById('error');

  /**
   * Shows a specific UI element and hides others.
   * @param {HTMLElement} elementsToShow - The element to make visible.
   */
  const showSection = (elementsToShow) => {
    const allElements = [loading, successDiv, errorDiv, analyzeButton, resultsDiv];
    allElements.forEach((el) => {
      if (Array.isArray(elementsToShow) && elementsToShow.includes(el)) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    });
  };

  /**
   * Fills the UI with the data from the LLM response.
   * @param {object} payload - The LLM's response data.
   */
  const showResults = (payload) => {
    currentLlmPayload = payload;

    // Populate Head section
    const headTitle = document.getElementById('head-title');
    headTitle.querySelector('.original-content .content-text').textContent =
      payload.head.originalTitle.text;
    headTitle.querySelector('.new-content .content-text').textContent = payload.head.newTitle.text;
    headTitle.querySelector('.reason .reason-text').textContent = payload.head.newTitle.reason;
    headTitle.classList.remove('hidden');

    const headDescription = document.getElementById('head-description');
    headDescription.querySelector('.original-content .content-text').textContent =
      payload.head.originalDescription.text;
    headDescription.querySelector('.new-content .content-text').textContent =
      payload.head.newDescription.text;
    headDescription.querySelector('.reason .reason-text').textContent =
      payload.head.newDescription.reason;
    headDescription.classList.remove('hidden');

    // Populate Body section
    const bodyTitle = document.getElementById('body-title');
    bodyTitle.querySelector('.original-content .content-text').textContent =
      payload.body.originalTitle.text;
    bodyTitle.querySelector('.new-content .content-text').textContent = payload.body.newTitle.text;
    bodyTitle.querySelector('.reason .reason-text').textContent = payload.body.newTitle.reason;
    bodyTitle.classList.remove('hidden');

    const bodyDescription = document.getElementById('body-description');
    bodyDescription.querySelector('.original-content .content-text').textContent =
      payload.body.originalDescription.text;
    bodyDescription.querySelector('.new-content .content-text').textContent =
      payload.body.newDescription.text;
    bodyDescription.querySelector('.reason .reason-text').textContent =
      payload.body.newDescription.reason;
    bodyDescription.classList.remove('hidden');

    const bodyShippingReturns = document.getElementById('body-shipping-returns');
    bodyShippingReturns.querySelector('.original-content .content-text').textContent =
      payload.body.originalShippingReturns.text;
    bodyShippingReturns.querySelector('.new-content .content-text').textContent =
      payload.body.newShippingReturns.text;
    bodyShippingReturns.querySelector('.reason .reason-text').textContent =
      payload.body.newShippingReturns.reason;
    bodyShippingReturns.classList.remove('hidden');
  };

  /**
   * Handles messages from the background script.
   * @param {object} request - The message request.
   */
  const handleMessage = (request) => {
    if (request.type === 'UPDATE_SUCCESS') {
      showSection([successDiv, analyzeButton, resultsDiv]);
      showResults(request.payload);
    } else if (request.type === 'UPDATE_ERROR' || request.type === 'LLM_ERROR') {
      showSection([errorDiv, analyzeButton]);
    }
  };

  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener(handleMessage);

  analyzeButton.addEventListener('click', () => {
    showSection([loading, analyzeButton]);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;

      // Step 1: Inject content.js into the isolated world
      chrome.scripting.executeScript(
        {
          target: { tabId },
          files: ['content.js'],
        },
        () => {
          // Step 2: Inject dom-updater.js into the main world
          chrome.scripting.executeScript({
            target: { tabId },
            world: 'MAIN',
            files: ['dom-updater.js'],
          });
        },
      );
    });
  });
});