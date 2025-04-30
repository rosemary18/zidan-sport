const routes = [
    ...require('./other.routes'),
    ...require('./event.routes'),
    ...require('./participant.routes'),
    ...require('./bracket.routes'),
    ...require('./match.routes')
]

module.exports = routes