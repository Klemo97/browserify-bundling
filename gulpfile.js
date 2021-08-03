/**
 * Gulp task script
 */

const gulp = require('gulp');

const {GlobalDependencyBundler, ModuleDependencyBundler, ENVIRONMENT} = require('./gulpBuilder')

/**
 * Whitelist vendorov, ktore globalne nacitame
 *
 * @type {string[]}
 */
const globalVendorWhitelist = [
    'lodash',
]

function compile(watch) {
    return (new GlobalDependencyBundler())
        .withPackages(globalVendorWhitelist)
        .withGlobSrc('./webroot/js/global_modules/**/*.js')
        .withWatchMode(watch)
        .withOutput({
            destFolder: './webroot/js/',
            destFileName: 'build.js'
        })
        .withEnv(ENVIRONMENT.DEV)
        .create()
}

function compileModules() {
    return (new ModuleDependencyBundler())
        .withGlobSrc('./webroot/js/module_scripts/**/*.js')
        .withDestDir('./webroot/js/')
        .withEnv(ENVIRONMENT.DEV)
        .withSuffix('.bundle.js')
        .create()
}

gulp.task('build', () => compile(false));

gulp.task('watch', () => compile(true));

gulp.task('build-modules', () => compileModules())

gulp.task('default', gulp.series(['build-modules', 'build']));