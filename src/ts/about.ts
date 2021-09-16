const shell = require('electron').shell;

import $ from 'cash-dom';

$(() => {
    $('a[href]').on('click', (e) => {
        e.preventDefault();

        shell.openExternal(e.path[0].getAttribute('href'));
    });
});