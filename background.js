/**
 * @fileoverview Service worker for Copilot for Merchandisers.
 * Handles LLM API calls and communication with other parts of the extension.
 */

const LLM_API_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Handles incoming messages from content scripts or the popup.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'PROCESS_HTML') {
    const fullHtml = request.payload;
    console.log('Processing HTML from tab:', sender.tab.id);

    // Retrieve the API key from storage
    chrome.storage.local.get('geminiApiKey', (data) => {
      const apiKey = data.geminiApiKey;
      if (!apiKey) {
        chrome.runtime.sendMessage({
          type: 'LLM_ERROR',
          payload: {
            message: 'Chave de API do Gemini não configurada. Vá para as opções da extensão.',
          },
        });
        sendResponse({ status: 'error', message: 'API key not configured.' });
        return;
      }

      generateLLMContent({ fullHtml, apiKey })
        .then((llmResponse) => {
          // Send the response back to the content script to update the page
          chrome.tabs.sendMessage(sender.tab.id, {
            type: 'LLM_RESPONSE_UPDATE',
            payload: llmResponse,
          });
          sendResponse({ status: 'success' });
        })
        .catch((error) => {
          console.error('LLM API error:', error);
          chrome.runtime.sendMessage({
            type: 'LLM_ERROR',
            payload: { message: error.message },
          });
          sendResponse({ status: 'error', message: error.message });
        });
    });
    return true; // Indicates an asynchronous response
  }
});

/**
 * Makes the call to the LLM API to generate new content.
 * @param {object} data - The scraped data and API key.
 * @returns {Promise<object>} The LLM's generated content.
 */
const generateLLMContent = async (data) => {
  const prompt = `You are a product page (PDP) analysis expert. Your task is to analyze the HTML code of a product page, extract the essential information (title, description, shipping, and returns), and then generate new, optimized versions.
  
  You must identify the most specific CSS selector for each of the original elements so the content can be dynamically replaced on the page. The optimizations for the <head> tag should be aimed at SEO, while those for the <body> tag should be focused on the customer experience.
  
  Follow the optimization standard below:
  
  **SEO Optimization (<head>):**
  - **Titles:** Must be concise (up to 60 characters), include relevant keywords, and be attractive to search engines.
  - **Descriptions:** Must be direct and informative (up to 160 characters), summarizing the product's main benefits to attract clicks.
  - **Shipping and Returns:** Normally do not apply to <head> metadata.

  **Customer Optimization (<body>):**
  - **Titles:** Must be attractive, clear, and summarize the product in a few words. The priority is user clarity.
  - **Descriptions:** Must be **detailed and complete**. Increase the level of detail with the product's features and functionalities. The description should be persuasive and answer customer questions. **Do not remove important information.**
  - **Shipping and Returns:** Must be direct and reassuring. Highlight guarantees, deadlines, and policies in a clear and simple way.

  For each new suggestion (title, description, shipping, and returns), add a "reason" field with a detailed explanation of why the suggestion was made and how it improves the original content.
  
  CSS selectors must be precise and specific to avoid conflicts with other elements on the page. They should be returned as an array of selectors so all items can be found and updated correctly. If a selector cannot be found with certainty, return an empty array.
  
  Maintain the page's original language. Follow the exact JSON response format below.
  
  HTML Code:
  ${data.fullHtml}
  
  Response Format:
  {
    "head": {
      "originalTitle": {
        "text": "...",
        "selectors": ["<title>", "..."]
      },
      "originalDescription": {
        "text": "...",
        "selectors": ["meta[name='description']", "..."]
      },
      "originalShippingReturns": {
        "text": "...",
        "selectors": ["..."]
      },
      "newTitle": {
        "text": "...",
        "reason": "..."
      },
      "newDescription": {
        "text": "...",
        "reason": "..."
      },
      "newShippingReturns": {
        "text": "...",
        "reason": "..."
      }
    },
    "body": {
      "originalTitle": {
        "text": "...",
        "selectors": ["...", "..."]
      },
      "originalDescription": {
        "text": "...",
        "selectors": ["...", "..."]
      },
      "originalShippingReturns": {
        "text": "...",
        "selectors": ["...", "..."]
      },
      "newTitle": {
        "text": "...",
        "reason": "..."
      },
      "newDescription": {
        "text": "...",
        "reason": "..."
      },
      "newShippingReturns": {
        "text": "...",
        "reason": "..."
      }
    }
  }`;

  const response = await fetch(`${LLM_API_ENDPOINT}?key=${data.apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`LLM API request failed: ${errorData.error.message}`);
  }

  const result = await response.json();
  const generatedContent = JSON.parse(result.candidates[0].content.parts[0].text);
  // Sometimes the API is returning an Array instead of a single Object
  return Array.isArray(generatedContent) ? generatedContent[0] : generatedContent;
};