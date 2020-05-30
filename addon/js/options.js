function restoreOptions(e) {
  e.preventDefault()

  document.getElementById('length').value = '15'
  document.getElementById('case').selectedIndex = 0
  document.getElementById('numbers').checked = true
  document.getElementById('symbols').checked = true
}

// eslint-disable-next-line no-undef
document.addEventListener('DOMContentLoaded', loadOptions)

// eslint-disable-next-line no-undef
document.getElementById('form').addEventListener('submit', saveOptions)
document.getElementById('defaults').addEventListener('click', restoreOptions)
