const path = require('path');

module.exports = {
    mode: 'production',
    entry: './dist/transpiled/src/main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    //externals: 'three'
};