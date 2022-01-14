const path = require('path');

// Require bundler
const { Bundler } = require('neutralino-appimage-bundler');

// Create an object with some params
const bundler = new Bundler({
    // .desktop file properties
    desktop: {
        // Name field
        name: 'Cloudflare WARP',

        // Path to the icon
        icon: path.join(__dirname, 'public/icons/64x64.png')
    },

    // Neutralino binary info
    binary: {
        // Name of the binary (cli.binaryName)
        name: 'warp-gui',

        // Dist folder path
        dist: path.join(__dirname, 'dist')
    },

    // Some files or folders to copy inside of the the AppImage
    copy: {
        'public': path.join(__dirname, 'public')
    },

    // Application version
    version: '1.0.0'
});

// Bundle project
bundler.bundle();
