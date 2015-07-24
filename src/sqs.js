var express = require('express');
var app = express();
var aws = require('aws-sdk');

aws.config.update({accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY});
var sqs = new aws.SQS({region: process.env.AWS_SQS_REGION});
var queueName = {
    QueueName: process.env.AWS_QUEUE_NAME
};
var sqsUrl;


function initializeSQS(callback) {
    sqs.createQueue(queueName, function(err, res) {
        if(err) {
            console.log(err);
            callback(err, null);
        }
        else {
            sqsUrl = res.QueueUrl;
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
        else {
            return callback(null, res);
        }
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
        else {
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
                return callback(null, res);
            }
        });
}


module.exports ={
    initializeSQS: initializeSQS,
    pushSQS: pushSQS,
    pullSQS: pullSQS,
    deleteSQS: deleteSQS
};
