<script lang="ts">
    import { Windows, Notification, Tray, path, dir } from '@empathize/framework';

    import { onMount } from 'svelte';

    import CometHot from './assets/images/comet-hot.png';
    import CometCold from './assets/images/comet-cold.png';
    import Arrow from './assets/images/arrow.png';

    import type { WarpStatistics } from './ts/Warp';
    import Warp from './ts/Warp';

    let status: 'service-unavailable' | 'disconnected' | 'connected' = 'service-unavailable';
    let stats: WarpStatistics|null = null;

    const connectWarp = async () => {
        // Try to start warp-svc service if it is not started
        if (status === 'service-unavailable')
        {
            if (!await Warp.service.start())
            {
                Notification.show({
                    title: 'Cloudflare WARP',
                    body: 'Something went wrong during warp-svc service starting',
                    icon: path.join(dir.cwd, 'public', 'icons', 'warp.png')
                });

                return;
            }

            else status = await Warp.status;
        }

        // Try to connect to warp
        if (!await Warp.connect())
        {
            Notification.show({
                title: 'Cloudflare WARP',
                body: 'Something went wrong during connection to warp',
                icon: path.join(dir.cwd, 'public', 'icons', 'warp.png')
            });

            return;
        }

        status = await Warp.status;
    };

    const disconnectWarp = () => {
        Warp.disconnect().then(async (result) => {
            if (result)
                status = await Warp.status;

            else
            {
                Notification.show({
                    title: 'Cloudflare WARP',
                    body: 'Something went wrong during disconnecting from the warp',
                    icon: path.join(dir.cwd, 'public', 'icons', 'warp.png')
                });
            }
        });
    };

    const tray = new Tray(path.join('/public', 'icons', 'warp.png'));

    const updateStats = async () => {
        stats = await Warp.stats;

        // const isWindowVisible = await Windows.current.isVisible();

        tray.update([
            { text: `Sent: ${stats.sent.formatted}`, disabled: true },
            { text: `Received: ${stats.received.formatted}`, disabled: true },

            // Connect / Disconnect
            status === 'connected' ?
                { text: 'Disconnect', click: disconnectWarp } :
                { text: 'Connect', click: connectWarp },

            // Show / Hide
            /*isWindowVisible ?
                { text: 'Hide', click: () => Windows.current.hide() } :
                { text: 'Show', click: () => Windows.current.show() },*/

            { text: 'Close', click: () => {
                // @ts-expect-error
                Neutralino.app.exit();
            } }
        ]);

        setTimeout(updateStats, 2000);
    };

    updateStats();

    // @ts-expect-error
    Neutralino.events.on('windowClose', () => {
        // Windows.current.hide();

        // @ts-expect-error
        Neutralino.app.exit();
    });

    onMount(async () => {
        status = await Warp.status;

        Windows.current.show();
    });

    // Update app theme
    document.body.setAttribute('data-theme', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
</script>

<main>
    <img class="comet" src={status === 'connected' ? CometHot : CometCold} alt="" />

    <h1 class={status === 'connected' ? 'gradient-hot' : 'gradient-cold'}>
        WARP
    </h1>

    {#if status === 'connected'}
        <button class="button gradient-hot" on:click={disconnectWarp}>Turn off WARP</button>
    {:else}
        <button class="button gradient-cold" on:click={connectWarp}>Turn on WARP</button>
    {/if}

    <footer>
        {#await Warp.version then version}
            <div style="margin-left: 16px">{version}</div>
        {/await}

        {#if stats !== null}
            <div class="bandwith">
                <div>
                    <span>{stats.received.formatted}</span>

                    <img src={Arrow} alt="" />
                </div>

                <div>
                    <span>{stats.sent.formatted}</span>
                    
                    <img src={Arrow} alt="" style="transform: rotate(180deg)" />
                </div>
            </div>
        {/if}
    </footer>
</main>
