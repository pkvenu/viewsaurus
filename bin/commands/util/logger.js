var util = require('util');

function log(args, fn, color) {
    var str = util.format.apply(this, args);
    return fn.call(this, str[color]);
}

exports.success = function() {
    return log(arguments, console.log, 'green');
};

exports.warn = function() {
    return log(arguments, console.log, 'yellow');
};

exports.error = function() {
    if (typeof arguments[0] === 'String')
        return log(arguments, console.error, 'red');

    // Else assume we've got an error object
    var err = arguments[0];
    console.error(err.stack.red);
};