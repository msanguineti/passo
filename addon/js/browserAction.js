function setup() {
  const lower = 'abcdefghijklmnopqrstuvwxyz'.split('')
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  const numbers = '0123456789'.split('')
  const symbols = '!@#$%^&*()_+-={}[]:";\'<>,.?/|\\~`'.split('')

  const form = document.getElementById('form')
  const generated = document.getElementById('generated')
  const master = document.getElementById('master')

  async function sha512(message) {
    // encode as UTF-8
    const msgBuffer = new TextEncoder('utf-8').encode(message)

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-512', msgBuffer)

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer))

    // convert bytes to hex string
    // const hashHex = hashArray
    //   .map((b) => ('00' + b.toString(16)).slice(-2))
    //   .join('')
    // return hashHex

    return hashArray
  }

  function generatePassword(e) {
    e.preventDefault()

    const len = document.getElementById('length').value
    const el = document.getElementById('case')
    const letterCase = el.options[el.selectedIndex].value
    const hasNumbers = document.getElementById('numbers').checked
    const hasSymbols = document.getElementById('symbols').checked

    // easter egg
    if (len === '0') {
      generated.value = '53cr37 p455w0rd'
      return
    }

    const bucket = []

    if (letterCase === 'ul' || letterCase === 'u') bucket.push(upper)
    if (letterCase === 'ul' || letterCase === 'l') bucket.push(lower)
    if (hasNumbers) bucket.push(numbers)
    if (hasSymbols) bucket.push(symbols)

    sha512(
      `${master.value}${document.getElementById('primary').value}${
        document.getElementById('secondary').value
      }${len}${letterCase}${hasNumbers}${hasSymbols}`
    )
      .then((sha) => {
        // shuffle the bucket
        for (let i = bucket.length - 1; i > 0; i--) {
          const j = sha[i] % bucket.length
          const x = bucket[i]
          bucket[i] = bucket[j]
          bucket[j] = x
        }

        const password = []
        for (let i = 0; i < len; i++) {
          // add 1 every time we reach sha_length to avoid repetitions
          // (at least until password_length = sha_length^2 )
          const picker = Math.floor(sha[i % sha.length] + i / sha.length)
          const picked = bucket[picker % bucket.length]
          password.push(picked[sha[picker % sha.length] % picked.length])
        }
        generated.value = password.join('')
      })
      .catch((err) => {
        console.log(err)
      })
  }

  form.addEventListener('submit', generatePassword)

  const settingsPanel = document.getElementById('settingsPanel')
  document.getElementById('settingsToggle').addEventListener('click', () => {
    if (settingsPanel.className.indexOf('w3-show') == -1) {
      settingsPanel.className += ' w3-show'
    } else {
      settingsPanel.className = settingsPanel.className.replace(' w3-show', '')
    }
  })

  const toggleVisibility = document.getElementById('visibility')
  toggleVisibility.addEventListener('click', () => {
    if (toggleVisibility.className.indexOf('flaticon-eye') == -1) {
      toggleVisibility.className += ' flaticon-eye'
      master.type = 'password'
    } else {
      toggleVisibility.className = toggleVisibility.className.replace(
        ' flaticon-eye',
        ''
      )
      master.type = 'text'
    }
  })

  document.querySelector('#options').addEventListener('click', () => {
    // eslint-disable-next-line no-undef
    browser.runtime.openOptionsPage()
    window.close()
  })

  // eslint-disable-next-line no-undef
  document.addEventListener('DOMContentLoaded', loadOptions)
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
  document.querySelector('#popup-content').classList.add('hidden')
  document.querySelector('#error-content').classList.remove('hidden')
  console.error(`Failed to execute beastify content script: ${error.message}`)
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
// eslint-disable-next-line no-undef
browser.tabs
  .executeScript({ file: 'content_script.js' })
  .then(setup)
  .catch(reportExecuteScriptError)
