/**
 * Gulp buildery
 *
 * Wrappery pre nastavitelne bundlovanie
 */

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const watchify = require('watchify');
const babel = require('babelify');
const glob = require('glob')
const path = require('path')
const merge = require('merge-stream')

module.exports.GlobalDependencyBundler = function () {
    // Zoznam vendor balickov
    let depPackages = []
    // Vystupny priecinok
    let destFolder
    // Nazov vystupneho suboru
    let destFileName
    // Glob cesta ku global dependency modulom
    let srcFolder
    // Watch mod
    let watch = false
    // Prostredie
    let env = ENVIRONMENT.DEV

    const isDev = () => env === ENVIRONMENT.DEV

    const getEntryFiles = () =>  glob.sync(srcFolder)

    return {
        /**
         * Whitelist vendor balickov, ktore chceme globalne loadovat
         *
         * @param packages
         * @return {self}
         */
        withPackages: function (packages) {
            depPackages = [...depPackages, ...(getDepsArray(packages))]
            return this
        },

        /**
         * Nasetuj output do ktoreho vytvorime bundle
         *
         * @param {{destFolder: string, destFileName: string}} output
         * @return {self}
         */
        withOutput: function(output) {
            ({destFolder, destFileName} = output)
            return this
        },

        /**
         * Nasetuj watch mode
         *
         * @param {boolean} watchMode
         * @return {self}
         */
        withWatchMode: function(watchMode) {
            watch = watchMode
            return this
        },

        /**
         * Nasetuje glob cestu ku globalnym modulom
         *
         * @param {string} globSrc
         * @return {self}
         */
        withGlobSrc: function(globSrc) {
            srcFolder = globSrc
            return this
        },

        /**
         * Nasetuje prostredie - Produkcia alebo Vyvoj
         *
         * @param environment
         * @return {self}
         */
        withEnv: function (environment) {
            env = environment
            return this
        },

        /**
         * Vytvori bundler a vygeneruje bundle
         */
        create: () => {
            const files = getEntryFiles()
            const requireEntries = getRequireObject(files)

            const bundler = watchify(
                browserify({entries: files}, {debug: isDev()})
                    .transform(
                        babel.configure({
                            presets: ['@babel/preset-env']
                        })
                    )
                    .require([...requireEntries, ...depPackages])
            );

            const bundle = () => bundler.bundle()
                .on('error', function (err) {
                    console.error(err);
                    this.emit('end');
                })
                .pipe(source(destFileName))
                .pipe(buffer())
                .pipe(sourcemaps.init({loadMaps: isDev()}))
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest(destFolder));

            if (watch) {
                bundler.on('update', function () {
                    console.log('-> bundling...');
                    bundle();
                });
            }

            bundle();
        }
    }
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

module.exports.ModuleDependencyBundler = function () {
    let srcFolder
    let destFolder
    let env = ENVIRONMENT.DEV
    let suffix = '.bundle.js'

    const getFiles = () => glob.sync(srcFolder)

    const isDev = () => env === ENVIRONMENT.DEV

    return {
        withSuffix: function (fileSuffix) {
            suffix = fileSuffix
            return this
        },
        withGlobSrc: function (globSrc) {
            srcFolder = globSrc
            return this
        },
        withDestDir: function (destDir) {
            destFolder = destDir
            return this
        },
        withEnv: function (environment) {
            env = environment
            return this
        },
        create: () => {
            const files = getFiles()

            return merge(
                files.map(file =>
                    browserify({
                        entries: file,
                        debug: isDev()
                    }).transform(babel.configure({
                        presets: ['@babel/preset-env']
                    }))
                        .bundle()
                        .pipe(source(path.basename(file, '.js') + suffix))
                        .pipe(buffer())
                        .pipe(sourcemaps.init({loadMaps: isDev()}))
                        .pipe(sourcemaps.write('./'))
                        .pipe(gulp.dest(destFolder))
                ))
        }
    }
}

const ENVIRONMENT = {
    DEV: 'dev',
    PROD: 'prod'
}

module.exports.ENVIRONMENT = ENVIRONMENT