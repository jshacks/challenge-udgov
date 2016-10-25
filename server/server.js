// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express     = require('express');               // call express
var app         = express();                        // define our app using express
var bodyParser  = require('body-parser');
var cors        = require('cors');

var fs          = require('fs');

app.use(cors());

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port        = process.env.PORT || 8080;         // set our port

// ROUTES FOR OUR API
// =============================================================================
app.use('/api', require('./api/routes.js'));

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
