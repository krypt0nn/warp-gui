import { shell_exec } from './shell_exec';
import $ from 'cash-dom';

export type WarpStatistics =
{
    sent: string;
    received: string;
    latency: string;
    loss: string;
}

export class Warp
{
    // Get WARP version
    public static async getVersion (): Promise<string>
    {
        return new Promise<string>((resolve, reject) =>
        {
            shell_exec('warp-cli --version', (output: string) => resolve(output), (error: string) => reject(error));
        });
    }

    // Get WARP session statistics
    public static async getStatistics (): Promise<WarpStatistics | string>
    {
        return new Promise((resolve, reject) =>
        {
            /*
                Endpoints: 162.159.192.3, 2606:4700:d0::a29f:c003
                Time since last handshake: 2s
                Sent: 18.3kB; Received: 57.3kB
                Estimated latency: 160ms
                Estimated loss: 0.00%;
            */
            shell_exec('warp-cli warp-stats', (output: string) =>
            {
                let lines = output.split('\n'),
                    bandwith = lines[2].split('; ');

                resolve({
                    sent: bandwith[0].substr(6),
                    received: bandwith[1].substr(10),
                    latency: lines[3].substr(19),
                    loss: lines[4].substr(16, lines[4].length - 17)
                });
            }, (error) => reject(error));
        });
    }

    // Get WARP status
    public static async getStatus (): Promise<boolean | string>
    {
        return new Promise((resolve, reject) =>
        {
            /*
                Success
                Status update: Connected
            */
            shell_exec('warp-cli status', (status: string) => resolve(!(status.substr(-12) == 'Disconnected')), (error) => reject(error));
        });
    }

    // Check if WARP service active
    public static async isServiceActive (): Promise<boolean>
    {
        return new Promise((resolve) =>
        {
            shell_exec('systemctl status warp-svc.service | grep Active:', (status: string) =>
            {
                resolve(!(status.substr(8, 8) == 'inactive'));
            });
        });
    }

    // Connect to the WARP server
    public static async connect (): Promise<boolean | string>
    {
        return new Promise((resolve, reject) =>
        {
            let button = $('#turn-warp');

            // Register WARP account if it is first run
            if (button.attr('first-run') == 'true')
                shell_exec('warp-cli register', () => button.attr('first-run', 'false'));

            // Connect to the WARP server
            shell_exec('warp-cli connect', (status: string) =>
            {
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

                    resolve(true);
                }

                else reject(status);
            });
        });
    }

    // Disconnect from the WARP server
    public static async disconnect (): Promise<true | string>
    {
        return new Promise((resolve, reject) =>
        {
            let button = $('#turn-warp');

            // Disconnect from the WARP server
            shell_exec('warp-cli disconnect', (status: string) =>
            {
                if (status.substr(0, 7) == 'Success')
                {
                    // Update elements design
                    $('#connection-stats-further').css('width', '0');

                    $('#comet-cold').css('display', 'block');
                    $('#comet-hot').css('display', 'none');

                    $('#warp-title').removeClass('gradient-hot');
                    $('#warp-title').addClass('gradient-cold');

                    $('#connection-stats').css('display', 'none');

                    button.removeClass('gradient-hot');
                    button.addClass('gradient-cold');

                    button.text('Turn on WARP');

                    button.attr('enabled', 'false');

                    resolve(true);
                }

                else reject(status);
            });
        });
    }
}