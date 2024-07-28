exports.errorWrapper = fn => (...args) => fn(...args).catch(args[2]);

