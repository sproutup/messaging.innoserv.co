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
        if(recErr) {
            setTimeout(pullFromQueue, 300000);
        }
        // Perform function with message, delete if done with message
        else if (recRes.Messages) {
            var message = recRes.Messages[0];
            performAction(message, function(err, res) {
                if (err) {
                    // Unsuccessful sendgrid call, not deleting message
                }
                else {
                    deleteFromQueue(message.ReceiptHandle);
                }
                setTimeout(pullFromQueue, 0);
            });
        }
        else {
            //Unsuccessful receive call or nothing to receive
            setTimeout(pullFromQueue, 300000);
        }
    });
}


function performAction(message, sendgridCallback) {
    var badMessage = JSON.stringify({
        methodName: 'invalid'
    });
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
            else {
                message.Body = badMessage;
                performAction(message, sendgridCallback);
            }
            break;
        case 'addEmail':
            if (typeof param3 !== 'undefined') {
                sendgrid.addEmail(param1, param2, param3, sendgridCallback);
            }
            else {
                message.Body = badMessage;
                performAction(message, sendgridCallback);
            }
            break;
        case 'deleteEmail':
            if (typeof param2 !== 'undefined') {
                sendgrid.deleteEmail(param1, param2, sendgridCallback);
            }
            else {
                message.Body = badMessage;
                performAction(message, sendgridCallback);
            }
            break;
        case 'listEmails':
            if (typeof param1 !== 'undefined') {
                sendgrid.listEmails(param1, sendgridCallback);
            }
            else {
                message.Body = badMessage;
                performAction(message, sendgridCallback);
            }
            break;
        case 'deleteList':
            if (typeof param1 !== 'undefined') {
                sendgrid.deleteList(param1, sendgridCallback);
            }
            else {
                message.Body = badMessage;
                performAction(message, sendgridCallback);
            }
            break;
        case 'verifyAll':
            if (typeof param2 !== 'undefined') {
                verifyAll(param1, param2, sendgridCallback);
            }
            else {
                message.Body = badMessage;
                performAction(message, sendgridCallback);
            }
            break;
        default:
            //Incorrectly formatted message
            //Deleting bad message
            deleteFromQueue(message.ReceiptHandle);
    }
}

function verifyAll(listName, users, actionCallback) {
    sendgrid.listEmails(listName, function(err, res) {
        if (res.search(listName) == -1) {
            var cLst = JSON.parse(res);
            var uLst = JSON.parse(users);
            uLst = uLst.sort(function(a, b) { return (a["email"] > b["email"]) ? 1 : ((a["email"] < b["email"]) ? -1 : 0); });
            cLst = cLst.sort(function(a, b) { return (a["email"] > b["email"]) ? 1 : ((a["email"] < b["email"]) ? -1 : 0); });
            var cI = 0;
            var uI = 0;
            while (uI < uLst.length || cI < cLst.length) {
                if (typeof cLst[cI] === 'undefined' || (typeof uLst[uI] !== 'undefined' && uLst[uI].email < cLst[cI].email)) {
                    if (uLst[uI].active === true) {
                        pushToQueue('addEmail', listName, uLst[uI].email, uLst[uI].name, function (err, res) {});
                    }
                    uI++;
                }
                else if (typeof uLst[uI] === 'undefined' || typeof uLst[uI].emails === 'undefined' || (typeof cLst[cI] !== 'undefined' && uLst[uI].email > cLst[cI].email)) {
                    if (typeof uLst[uI] === 'undefined' || uLst[uI].active === true) {
                        pushToQueue('deleteEmail', listName, cLst[cI].email, null, function (err, res) {});
                    }
                    cI++;
                }
                else {
                    if (uLst[uI].active === false) {
                        pushToQueue('deleteEmail', listName, uLst[uI].email, null, function (err, res) {});
                    }
                    cI++;
                    uI++;
                }
            }
            actionCallback(null, "Verified");
        }
        actionCallback("Could not get list, verify", null);
    });
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


var server = app.listen(3002, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('SQS/Sendgrid server listening at http://%s:%s', host, port);
});
