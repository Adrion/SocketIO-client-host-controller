var fs = require('fs');
var logDir = './logs/';

function Logger(fileName) {
    if (!fs.existsSync(logDir)){
        fs.mkdirSync(logDir);
    }

    this.fileName = fileName;
    this.path = logDir + fileName + '.log';
    fs.appendFileSync(this.path, '\n///////////////////////////////////');
}

Logger.prototype.log = function(entry) {
    var date = new Date();

    // Default console.log
    console.log(entry);

    // Write into file
    fs.appendFileSync(this.path, '\n' + date.toString() + ' -- ' + entry);
};

module.exports = Logger;