var express = require('express');
var app = express();
var request = require('request');

var username = process.env.SENDGRID_USERNAME;
var password = process.env.SENDGRID_PASSWORD;

function addList(listName, columnName, callback) {
    request({
        url: 'https://api.sendgrid.com/api/newsletter/lists/add.json',
        method: 'POST',
        form: {
            'api_user': username,
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
                console.log('Sendgrid: Successfully added list:' + listName);
            }
            else {
                console.log('Sendgrid: Could not add list: ' + listName);
            }
            return callback(null, body);
        }
    });
}

function deleteList(listName, callback) {
    request({
        url: 'https://api.sendgrid.com/api/newsletter/lists/delete.json',
        method: 'POST',
        form: {
            'api_user': username,
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
                console.log('Sendgrid: Successfully deleted list: ' + listName);
            }
            else {
                console.log('Sendgrid: Could not delete list: ' + listName);
            }
            return callback(null, body);
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
            'api_user': username,
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
                console.log('Sendgrid: Successfully added ' + email + ' to list ' + listName);
            }
            else if (body == '{"inserted": 0}') {
                console.log('Sendgrid: ' + email + ' already in list ' + listName, "or invalid");
            }
            else {
                console.log(body);
                console.log('Sendgrid: ' + listName + ' does not exist');
            }
            return callback(null, body);
        }
    });
};

function deleteEmail(listName, email, callback) {
    request({
        url: 'https://api.sendgrid.com/api/newsletter/lists/email/delete.json',
        method: 'POST',
        form: {
            'api_user': username,
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
                console.log('Sendgrid: Successfully deleted ' + email + ' from list ' + listName);
            }
            else if (body == '{"removed": 0}') {
                console.log('Sendgrid: ' + email + ' not in list ' + listName);
            }
            else {
                console.log('Sendgrid: ' + listName + ' does not exist');
            }
            return callback(null, body);
        }
    });
};

function listEmails(listName, callback) {
    request({
        url: 'https://api.sendgrid.com/api/newsletter/lists/email/get.json' + 
        '?list=' + listName + 
        '&api_user=' + username + 
        '&api_key=' + password,
        method: 'GET',
    }, function (err, httpResponse, body) {
        if (err) {
            console.log(err);
            return callback(err, null);
        }
        else {
            if (body.search(listName) == -1) {
                console.log('Sendgrid: Got emails in list ' + listName);
            }
            else {
                console.log('Sendgrid: Could not get emails in list ' + listName);
            }
            return callback(null, body);
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
