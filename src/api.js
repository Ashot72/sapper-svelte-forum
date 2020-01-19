const send = ({ method, path, data, server }) => {
  const fetch = process.browser ? window.fetch : server.fetch

  const opts = { method, headers: {} }

  if (data) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(data)
  }

  return fetch(`${path}`, opts)
    .then(r => r.text())
    .then(json => {
      try {
        return JSON.parse(json)
      } catch (err) {
        return json
      }
    })
}

export const get = (path, server) => send({ method: 'GET', path, server })

export const del = path => send({ method: 'DELETE', path })

export const post = (path, data) => send({ method: 'POST', path, data })

export const patch = (path, data) => send({ method: 'PATCH', path, data })

export const put = (path, data) => send({ method: 'PUT', path, data })
