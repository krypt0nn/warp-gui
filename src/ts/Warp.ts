declare const Neutralino;

type WarpStatistics =
{
    sent: {
        raw: string;
        bytes: number;
        formatted: string;
    };
    received: {
        raw: string;
        bytes: number;
        formatted: string;
    };
    latency: number;
    loss: number;
};

export default class Warp
{
    /**
     * Get warp-cli version
     */
    public static get version(): Promise<string>
    {
        return new Promise((resolve) => {
            Neutralino.os.execCommand('warp-cli --version')
                .then((output) => resolve(output.stdOut));
        });
    }

    /**
     * warp-svc service controller
     */
    public static readonly service = new class
    {
        /**
         * Is warp-svc service running
         */
        public get active(): Promise<boolean>
        {
            return new Promise((resolve) => {
                Neutralino.os.execCommand('systemctl status warp-svc.service | grep Active:')
                    .then((output) => resolve(!output.stdOut.includes('inactive')));
            });
        }

        /**
         * Start warp-svc service
         */
        public start(): Promise<boolean>
        {
            return new Promise((resolve) => {
                Neutralino.os.execCommand('systemctl start warp-svc')
                    .then((output) => resolve(!output.stdErr));
            });
        }

        /**
         * Stop warp-svc service
         */
        public stop(): Promise<boolean>
        {
            return new Promise((resolve) => {
                Neutralino.os.execCommand('systemctl stop warp-svc')
                    .then((output) => resolve(!output.stdErr));
            });
        }
    }

    /**
     * Get current warp connection status
     */
    public static get status(): Promise<'connected' | 'disconnected' | 'service-unavailable'>
    {
        return new Promise((resolve) => {
            Neutralino.os.execCommand('warp-cli status')
                .then((output) => {
                    if (output.stdErr)
                        resolve('service-unavailable');

                    else resolve(output.stdOut.includes('Disconnected') ? 'disconnected' : 'connected');
                });
        });
    }

    /**
     * Connect to warp
     */
    public static connect(): Promise<boolean>
    {
        return new Promise((resolve) => {
            Neutralino.os.execCommand('warp-cli connect')
                .then((output) => resolve(!output.stdErr));
        });
    }

    /**
     * Disconnect from warp
     */
    public static disconnect(): Promise<boolean>
    {
        return new Promise((resolve) => {
            Neutralino.os.execCommand('warp-cli disconnect')
                .then((output) => resolve(!output.stdErr));
        });
    }

    /**
     * Get warp statistics
     * 
     * @returns null if warp-cli is not running
     */
    public static get stats(): Promise<WarpStatistics|null>
    {
        return new Promise(async (resolve) => {
            const output = await Neutralino.os.execCommand('warp-cli warp-stats');

            // warp-cli is not running
            if (output.stdErr)
                resolve(null);

            else
            {
                const lines: string[] = output.stdOut.split(/\r\n|\r|\n/);
                
                const bandwith = lines[2].split('; ');
                const sent = bandwith[0].substring(6);
                const received = bandwith[1].substring(10);

                const sentSize = sent.substring(0, sent.length - 2);
                const receivedSize = received.substring(0, received.length - 2);

                const sentComplexity = sent.substring(sent.length - 2).toUpperCase();
                const receivedComplexity = received.substring(received.length - 2).toUpperCase();

                resolve({
                    sent: {
                        raw: sent,

                        // @ts-expect-error
                        bytes: this.convertToBytes(sentSize, sentComplexity),

                        formatted: `${sentSize} ${sentComplexity}`
                    },
                    received: {
                        raw: received,

                        // @ts-expect-error
                        bytes: this.convertToBytes(receivedSize, receivedComplexity),

                        formatted: `${receivedSize} ${receivedComplexity}`
                    },
                    latency: parseInt(lines[3].substring(19, lines[3].length - 2)),
                    loss: parseFloat(lines[4].substring(16, lines[4].length - 2))
                });
            }
        });
    }

    /**
     * Convert MB, GB and etc. to the bytes
     */
    protected static convertToBytes(num: number, complexity: string): number
    {
        const complexities = ['KB', 'MB', 'GB', 'TB'];

        if (!complexities.includes(complexity))
            return num;

        for (let i = 0; i < complexities.length; ++i)
            if (complexities[i] != complexity)
                num *= 1024;

            else break;

        return num * 1024;
    }
};

export type { WarpStatistics };
