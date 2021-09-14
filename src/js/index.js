const $ = require('../js/cash.min.js');
const { ipcRenderer } = require('electron/renderer');

// Connect to the WARP server
function connect ()
{
    let button = $('#turn-warp');

    // inactive (dead)
    let warpServiceStatus = exec('systemctl status warp-svc.service | grep Active:').substr(13);

    // Run WARP service
    if (warpServiceStatus.substr(0, 8) == 'inactive')
    {
        let status = exec('systemctl start warp-svc.service');

        if (status.substr(0, 48) == 'Command failed: systemctl start warp-svc.service')
        {
            alert(status);

            return;
        }
    }

    // Register WARP account if it is first run
    if (button.attr('first-run') == 'true')
    {
        exec('warp-cli register');

        button.attr('first-run', 'false');
    }

    // Connect to the WARP server
    let status = exec('warp-cli connect');

    if (status.substr(0, 7) == 'Success')
    {
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

    else alert (status);
}

// Disconnect from the WARP server
function disconnect ()
{
    let button = $('#turn-warp');

    // Disconnect from the WARP server
    let status = exec('warp-cli disconnect');

    if (status.substr(0, 7) == 'Success')
    {
        // Update elements design
        $('#comet-cold').css('display', 'block');
        $('#comet-hot').css('display', 'none');

        $('#warp-title').removeClass('gradient-hot');
        $('#warp-title').addClass('gradient-cold');

        $('#connection-stats').css('display', 'none');

        button.removeClass('gradient-hot');
        button.addClass('gradient-cold');

        button.text('Turn on WARP');

        button.attr('enabled', 'false');
    }

    else alert (status);
}

$(() => {
    $('#warp-version').text(exec('warp-cli --version'));

    // Create tray icon
    ipcRenderer.invoke('update-tray', false);

    // Handle disconnect tray button
    ipcRenderer.on('disconnect', (event) => {
        disconnect();

        ipcRenderer.invoke('update-tray', false);
    });

    // Handle connect tray button
    ipcRenderer.on('connect', (event) => {
        connect();

        ipcRenderer.invoke('update-tray', false);
    });

    // Resend show-about request back to the main process
    ipcRenderer.on('show-about-refer', () => ipcRenderer.invoke('show-about'));

    // Resend update-tray request back to the main process
    ipcRenderer.on('update-tray-refer', () => prevStats = -1);

    let prevStats = [null, null, null, null];

    // Add connection stats updater
    setInterval (() => {
        if ($('#turn-warp').attr('enabled') == 'true')
        {
            let warpStats = exec('warp-cli warp-stats | grep Sent:');

            if (warpStats != 'Command failed: warp-cli warp-stats | grep Sent:')
            {
                // 'Sent: 139.1MB; Received: 170.9MB' -> ['Sent: 139.1MB', 'Received: 170.9MB']
                warpStats = warpStats.split('; ');

                let sent = warpStats[0].split(' ')[1],
                    received = warpStats[1].split(' ')[1];

                sent = sent.substr(0, sent.length - 2) + ' ' + sent.substr(-2);
                received = received.substr(0, received.length - 2) + ' ' + received.substr(-2);

                let latency = exec('warp-cli warp-stats | grep latency:').split(' ')[2],
                    loss = exec('warp-cli warp-stats | grep loss:').split(' ')[2];

                loss = loss.substr(0, loss.length - 1);

                // Update tray and bottom menu only if things have changed
                if (sent != prevStats[0] || received != prevStats[1] || latency != prevStats[2] || loss != prevStats[3])
                {
                    $('#sent').text(sent);
                    $('#received').text(received);

                    $('#connection-stats-further').css('width', '160px');
                    $('#connection-stats-further').html(`Sent: ${sent}<br>Received: ${received}<br>Latency: ${latency}<br>Loss: ${loss}`);

                    ipcRenderer.invoke('update-tray', true, sent, received, latency, loss);

                    prevStats = [sent, received, latency, loss];
                }
            }
        }

        else if (prevStats[0] !== null)
        {
            ipcRenderer.invoke('update-tray', false);

            prevStats[0] = null;
        }
    }, 1000);

    let warpStatus = exec('warp-cli status | grep update:');

    // WARP already started
    if (warpStatus.substr(0, 24) == 'Status update: Connected')
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

    $('.comet').on('click', () => ipcRenderer.invoke('show-about'));

    $('#turn-warp').on('click', async () => {
        if (self.attr('enabled') == 'false')
            connect();

        else disconnect();
    });
});