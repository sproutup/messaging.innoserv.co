var express = require('express');
var app = express();
var aws = require('aws-sdk');
var request = require('request');
var config = require('../config');

aws.config.update({accessKeyId: config.aws.accessKey, secretAccessKey: config.aws.secretAccessKey});
var sqs = new aws.SQS({region: config.aws.region});
var queueName = {
    QueueName: config.aws.queueName
};
var sqsUrl;

sqs.createQueue(queueName, function(err, res) {
    if(err) {
        console.log(err);
    }
    else {
        sqsUrl = res.QueueUrl;
        console.log('Successfully initialized');
    }
});


app.get('/', function (req, res) {
    res.send('SQS Server');
});

app.get('/initialize', function(req, res) {
    initializeSQS(function(err, result) {
        res.send(JSON.stringify(result, null, 3));
    })
});

app.get('/push/:message', function(req, res) {
    pushSQS(req.params.message, function(err, result) {
        res.send(JSON.stringify(result, null, 3));
    });
});

app.get('/pull', function(req, res) {
    pullSQS(req.query.vt, function(err, result) {
        res.end(JSON.stringify(result, null, 3));
    });
});

app.get('/delete/:receiptHandle', function(req, res) {
    deleteSQS(req.params.receiptHandle, function(err, result) {
        res.end(JSON.stringify(result, null, 3));
    });
});


function initializeSQS(callback) {
    sqs.createQueue(queueName, function(err, res) {
        if(err) {
            console.log(err);
            callback(err, null);
        }
        else {
            sqsUrl = res.QueueUrl;
            console.log('Successful initialization call');
            callback(null, res);
        }
    });
}

function pushSQS(message, callback) {
    var pushOptions = {
        MessageBody: message,
        QueueUrl: sqsUrl
    };
    sqs.sendMessage(pushOptions, function(err, res) {
        if(err) {
            console.log(err);
            return callback(err, null);
        }
        console.log('Successful push call');
        return callback(null, res);
    });
};

function pullSQS(vt, callback) {
    var pullOptions = {
        QueueUrl: sqsUrl
    };
    if (typeof vt !== 'undefined') { pullOptions.VisibilityTimeout = parseInt(vt); }
    sqs.receiveMessage(pullOptions, function(err, res) {
        if(err) {
            console.log(err);
            return callback(err, null);
        }
        else if (res.Messages) {
            console.log('Successful receive call');
            return callback(null, res);
        }
        else {
            console.log('Unsuccessul receive call');
            return callback(null, res);
        }
    });
}

function deleteSQS(receiptHandle, callback) {
    var deleteOptions = {
            QueueUrl: sqsUrl,
            ReceiptHandle: receiptHandle
        };
        sqs.deleteMessage(deleteOptions, function (err, res) {
            if(err) {
                console.log(err);
                return callback(err, null);
            }
            else {
                console.log('Successful delete call');
                return callback(null, res);
            }
        });
}


var server = app.listen(4000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});
