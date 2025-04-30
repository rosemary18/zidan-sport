const { FETCH_REQUEST_TYPES, RES_TYPES } = require('../../types')
const Path = require('path')

// Handlers

const handler404 = async (req, res) => {
    return res.response(RES_TYPES[404]("You are lost!"));
} 

// Routing

const routes = [
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: '/',
        handler: (h, r) => {
            return r.file(Path.join(__dirname, '../../public/files/index.html'))
        }
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: '/dashboard',
        handler: (h, r) => {
            return r.file(Path.join(__dirname, '../../public/files/dashboard.html'))
        }
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: '/kumite',
        handler: (h, r) => {
            return r.file(Path.join(__dirname, '../../public/files/kumite.html'))
        }
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: '/kata',
        handler: (h, r) => {
            return r.file(Path.join(__dirname, '../../public/files/kata.html'))
        }
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: '/katabendera',
        handler: (h, r) => {
            return r.file(Path.join(__dirname, '../../public/files/katabendera.html'))
        }
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: '/bracket',
        handler: (h, r) => {
            return r.file(Path.join(__dirname, '../../public/files/bracket-2.html'))
        }
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: '/jury',
        handler: (h, r) => {
            return r.file(Path.join(__dirname, '../../public/files/jury.html'))
        }
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: '/scoreboard/{name}',
        handler: (h, r) => {
            if (h.params.name === 'kumite-2') {
                return r.file(Path.join(__dirname, '../../public/files/scoreboard-kumite-2.html'))
            } else if (h.params.name === 'kata') {
                return r.file(Path.join(__dirname, '../../public/files/scoreboard-kata.html'))
            } else if (h.params.name === 'katabendera') {
                return r.file(Path.join(__dirname, '../../public/files/scoreboard-katabendera.html'))
            } else {
                return r.file(Path.join(__dirname, '../../public/files/scoreboard-kumite.html'))
            }
        }
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: '/icons/{param*}',
        handler: {
            directory: {
                path: './icons/',
                redirectToSlash: true,
                index: true,
            }
        }
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: '/files/{param*}',
        handler: {
            directory: {
                path: './files/',
                redirectToSlash: true,
                index: true,
            }
        }
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: '/images/{param*}',
        handler: {
            directory: {
                path: './images/',
                redirectToSlash: true,
                index: true,
            }
        }
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: '/sounds/{param*}',
        handler: {
            directory: {
                path: './sounds/',
                redirectToSlash: true,
                index: true,
            }
        }
    },
    {
        method: [FETCH_REQUEST_TYPES.GET, FETCH_REQUEST_TYPES.POST, FETCH_REQUEST_TYPES.PUT, FETCH_REQUEST_TYPES.DELETE],
        path: '/{any*}',
        handler: handler404,
    }
]

module.exports = routes