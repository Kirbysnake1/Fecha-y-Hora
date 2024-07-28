chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
      timeSize: 20,
      dateSize: 20,
      opacity: 1,
      hidden: false,
      locked: true,
      position: { top: '', left: '', bottom: '10px', right: '10px' }
    });
  });
  
  chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content/content.js']
    });
  });
  