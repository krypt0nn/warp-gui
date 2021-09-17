const { ipcRenderer } = require('electron/renderer');

import { Warp, WarpStatistics } from './warp';
import { shell_exec } from './shell_exec';
import $ from 'cash-dom';

$(() =>
{
    // Apply WARP client version
    Warp.getVersion().then((version: string) => $('#warp-version').text(version));

    let prevStats = ['', '', '', ''];

    // Create tray icon
    ipcRenderer.invoke('update-tray', false);

    // Handle disconnect tray button
    ipcRenderer.on('disconnect', () => {
        Warp.disconnect();

        ipcRenderer.invoke('update-tray', false);
    });

    // Handle connect tray button
    ipcRenderer.on('connect', () => {
        Warp.connect();

        ipcRenderer.invoke('update-tray', false);
    });

    // Resend show-about request back to the main process
    ipcRenderer.on('show-about-refer', () => ipcRenderer.invoke('show-about'));

    // Resend update-tray request back to the main process
    ipcRenderer.on('update-tray-refer', () => prevStats[0] = '-');

    // Add connection stats updater
    setInterval (() =>
    {
        if ($('#turn-warp').attr('enabled') == 'true')
        {
            Warp.getStatistics().then((stats : WarpStatistics | string) =>
            {
                // Update tray and bottom menu only if things have changed
                if (typeof stats == 'object' && (stats.sent != prevStats[0] || stats.received != prevStats[1] || stats.latency != prevStats[2] || stats.loss != prevStats[3]))
                {
                    $('#sent').text(stats.sent);
                    $('#received').text(stats.received);

                    $('#connection-stats-further').css('width', '160px');
                    $('#connection-stats-further').html(`Sent: ${stats.sent}<br>Received: ${stats.received}<br>Latency: ${stats.latency}<br>Loss: ${stats.loss}`);

                    ipcRenderer.invoke('update-tray', true, stats.sent, stats.received, stats.latency, stats.loss);

                    prevStats = [stats.sent, stats.received, stats.latency, stats.loss];
                }
            });
        }

        else if (prevStats[0] !== '')
        {
            ipcRenderer.invoke('update-tray', false);

            prevStats[0] = '';
        }
    }, 1000);

    Warp.getStatus().then((status) =>
    {
        // WARP is already running
        if (status)
        {
            let button = $('#turn-warp');

            // Update elements design
            $('#comet-cold').css('display', 'none');
            $('#comet-hot').css('display', 'block');

            $('#warp-title').removeClass('gradient-cold');
            $('#warp-title').addClass('gradient-hot');

            $('#connection-stats').css('display', 'block');

            button.removeClass('gradient-cold');
            button.addClass('gradient-hot');

            button.text('Turn off WARP');

            button.attr('enabled', 'true');
        }
    });

    $('.comet').on('click', () => ipcRenderer.invoke('show-about'));

    $('#turn-warp').on('click', async () => {
        if ($('#turn-warp').attr('enabled') == 'false')
        {
            if (await Warp.isServiceActive())
                Warp.connect().catch((error) => alert(error));

            else shell_exec('systemctl start warp-svc.service');
        }

        else Warp.disconnect().catch((error) => alert(error));
    });
});
