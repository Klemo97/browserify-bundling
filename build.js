const browserify = require('browserify')
const babel = require('babelify');
const glob = require('glob')

glob('webroot/js/global_modules/*.js', {}, (err, files) => {
    const browserifyInstance = browserify(files, {debug: true}).transform(
        babel.configure({
            presets: ['@babel/preset-env']
        })
    )

    browserifyInstance.bundle().pipe(process.stdout)
})