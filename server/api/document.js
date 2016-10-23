function parseCSV(file) {}
function parseXLS(file) {}
function parseXML(file) {}

function formatData(data) {}

this.getData = function (req, res) {
    "use strict";

    var _id = req.params.id;
    var _fileType = req.query.format.toUpperCase();
    var _fileURI = req.query.url;

    switch(_fileType) {
        case 'CSV':
            return parseCSV(_fileURI);
        case 'XLS':
        case 'XLSX':
            return parseXLS(_fileURI);
        case 'XML':
            return parseXML(_fileURI);
        default:
            break;
    }

    formatData();

    res.send("some data from " + req.params.id);
};
module.exports = this;