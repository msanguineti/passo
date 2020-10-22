const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'.split('')
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const NUMBERS = '0123456789'.split('')
const SYMBOLS = '!@#$%^&*()_+-={}[]:";\'<>,.?/|\\~`'.split('')

const form = document.getElementById('form')
const generated = document.getElementById('generated')
const master = document.getElementById('master')

function onError(error) {
  console.error(`Error: ${error}`)
}

function sendMessageToTabs(tabs, cmd) {
  for (let tab of tabs) {
    browser.tabs
      .sendMessage(tab.id, { command: cmd.command, payload: cmd.payload })
      .then((response) => {
        switch (response.response) {
          case 'url':
            document.querySelector('#primary').value = response.value
            break
          default:
            console.error(`Cannot understand response ${response.response}`)
        }
      })
      .catch(onError)
  }
}

function sendCommand(cmd) {
  browser.tabs
    .query({
      currentWindow: true,
      active: true,
    })
    .then((tabs) => {
      sendMessageToTabs(tabs, cmd)
    })
    .catch(onError)
}

function notifyUser(title, message) {
  browser.notifications.create({
    type: 'basic',
    iconUrl: '/icons/Passo-bg-70.png',
    title,
    message,
  })
}

function generatePassword(e) {
  e.preventDefault()

  const len = document.getElementById('length').value
  const el = document.getElementById('case')
  const letterCase = el.options[el.selectedIndex].value
  const hasNumbers = document.getElementById('numbers').checked
  const hasSymbols = document.getElementById('symbols').checked

  if (Number.parseInt(len) <= '0') {
    notifyUser('Mmmmmh', 'Cannot generate a password of length <= 0')
    return
  }

  const bucket = []

  if (letterCase === 'ul' || letterCase === 'u') bucket.push(UPPERCASE)
  if (letterCase === 'ul' || letterCase === 'l') bucket.push(LOWERCASE)
  if (hasNumbers) bucket.push(NUMBERS)
  if (hasSymbols) bucket.push(SYMBOLS)

  if (bucket.length <= 0) {
    notifyUser('Oops', 'Your password needs letters, numbers and symbols')
    return
  }

  // eslint-disable-next-line no-undef
  sha(
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

      const use = document.querySelector('#use')
      use.addEventListener('click', () => {
        sendCommand({ command: 'use', payload: generated.value })
        notifyUser(
          'Password ready',
          'Your password has been pasted into password fields'
        )
        window.close()
      })
      use.className = use.className.replace(' w3-disabled', '')

      const copy = document.querySelector('#copy')
      copy.addEventListener('click', () => {
        generated.select()
        document.execCommand('copy')
        notifyUser(
          'Password copied',
          'Your password has been copied to the clipboard'
        )
        window.close()
      })
      copy.className = copy.className.replace(' w3-disabled', '')
    })
    .catch(onError)
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

document.querySelector('#options').addEventListener('click', () => {
  browser.runtime.openOptionsPage()
  window.close()
})

// eslint-disable-next-line no-undef
document.addEventListener('DOMContentLoaded', loadOptions)

sendCommand({ command: 'url' })
