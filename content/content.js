(function() {
  if (window.location.protocol === 'chrome:' || window.location.protocol === 'chrome-extension:') {
    return;
  }

  function updateClock() {
    const now = new Date();
    const dateString = now.toLocaleDateString();
    const timeString = now.toLocaleTimeString();

    timeDiv.textContent = timeString;
    dateDiv.textContent = dateString;
  }

  const clockDiv = document.createElement('div');
  clockDiv.id = 'clockDiv';
  clockDiv.style.position = 'fixed';  // Cambiado a 'fixed'
  clockDiv.style.bottom = '10px';
  clockDiv.style.right = '10px';

  const timeDiv = document.createElement('div');
  timeDiv.id = 'timeDiv';

  const dateDiv = document.createElement('div');
  dateDiv.id = 'dateDiv';

  clockDiv.appendChild(timeDiv);
  clockDiv.appendChild(dateDiv);
  document.body.appendChild(clockDiv);

  updateClock();
  setInterval(updateClock, 1000);

  chrome.storage.sync.get({
    timeSize: 20,
    dateSize: 20,
    opacity: 1,
    hidden: false,
    locked: true,
    position: { top: '', left: '', bottom: '10px', right: '10px' }
  }, (result) => {
    timeDiv.style.fontSize = `${result.timeSize}px`;
    dateDiv.style.fontSize = `${result.dateSize}px`;
    clockDiv.style.opacity = result.opacity;
    clockDiv.style.display = result.hidden ? 'none' : 'block';
    clockDiv.style.top = result.position.top;
    clockDiv.style.left = result.position.left;
    clockDiv.style.bottom = result.position.bottom;
    clockDiv.style.right = result.position.right;
    clockDiv.draggable = !result.locked;
  });

  let isDragging = false;
  let offsetX, offsetY;

  clockDiv.addEventListener('mousedown', (e) => {
    if (!clockDiv.draggable) return;
    isDragging = true;
    offsetX = e.clientX - clockDiv.getBoundingClientRect().left;
    offsetY = e.clientY - clockDiv.getBoundingClientRect().top;
    document.addEventListener('mousemove', onMouseMove);
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      chrome.storage.sync.set({
        position: {
          top: clockDiv.style.top,
          left: clockDiv.style.left,
          bottom: clockDiv.style.bottom,
          right: clockDiv.style.right
        }
      });
    }
  });

  function onMouseMove(e) {
    if (isDragging) {
      clockDiv.style.top = `${e.clientY - offsetY}px`;
      clockDiv.style.left = `${e.clientX - offsetX}px`;
      clockDiv.style.right = 'auto';
      clockDiv.style.bottom = 'auto';
    }
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateSettings') {
      if (message.timeSize) {
        timeDiv.style.fontSize = `${message.timeSize}px`;
      }
      if (message.dateSize) {
        dateDiv.style.fontSize = `${message.dateSize}px`;
      }
      if (message.opacity) {
        clockDiv.style.opacity = message.opacity;
      }
      if (message.hidden !== undefined) {
        clockDiv.style.display = message.hidden ? 'none' : 'block';
      }
      if (message.locked !== undefined) {
        clockDiv.draggable = !message.locked;
      }
    }
  });

  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (!document.body.contains(clockDiv)) {
        document.body.appendChild(clockDiv);
      }
    });
  }).observe(document.body, { childList: true });
})();
