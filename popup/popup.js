function applyAndSaveSetting(key, value) {
  let settings = {};
  settings[key] = value;
  chrome.storage.sync.set(settings, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'updateSettings',
        [key]: value
      });
    });
  });
}

function validateAndSaveInput(element) {
  element.addEventListener('change', (e) => {
    let value = parseInt(e.target.value);
    if (isNaN(value) || value < 10) {
      e.target.value = 10;
      value = 10;
    } else if (value > 30) {
      e.target.value = 30;
      value = 30;
    }
    applyAndSaveSetting(e.target.id, value);
  });

  element.addEventListener('paste', (e) => {
    e.preventDefault();
    let paste = (e.clipboardData || window.clipboardData).getData('text');
    let value = parseInt(paste);
    if (isNaN(value) || value < 10) {
      value = 10;
    } else if (value > 30) {
      value = 30;
    }
    element.value = value;
    applyAndSaveSetting(element.id, value);
  });

  element.addEventListener('blur', (e) => {
    let value = parseInt(e.target.value);
    if (isNaN(value) || value < 10) {
      e.target.value = 10;
      value = 10;
    } else if (value > 30) {
      e.target.value = 30;
      value = 30;
    }
    applyAndSaveSetting(e.target.id, value);
  });

  element.addEventListener('input', (e) => {
    let value = parseInt(e.target.value);
    if (value > 30) {
      e.target.value = 30;
    }
  });
}

validateAndSaveInput(document.getElementById('timeSize'));
validateAndSaveInput(document.getElementById('dateSize'));

document.getElementById('opacity').addEventListener('input', (e) => {
  applyAndSaveSetting('opacity', e.target.value);
});

document.getElementById('toggleClock').addEventListener('click', () => {
  chrome.storage.sync.get('hidden', (data) => {
    const hidden = !data.hidden;
    applyAndSaveSetting('hidden', hidden);
    document.getElementById('toggleClock').textContent = hidden ? 'Mostrar Reloj' : 'Ocultar Reloj';
  });
});

document.getElementById('toggleLock').addEventListener('click', () => {
  chrome.storage.sync.get('locked', (data) => {
    const locked = !data.locked;
    applyAndSaveSetting('locked', locked);
    document.getElementById('toggleLock').textContent = locked ? 'Desbloquear Movimiento' : 'Bloquear Movimiento';
    document.getElementById('toggleLock').className = locked ? 'locked' : 'unlocked';
  });
});

// Load current settings
chrome.storage.sync.get({
  timeSize: 20,
  dateSize: 20,
  opacity: 1,
  hidden: false,
  locked: true
}, (result) => {
  if (result.timeSize) {
    document.getElementById('timeSize').value = result.timeSize;
  }
  if (result.dateSize) {
    document.getElementById('dateSize').value = result.dateSize;
  }
  if (result.opacity) {
    document.getElementById('opacity').value = result.opacity;
  }
  document.getElementById('toggleClock').textContent = result.hidden ? 'Mostrar Reloj' : 'Ocultar Reloj';
  document.getElementById('toggleLock').textContent = result.locked ? 'Desbloquear Movimiento' : 'Bloquear Movimiento';
  document.getElementById('toggleLock').className = result.locked ? 'locked' : 'unlocked';
});
