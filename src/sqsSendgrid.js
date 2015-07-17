var express = require('express');
var app = express();
var sqs = require('./sqs');
var sendgrid = require('./sendgrid');


app.get('/', function (req, res) {
    res.send('SQS/Sendgrid Server');
});

app.get('/initialize', function(req, res) {
    sqs.initializeSQS(function(err, result) {
        pullFromQueue();
        res.send(JSON.stringify(result, null, 3));
    });
});

app.get('/pushToSendgrid', function(req, res) {
    pushToQueue(req.query.method, req.query.p1, req.query.p2, req.query.p3, function(err, result) {
        res.send(JSON.stringify(result, null, 3));
    });
});

function pushToQueue(methodName, param1, param2, param3, callback) {
    var message = {};
    if (typeof methodName !== 'undefined') { 
        message.methodName = methodName;
        if (typeof param1 !== 'undefined') { 
            message.param1 = param1;
            if (typeof param2 !== 'undefined') { 
                message.param2 = param2; 
                if (typeof param3 !== 'undefined') { message.param3 = param3; }
            }
        }
    }
    else { message.methodName = 'noMethod'; }
    sqs.pushSQS(JSON.stringify(message), callback);
};

function pullFromQueue() {
    sqs.pullSQS(undefined, function(recErr, recRes) {
        var timeout = 5000;
        if(recErr) {
            // Could not pull from queue
        }
        // Perform function with message, delete if done with message
        // Deleting any time there is a message currently
        else if (recRes.Messages) {
            var message = recRes.Messages[0];
            checkMethod(message, function(err, res) {
                if (err) {
                    // Unsuccessful sendgrid call, not deleting message
                }
                else {
                    // Successful sendgrid call, deleting message
                    deleteFromQueue(message.ReceiptHandle);
                }
            });
            timeout = 1000;
        }
        else {
            //Unsuccessful receive call/nothing to receive
        }
        
        setTimeout(pullFromQueue, timeout);
    });
}


function checkMethod(message, sendgridCallback) {
    var messageBody = JSON.parse(message.Body);
    var method = messageBody.methodName;
    var param1 = messageBody.param1;
    var param2 = messageBody.param2;
    var param3 = messageBody.param3;
    switch (method) {
        case 'addList':
            if (typeof param2 !== 'undefined') {
                sendgrid.addList(param1, param2, sendgridCallback);
            }
            else { checkMethod('invalid'); }
            break;
        case 'addEmail':
            if (typeof param3 !== 'undefined') {
                sendgrid.addEmail(param1, param2, param3, sendgridCallback);
            }
            else { checkMethod('invalid'); }
            break;
        case 'deleteEmail':
            if (typeof param3 !== 'undefined') {
                sendgrid.deleteEmail(param1, param2, param3, sendgridCallback);
            }
            else { checkMethod('invalid'); }
            break;
        case 'listEmails':
            if (typeof param1 !== 'undefined') {
                sendgrid.listEmails(param1, sendgridCallback);
            }
            else { checkMethod('invalid'); }
            break;
        case 'deleteList':
            if (typeof param1 !== 'undefined') {
                sendgrid.deleteList(param1, sendgridCallback);
            }
            else { checkMethod('invalid'); }
            break;
        default:
            //Incorrectly formatted message
            //Deleting bad message
            deleteFromQueue(message.ReceiptHandle);
    }
}

function deleteFromQueue(receiptHandle) {
    sqs.deleteSQS(receiptHandle, function(err, res) {
        if (err) {
            //Could not successfully delete
            setTimeout(deleteFromQueue(receiptHandle), 5000);
        }
        else {
            //Successfully deleted message from queue
        }
    });
}


var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});
