document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('geminiApiKey');
  const saveButton = document.getElementById('saveButton');
  const statusMessage = document.getElementById('statusMessage');

  // Load the saved key when the page is opened
  chrome.storage.local.get('geminiApiKey', (data) => {
    if (data.geminiApiKey) {
      apiKeyInput.value = data.geminiApiKey;
    }
  });

  saveButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      chrome.storage.local.set({ geminiApiKey: apiKey }, () => {
  statusMessage.textContent = 'API key saved successfully!';
  statusMessage.style.color = 'green';
  setTimeout(() => (statusMessage.textContent = ''), 3000);
      });
    } else {
  statusMessage.textContent = 'Please enter a valid API key.';
  statusMessage.style.color = 'red';
    }
  });
});
