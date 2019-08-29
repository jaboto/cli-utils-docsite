const liveServer = require('live-server')
const DocsEngine = require('../support/docs')
const commonOptions = require('../support/commonOptions')

const handler = async ({ port, open, force, ...options }) => {
    const docs = DocsEngine(options)

    await docs.initialize({ force })
    await docs.build()

    docs.watch()
    liveServer.start({
        root: options.dest,
        wait: 300,
        port,
        open,
    })
}

module.exports = {
    command: 'serve [source]',
    desc: 'Serve documentation',
    aliases: 's',
    builder: {
        ...commonOptions,
        port: {
            type: 'number',
            default: 3000,
        },
        open: {
            type: 'boolean',
            default: true,
        },
    },
    handler,
}