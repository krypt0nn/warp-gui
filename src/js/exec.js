const { execSync } = require("child_process");

function exec (command)
{
    let response;

    try
    {
        response = execSync(command);
    }

    catch (error)
    {
        response = error.message;
    }

    return (typeof response === 'string' ?
        response : String.fromCharCode.apply (null, response)).trim();
}