const shell = require('electron').shell;
const $ = require('../js/cash.min.js');

$(() => {
    $('a[href]').on('click', (e) => {
        e.preventDefault();

        shell.openExternal(e.path[0].getAttribute('href'));
    });
});