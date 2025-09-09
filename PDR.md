# Project Design Review (PDR): PDP AI: LLM-generated for Merchandisers

## Overview

PDP AI: LLM-generated for Merchandisers is a Chrome extension that leverages Google's Gemini AI to analyze and optimize product detail pages (PDPs) for both SEO and customer experience. It provides real-time suggestions and allows users to apply changes directly to the page.

## Architecture

- **Manifest v3**: Uses Chrome's latest extension manifest for security and performance.
- **Service Worker (`background.js`)**: Handles communication with the Gemini API and manages extension workflow.
- **Content Script (`content.js`)**: Acts as a bridge between the background script and the page, forwarding messages and data.
- **DOM Updater (`dom-updater.js`)**: Injected into the main page context to update the DOM based on AI suggestions.
- **Popup UI (`popup.html`, `popup.js`, `popup.css`)**: Provides a user interface for analyzing, reviewing, and applying suggestions.
- **Options Page (`options.html`, `options.js`)**: Allows users to securely store their Gemini API key.

## Data Flow

1. **User Action**: User clicks "Analyze Page" in the popup.
2. **HTML Extraction**: `dom-updater.js` sends the full HTML to the content script via `window.postMessage`.
3. **API Request**: Content script forwards HTML to the background script, which calls Gemini API.
4. **Suggestion Delivery**: Background script receives suggestions and sends them back to the content script, which relays them to the DOM updater and popup.
5. **UI Update**: Popup displays suggestions, reasons, and allows the user to apply changes.
6. **DOM Update**: If approved, new content is injected into the page.

## Security & Privacy

- API key is stored using Chrome's local storage and never exposed to the page context.
- Content scripts and DOM updater communicate via `window.postMessage` to maintain isolation.
- Only explicit user actions trigger changes to the page.

## Extensibility & Improvements

- **i18n**: All user-facing text is now in English; future support for multiple languages is planned.
- **Reversion**: Users can revert changes by refreshing the page; future versions may add an undo feature.
- **History & Feedback**: Planned features include suggestion history and user feedback collection.

## Recommendations

- Add a feedback mechanism in the popup for user ratings.
- Store original content for easy reversion without refresh.
- Expand support for more PDP properties (e.g., images, reviews).
- Add prompt customization in options for advanced users.

## File Inventory

- `manifest.json`: Extension configuration and permissions.
- `background.js`: Service worker for API calls and workflow.
- `content.js`: Message bridge between extension and page.
- `dom-updater.js`: Direct DOM manipulation based on AI output.
- `popup.html`, `popup.js`, `popup.css`: User interface for analysis and suggestions.
- `options.html`, `options.js`: API key management.
- `README.md`: Project documentation and usage instructions.

## Testing & Validation

- Manual testing via Chrome's extension developer mode.
- Validate API key and error handling in options.
- Confirm UI updates and DOM changes on sample PDPs.

---

For more details, please check `README.md` file.
