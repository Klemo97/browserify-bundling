const browserify = require('browserify')
const glob = require('glob')

/**
 * Whitelist vendorov, ktore globalne nacitame
 *
 * @type {string[]}
 */
const globalVendorWhitelist = [
    'lodash',
]

/**
 * Vytvori mapu globalnych balickov podla konvencie:
 * js/global_modules/{FILE_NAME} -> require('{FILE_NAME}')
 *
 * @param {string[]} filenames
 * @return {{file: string, expose: string}[]}
 */
function getRequireObject(filenames) {
    return filenames.map(
        filename => {
            const splitPath = filename.split('/')
            const baseName = splitPath[splitPath.length - 1].replace(/.m?js/, '')

            return {file: filename, expose: baseName}
        }
    )
}

/**
 * Zmapuj zoznam vendorov na pole sparsovatelne browserify.require
 *
 * @param packages
 * @return {{file: string}[]}
 */
function getDepsArray(packages) {
    return packages.map(dependency => ({file: dependency}))
}

glob('./webroot/js/global_modules/*.js', (err, files) => {
    const requireEntries = getRequireObject(files)
    const depPackages = getDepsArray(globalVendorWhitelist)

    const browserifyInstance = browserify({entries: files}, {debug: true})
        .transform('babelify')
        .transform('uglifyify', { global: true  })
        .require([...requireEntries, ...depPackages])

    browserifyInstance
        .bundle()
        .pipe(process.stdout, 'utf8')
})