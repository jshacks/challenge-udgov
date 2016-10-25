var fs = require('fs');
var http = require('http');
var q = require('q');
var csv = require('csv-parser');
var XLSX = require('node-xlsx');
var parseString = require('xml2js').parseString;
var request = require('request');
var uuid = require('node-uuid');

var downloadFolder = 'server/downloads/';

/**
 * @param {uuid} package_id
 * @param {uuid} resource_id
 * @returns {promise}
 */
function getResource(package_id, resource_id) {
    "use strict";

    console.log('fetching resource metadata from data.gov.ro...');

    var deffered = q.defer();
    // @todo AA: at the moment the resource is not accessible directly by id
    var _options = {
        url: 'http://www.data.gov.ro/api/action/package_search?q=id:' + package_id,
        json: true,
        headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36'}
    };

    request.get(_options, function (error, response, data) {
        if (data.result.results.length == 0) {
            deffered.reject({status: 400, message: 'ERR_PACKAGE_NOT_FOUND'});
        } else if (data.result.results.length > 1) {
            deffered.reject({status: 400, message: 'ERR_TOO_MANY_PACKAGES'});
        } else {
            for (var i = 0; i < data.result.results[0].resources.length; i++) {
                var _resource = data.result.results[0].resources[i];
                if (_resource.id == resource_id) {
                    deffered.resolve(_resource);
                }
            }

            deffered.reject({status: 400, message: 'ERR_RESOURCE_NOT_FOUND'});
        }
    });

    return deffered.promise;
}

/**
 * @param fileName
 * @param fileURI
 * @returns {promise}
 */
function getFile(fileName, fileURI) {
    console.log('downloading file...');
    var deffered = q.defer();

    "use strict";

    var file = fs.createWriteStream(downloadFolder + fileName);
    http.get(fileURI, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            deffered.resolve(downloadFolder + fileName);
        });
    }).on('error', function (err) { // Handle errors

    });

    return deffered.promise;
}

function parseCSV(file) {
    "use strict";

    console.log('parsing csv...');
    var deffered = q.defer();
    var response = [];

    fs.createReadStream(file)
        .pipe(csv())
        .on('data', function (data) {
            var item = {};

            for (var it in data) {
                item[it] = data[it];
            }

            response.push(item);
        })
        .on('end', function () {
            deffered.resolve(response);
        });

    return deffered.promise;
}
function parseXLS(file) {
    "use strict";

    console.log('parsing xls...');
    var deffered = q.defer();
    var workbook = XLSX.parse(file);

    var firstSheet = workbook[0];
    var sheetData = firstSheet.data;
    var lenghFrecvMap = new Map();

    for (var it in sheetData) {
        var lg = sheetData[it].length;

        if (lg > 0) lenghFrecvMap[lg] = lg in lenghFrecvMap ? lenghFrecvMap[lg] + 1 : 1;
    }

    var max = Math.max.apply(null, Object.keys(lenghFrecvMap).map(function (x) {
        return lenghFrecvMap[x]
    }));
    var lenM = Object.keys(lenghFrecvMap).filter(function (x) {
        return lenghFrecvMap[x] == max;
    })[0];

    var table = [];

    for (var it in sheetData) {
        var lg = sheetData[it].length

        if (lg == lenM) table.push(sheetData[it]);
    }

    //Remove empty columns
    var sumCols = Array.apply(null, Array(parseInt(lenM))).map(Number.prototype.valueOf, 0);

    for (var it in table) {
        for (var i = 0; i < table[it].length; i++) {
            var el = table[it][i];

            if (typeof(el) != 'undefined') sumCols[i]++;
        }
    }
    var emptyCols = [];

    for (var it in sumCols) {
        if (sumCols[it] == 0) emptyCols.push(parseInt(it));
    }


    for (var it in table) {
        for (var i in emptyCols) {
            var toRemove = emptyCols[i];
            table[it].splice(toRemove, 1)
        }
    }

    //Parse header
    var headerIndex = [];

    for (var row in table) {
        var isString = true;

        for (var column in table[row]) {
            isString = isString && (typeof(table[row][column]) == 'string')
        }

        isString ? headerIndex.push(parseInt(row)) : null;
    }

    var error = 0;
    var header;

    if (headerIndex.length > 1) {
        error = 1;
    } else {
        header = table[headerIndex[0]];
        table.splice(headerIndex[0], 1)
    }

    var response = [];
    if (error == 0) {
        for (var row in table) {
            var item = {};

            for (var column in table[row]) {
                var key = header[column];
                var value = table[row][column];

                item[key] = value;
            }

            response.push(item);
        }


    } else {
        response = [];
    }

    deffered.resolve(response);

    return deffered.promise;
}
function parseXML(file) {
    "use strict";

    console.log('parsing xml...');
    var deffered = q.defer();

    var fileOutput = fs.readFileSync(file);

    parseString(fileOutput, function (err, result) {
        if (err) {
            console.log(err);
        }

        deffered.resolve(result);
    });

    return deffered.promise;
}

function formatData(id, data) {
    "use strict";

    console.log('formatting data...');
    var deffered = q.defer();

    var result = {
        id: id,
        fields: [],
        data: data
    };

    var target = data[data.length - 1];
    for (var k in target) {
        if (typeof target[k] !== 'function') {
            result.fields.push(
                {
                    name: k,
                    type: typeof target[k]
                });
        }
    }

    deffered.resolve(result);

    return deffered.promise;
}

this.getData = function (req, res) {
    "use strict";

    if (!req.params.package_id) {
        res.status(400).send('ERR_PACKAGE_ID_MISSING');
    }
    if (!req.params.resource_id) {
        res.status(400).send('ERR_RESOURCE_ID_MISSING');
    }

    var _file = null;
    var _fileType = null;

    getResource(req.params.package_id, req.params.resource_id)
        .then(function (document) {
            _fileType = document.format;
            return getFile(uuid.v1(), document.romania_download_url);
        }, function (error) {
            res.status(error.status).send(error.message);
        })
        .then(function(file) {
            _file = file;
            switch (_fileType) {
                case 'CSV':
                    return parseCSV(file);
                case 'XLS':
                case 'XLSX':
                    return parseXLS(file);
                case 'XML':
                    return parseXML(file);
                default:
                    res.status(400).send('ERR_CANNOT_PARSE_FORMAT');
            }
        })
        .then(function (data) {
            return formatData(req.params.resource_id, data);
        })
        .then(function (json) {
            console.log('done.');
            if(fs.existsSync(_file)) { fs.unlinkSync(_file); }
            res.send(json);
        });
};

module.exports = this;
