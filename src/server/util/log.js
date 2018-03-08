const fs = require('fs');

/**
 * @name Logger
 * @description Logger is a logging utility that contains useful customizable properties.
 */
class Logger {
    async w(prefix, string, cl = null) {
        if(prefix.toString().length > 0 && string.toString().length > 0) { // make sure If the log messages are valid
            const log_message = `[${prefix}] ${new Date().toISOString()}: ${string}`; // make the pre-ready template of log message with adding date and prefix
            try {
                const stream = fs.createWriteStream("./logs/log.txt", {flags: 'a'}); // create stream of specified log file
                await stream.write(log_message + "\n"); // append the log data
                if (cl || cl === null) console.log(log_message); // print console.log If this function called with cl=true or null
                global.socket.emit('log', log_message); // emit the log data to SocketIO channel
                stream.end(); // end of file stream
            } catch (ex) { // catch the occurred error and throw it
                throw `[ERROR] Log message: ${log_message}\nException: ${ex}`
            }
        } else { // catch the occurred error and throw it
            throw ('[ERROR] Prefix or log message is empty.')
        }
    }
}

module.exports = new Logger(); // export the class as a module