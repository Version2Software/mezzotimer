module.exports = {
    lintOnSave: false,
    publicPath: '',
    outputDir: 'staging',
    configureWebpack: {
        output: {
            // The filenames need to have a ./ otherwise Electron won't be able to find the files.
            filename: './[name].js',
            chunkFilename: './[name].js',
        }
    }
}
