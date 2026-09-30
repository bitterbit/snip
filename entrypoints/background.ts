export default defineBackground(() => {
  // Toolbar click (or Alt+Shift+S) injects the selection overlay into the page.
  browser.action.onClicked.addListener((tab) => {
    browser.scripting
      .executeScript({ target: { tabId: tab.id! }, files: ['/content-scripts/content.js'] })
      .catch(() => {}); // e.g. chrome:// pages, where injection isn't allowed
  });

  // The overlay asks for a screenshot of the visible tab once it has hidden itself.
  browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg !== 'capture') return;
    browser.tabs.captureVisibleTab(sender.tab!.windowId, { format: 'png' }).then(sendResponse);
    return true; // keep the channel open for the async reply
  });
});
