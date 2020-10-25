const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'.split('')
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const DIGITS = '0123456789'.split('')
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

function isUppercase(c) {
  return /^[A-Z]$/.test(c)
}
function isLowercase(c) {
  return /^[a-z]$/.test(c)
}
function isDigit(c) {
  return /^[0-9]$/.test(c)
}
function isSymbol(c) {
  return SYMBOLS.indexOf(c) >= 0
}

function criteriaMet(p, checks) {
  for (let i = 0; i < checks.length; i++) {
    if (!p.some((v) => checks[i](v))) {
      return false
    }
  }

  return true
}

async function generatePassword(e) {
  try {
    e.preventDefault()

    const password_length = document.getElementById('length').value

    if (Number.parseInt(password_length) <= 0) {
      notifyUser('Mmmmmh', 'Cannot generate a password of length <= 0')
      return
    }

    const el = document.getElementById('case')
    const letterCase = el.options[el.selectedIndex].value
    const hasDigits = document.getElementById('digits').checked
    const hasSymbols = document.getElementById('symbols').checked

    const meetCriteria = document.getElementById('criteria').checked

    const checks = []
    const bucket = []
    if (letterCase === 'ul' || letterCase === 'u') {
      bucket.push(...UPPERCASE)
      if (meetCriteria) checks.push(isUppercase)
    }
    if (letterCase === 'ul' || letterCase === 'l') {
      bucket.push(...LOWERCASE)
      if (meetCriteria) checks.push(isLowercase)
    }
    if (hasDigits) {
      bucket.push(...DIGITS)
      if (meetCriteria) checks.push(isDigit)
    }
    if (hasSymbols) {
      bucket.push(...SYMBOLS)
      if (meetCriteria) checks.push(isSymbol)
    }

    if (bucket.length <= 0) {
      notifyUser(
        'Oops',
        'Cannot generate a password without letters, digits or symbols!'
      )
      return
    }

    if (checks.length > password_length) {
      notifyUser(
        'Error',
        `Minimum length to meet your password's criteria is: ${checks.length}`
      )
      return
    }

    const limit = 256 - (256 % bucket.length)

    /* eslint-disable no-undef */
    let hash_array = (
      await sha(
        `${master.value}${document.getElementById('primary').value}${
          document.getElementById('secondary').value
        }${password_length}${letterCase}${hasDigits}${hasSymbols}`
      )
    ).filter((v) => v < limit)
    /* eslint-enable */

    let password = []

    do {
      // adjust for password length
      while (hash_array.length < password_length) {
        hash_array = [
          ...hash_array,
          // eslint-disable-next-line no-undef
          ...(await sha(hash_array.join(''))),
        ].filter((v) => v < limit)
      }

      password = hash_array
        .slice(0, password_length)
        .map((n) => bucket[n % bucket.length])

      // start anew if criteria are not met
      // eslint-disable-next-line no-undef
      hash_array = await sha(hash_array.join(''))
    } while (!criteriaMet(password, checks))

    generated.value = password.join('')

    // const entropy = Math.log2(Math.pow(bucket.length,password_length))
    // console.log("generatePassword -> entropy", entropy)

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
  } catch (e) {
    onError(e)
  }
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
