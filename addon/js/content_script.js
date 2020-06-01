// eslint-disable-next-line no-undef
browser.runtime.onMessage.addListener((request) => {
  console.log('request', request)

  switch (request.command) {
    case 'url':
      return Promise.resolve({
        response: 'url',
        value: window.location.hostname,
      })
    case 'use': {
      const inputs = document.getElementsByTagName('input')

      for (let i = 0; i < inputs.length; i++) {
        const el = inputs[i]

        if (el.type === 'password') {
          el.value = request.payload
        }
      }
      break
    }
    default:
      console.error(`Cannot understand message command ${request.command}`)
  }
})
