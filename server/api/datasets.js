var request = require('request');

this.getList = function (req, res) {
    "use strict";

    var _options = {
        url: 'http://www.data.gov.ro/api/action/package_search?start=' + req.query.offset + '&rows=20',
        json: true,
        headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36'}
    };

    request.get(_options, function (error, response, data) {
        res.send(data.result);
    });
};

module.exports = this;
