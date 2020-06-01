function restoreOptions(e) {
  e.preventDefault()

  document.getElementById('length').value = '15'
  document.getElementById('case').selectedIndex = 0
  document.getElementById('numbers').checked = true
  document.getElementById('symbols').checked = true
}

document.getElementById('defaults').addEventListener('click', restoreOptions)

// eslint-disable-next-line no-undef
document.addEventListener('DOMContentLoaded', loadOptions)

// eslint-disable-next-line no-undef
document.getElementById('form').addEventListener('submit', saveOptions)

async function checkPassword(e) {
  e.preventDefault()

  const password = document.getElementById('master').value

  if (!password) return

  // eslint-disable-next-line no-undef
  const hash = await sha(password, 1, false)

  function escapeHTML(str, times) {
    times = encodeURI(times.trim())

    return `${str[0]}${times}${str[1]}`
  }

  function reqListener() {
    console.log(hash)

    const suffixes = this.responseText.split('\n')

    const breached = suffixes.find((v) => {
      return hash.endsWith(v.trim().toLowerCase().split(':')[0])
    })

    const breachedPanel = document.getElementById('breachedPanel')
    breachedPanel.className = breachedPanel.className.replace(' w3-show', '')
    breachedPanel.className = breachedPanel.className.replace(' w3-red', '')
    breachedPanel.className = breachedPanel.className.replace(' w3-green', '')

    if (breached) {
      breachedPanel.classList += ' w3-red w3-show'
      document.getElementById(
        'breached'
      ).innerHTML = escapeHTML`This password has been seen ${
        breached.split(':')[1]
      } times before!`
    } else {
      breachedPanel.classList += ' w3-green w3-show'
      document.getElementById(
        'breached'
      ).innerHTML = `Your master password is OK!`
    }
  }

  var oReq = new XMLHttpRequest()
  oReq.addEventListener('load', reqListener)
  oReq.open(
    'GET',
    'https://api.pwnedpasswords.com/range/' + hash.substring(0, 5)
  )
  oReq.send()
}

document.getElementById('check').addEventListener('click', checkPassword)
