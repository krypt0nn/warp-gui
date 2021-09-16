"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shell_exec = void 0;
const { exec } = require('child_process');
function shell_exec(command, stdoutProcessor, stderrProcessor, errorProcessor) {
    exec(command, (err, stdout, stderr) => {
        if (err) {
            if (errorProcessor)
                errorProcessor(err.message.trim(), 'error');
            else if (stderrProcessor)
                stderrProcessor(err.message.trim(), 'error');
            else if (stdoutProcessor)
                stdoutProcessor(err.message.trim(), 'error');
        }
        else if (stderr) {
            if (stderrProcessor)
                stderrProcessor(stderr.trim(), 'stderr');
            else if (stdoutProcessor)
                stdoutProcessor(stderr.trim(), 'stderr');
        }
        else if (stdoutProcessor)
            stdoutProcessor(stdout.trim(), 'stdout');
    });
}
exports.shell_exec = shell_exec;
