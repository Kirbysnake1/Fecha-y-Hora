function updateClock() {
  const now = new Date();
  const dateString = now.toLocaleDateString();
  const timeString = now.toLocaleTimeString();

  timeDiv.textContent = timeString;
  dateDiv.textContent = dateString;
}

const clockDiv = document.createElement('div');
clockDiv.id = 'clockDiv';
clockDiv.style.position = 'absolute';
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

// Load settings from storage with defaults
chrome.storage.sync.get({
  timeSize: 20,
  dateSize: 20,
  opacity: 1,
  hidden: false,
  locked: true,
  position: { top: 'auto', left: 'auto', bottom: '10px', right: '10px' }
}, (result) => {
  timeDiv.style.fontSize = `${result.timeSize}px`;
  dateDiv.style.fontSize = `${result.dateSize}px`;
  clockDiv.style.opacity = result.opacity;
  clockDiv.style.display = result.hidden ? 'none' : 'block';
  clockDiv.draggable = !result.locked;

  if (result.position) {
    clockDiv.style.top = result.position.top;
    clockDiv.style.left = result.position.left;
    clockDiv.style.bottom = result.position.bottom;
    clockDiv.style.right = result.position.right;
  }
});

let isDragging = false;
let offsetX, offsetY;

clockDiv.addEventListener('click', (e) => {
  if (!clockDiv.draggable) return;
  if (!isDragging) {
    isDragging = true;
    offsetX = e.clientX - clockDiv.getBoundingClientRect().left;
    offsetY = e.clientY - clockDiv.getBoundingClientRect().top;
    clockDiv.style.right = 'auto';
    clockDiv.style.bottom = 'auto';
  } else {
    isDragging = false;
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

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    clockDiv.style.left = `${e.clientX - offsetX}px`;
    clockDiv.style.top = `${e.clientY - offsetY}px`;
  }
});

// Listener para mensajes del popup
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

// Asegurarse de que el reloj permanezca en la pantalla
new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (!document.body.contains(clockDiv)) {
      document.body.appendChild(clockDiv);
    }
  });
}).observe(document.body, { childList: true });
