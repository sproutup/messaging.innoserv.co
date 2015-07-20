var express = require('express');
var app = express();
var request = require('request');

var userName = process.env.SENDGRID_USERNAME;
var password = process.env.SENDGRID_PASSWORD;

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
                console.log('Sendgrid: Successful add list call');
                console.log(body);
                return callback(null, body);
            }
            else {
                console.log('Sendgrid: Unsuccessful add list call');
                console.log(body);
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
                console.log('Sendgrid: Successful delete list call');
                console.log(body);
                return callback(null, body);
            }
            else {
                console.log('Sendgrid: Unsuccessful delete list call');
                console.log(body);
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
                console.log('Sendgrid: Successful add call');
                console.log(body);
                return callback(null, body);
            }
            else {
                console.log('Sendgrid: Unsuccessful add call');
                console.log(body);
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
                console.log('Sendgrid: Successful delete call');
                console.log(body);
                return callback(null, body);
            }
            else {
                console.log('Sendgrid: Unsuccessful delete call');
                console.log(body);
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
                console.log('Sendgrid: Successful list call');
                console.log(body);
                return callback(null, body);
            }
            else {
                console.log('Sendgrid: Unsuccessful list call');
                console.log(body);
                return callback(null, body);
            }
        }
    });
};


module.exports = {
    addList: addList,
    addEmail: addEmail,
    listEmails: listEmails,
    deleteEmail: deleteEmail,
    deleteList: deleteList    
};
