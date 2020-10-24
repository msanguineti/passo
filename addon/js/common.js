// eslint-disable-next-line no-unused-vars
async function sha(message, length = 512, buffer = true) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder('utf-8').encode(message)
  // hash the message
  const hashBuffer = await crypto.subtle.digest(`SHA-${length}`, msgBuffer)
  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  if (buffer) return hashArray
  // convert bytes to hex string
  const hashHex = hashArray
    .map((b) => ('00' + b.toString(16)).slice(-2))
    .join('')
  return hashHex
}

const toggleVisibility = document.getElementById('visibility')
toggleVisibility.addEventListener('click', () => {
  if (toggleVisibility.className.indexOf('flaticon-eye') == -1) {
    toggleVisibility.className += ' flaticon-eye'
    document.getElementById('master').type = 'password'
  } else {
    toggleVisibility.className = toggleVisibility.className.replace(
      ' flaticon-eye',
      ''
    )
    document.getElementById('master').type = 'text'
  }
})

// eslint-disable-next-line no-unused-vars
function saveOptions(e) {
  e.preventDefault()

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
      document.getElementById('length').value = result.prefs.length
        ? result.prefs.length
        : '15'
      document.getElementById('case').selectedIndex = result.prefs.case
        ? result.prefs.case
        : 0
      document.getElementById('numbers').checked =
        result.prefs.numbers !== void 0 ? result.prefs.numbers : true
      document.getElementById('symbols').checked =
        result.prefs.symbols !== void 0 ? result.prefs.symbols : true
    }
  }

  function onError(error) {
    console.log(`Error: ${error}`)
  }

  let getting = browser.storage.sync.get('prefs')
  getting.then(setCurrentChoice, onError)
}
