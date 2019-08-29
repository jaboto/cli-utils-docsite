const fs = require('fs-extra')
const path = require('path')
const matchAll = require('match-all')

const { reporter } = require('@dhis2/cli-helpers-engine')
const cacheBase = 'utils/docsite/assets'

const regexp = /"(http(?:s?):\/\/[^"]+)"/g
module.exports.localify = async ({ filePath, assetsDir, cache, force }) => {
    let content = fs.readFileSync(filePath).toString()
    fs.ensureDirSync(assetsDir)
    const matches = matchAll(content, regexp).toArray()

    reporter.debug('Found external assets', matches)

    const usedNames = {}

    reporter.info(`Found ${matches.length} esternal assets, downloading...`)
    await Promise.all(
        matches.map(async url => {
            const basename = path.basename(url)
            if (usedNames[basename] && usedNames[basename] !== url) {
                reporter.warn(
                    `Two assets with the basename ${chalk.bold(
                        basename
                    )} were found, this is not currently supported!`
                )
                return
            }
            usedNames[basename] = url

            const cachePath = path.join(cacheBase, basename)

            await cache.get(url, cachePath, {
                raw: true,
                force,
            })

            const dest = path.join(assetsDir, basename)
            fs.copyFileSync(cache.getCacheLocation(cachePath), dest)

            content = content.replace(
                url,
                `./${path.relative(path.dirname(filePath), dest)}`
            )
        })
    )

    fs.writeFileSync(filePath, content)
    return content
}