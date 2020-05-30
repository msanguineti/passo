// eslint-disable-next-line no-unused-vars
function saveOptions(e) {
  e.preventDefault()

  // eslint-disable-next-line no-undef
  browser.storage.sync.set({
    prefs: {
      length: document.getElementById('length').value,
      case: document.getElementById('case').selectedIndex,
      numbers: document.getElementById('numbers').checked,
      symbols: document.getElementById('symbols').checked,
    },
  })
}

// eslint-disable-next-line no-unused-vars
function loadOptions() {
  function setCurrentChoice(result) {
    if (result.prefs) {
      document.getElementById('length').value = result.prefs.length ?? '15'
      document.getElementById('case').selectedIndex = result.prefs.case ?? 0
      document.getElementById('numbers').checked = result.prefs.numbers ?? true
      document.getElementById('symbols').checked = result.prefs.symbols ?? true
    }
  }

  function onError(error) {
    console.log(`Error: ${error}`)
  }

  // eslint-disable-next-line no-undef
  let getting = browser.storage.sync.get('prefs')
  getting.then(setCurrentChoice, onError)
}
