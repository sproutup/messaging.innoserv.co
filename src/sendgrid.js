var express = require('express');
var app = express();
var request = require('request');
var config = require('../config');

var userName = config.sendgrid.username;
var password = config.sendgrid.password;

app.get('/', function (req, res) {
    res.send('Sendgrid Server');
});

app.get('/addList/:listName/:columnName', function (req, res) {
    addList(req.params.listName, req.params.columnName, function(err, result) {
        res.end(result);
    });
});

app.get('/deleteList/:listName', function (req, res) {
    deleteList(req.params.listName, function(err, result) {
        res.end(result);
    });
});

app.get('/addEmail/:listName/:email/:name', function (req, res) {
    addEmail(req.params.listName, req.params.email, req.params.name, function(err, result) {
        res.end(result);
    });
});

app.get('/deleteEmail/:listName/:email/:name', function (req, res) {
    deleteEmail(req.params.listName, req.params.email, req.params.name, function(err, result) {
        res.end(result);
    });
});

app.get('/listEmails/:listName', function (req, res) {
    listEmails(req.params.listName, function(err, result) {
        res.end(result);
    });
});

function addList(listName, columnName, callback) {
    request({
        url: 'https://api.sendgrid.com/api/newsletter/lists/add.json',
        method: 'POST',
        form: {
            'api_user': userName,
            'api_key': password,
            'list': listName,
            'name': columnName
        }
    }, function (err, httpResponse, body) {
        if (err) {
            console.log(err);
            return callback(err, null);
        }
        else {
            if (body == '{"message": "success"}') {
                console.log('successful add list call');
                return callback(null, body);
            }
            else {
                console.log('unsuccessful add list call');
                return callback(null, body);
            }
        }
    });
}

function deleteList(listName, callback) {
    request({
        url: 'https://api.sendgrid.com/api/newsletter/lists/delete.json',
        method: 'POST',
        form: {
            'api_user': userName,
            'api_key': password,
            'list': listName
        }
    }, function (err, httpResponse, body) {
        if (err) {
            console.log(err);
            return callback(err, null);
        }
        else {
            if (body == '{"message": "success"}') {
                console.log('successful delete list call');
                return callback(null, body);
            }
            else {
                console.log('unsuccessful delete list call');
                return callback(null, body);
            }
        }
    });
}

function addEmail(listName, email, name, callback) {
    var data = {
        'email': email,
        'name': name
    };
    request({
        url: 'https://api.sendgrid.com/api/newsletter/lists/email/add.json',
        method: 'POST',
        form: {
            'api_user': userName,
            'api_key': password,
            'list': listName,
            'data': JSON.stringify(data)
        }
    }, function (err, httpResponse, body) {
        if (err) {
            console.log(err);
            return callback(err, null);
        }
        else {
            if (body == '{"inserted": 1}') {
                console.log('successful add call');
                return callback(null, body);
            }
            else {
                console.log('unsuccessful add call');
                return callback(null, body);
            }
        }
    });
};

function deleteEmail(listName, email, name, callback) {
    request({
        url: 'https://api.sendgrid.com/api/newsletter/lists/email/delete.json',
        method: 'POST',
        form: {
            'api_user': userName,
            'api_key': password,
            'list': listName,
            'email[]': email
        },
        
    }, function (err, httpResponse, body) {
        if (err) {
            console.log(err);
            return callback(err, null);
        }
        else {
            if (body == '{"removed": 1}') {
                console.log('successful delete call');
                return callback(null, body);
            }
            else {
                console.log('unsuccessful delete call');
                return callback(null, body);
            }
        }
    });
};

function listEmails(listName, callback) {
    request({
        url: 'https://api.sendgrid.com/api/newsletter/lists/email/get.json' + 
        '?list=' + listName + 
        '&api_user=' + userName + 
        '&api_key=' + password,
        method: 'GET',
    }, function (err, httpResponse, body) {
        if (err) {
            console.log(err);
            return callback(err, null);
        }
        else {
            if (body.search(listName) == -1) {
                console.log('successful list call');
                return callback(null, body);
            }
            else {
                console.log('unsuccessful list call');
                return callback(null, body);
            }
        }
    });
};

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});
