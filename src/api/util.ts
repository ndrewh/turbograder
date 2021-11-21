const URL_BASE = "https://osu.instructure.com"

// borrowed from https://github.com/redpwn/rctf/blob/92cd2c468d4c3c0188550e3216c4f48dbec1b0e2/client/src/api/util.js#L25
export const request = (method: string, endpoint: string, data: ({ [key: string]: string } | string) = null) => {
    let body = null
    let qs = ''
    if (method === 'GET' && data && typeof data == 'object') {
        // encode data into the querystring
        // eslint-disable-next-line prefer-template
        qs = '?' + Object.keys(data)
            .filter(k => data[k] !== undefined)
            .map(k => `${k}=${encodeURIComponent(data[k])}`)
            .join('&')
    } else if (method === 'GET' && data && typeof data == 'string') {
        qs = '?' + data
    } else {
        body = data
    }
    const headers: any = {
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }
    if (body) {
        headers['Content-Type'] = 'application/json'
    }
    return fetch(`${URL_BASE}${endpoint}${qs}`, {
        method,
        headers,
        body: body && JSON.stringify(body)
    })
        .then(resp => resp.json())
        .then(resp => {
            if ('errors' in resp) {
                // TODO: Somehow prompt for fixing token
                console.log("Token borked")
            }

            return resp
        })
        .catch(err => {
            console.debug(err)
        })
}