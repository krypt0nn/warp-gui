const { exec } = require('child_process');

type OutputProcessor = (output: string, type: 'stdout' | 'stderr' | 'error') => void;

export function shell_exec (command: string, stdoutProcessor?: OutputProcessor, stderrProcessor?: OutputProcessor, errorProcessor?: OutputProcessor): void
{
    exec(command, (err: any, stdout: string, stderr: string) => {
        if (err)
        {
            if (errorProcessor)
                errorProcessor(err.message.trim(), 'error');

            else if (stderrProcessor)
                stderrProcessor(err.message.trim(), 'error');

            else if (stdoutProcessor)
                stdoutProcessor(err.message.trim(), 'error');
        }

        else if (stderr)
        {
            if (stderrProcessor)
                stderrProcessor(stderr.trim(), 'stderr');

            else if (stdoutProcessor)
                stdoutProcessor(stderr.trim(), 'stderr');
        }

        else if (stdoutProcessor)
            stdoutProcessor(stdout.trim(), 'stdout');
    });
}