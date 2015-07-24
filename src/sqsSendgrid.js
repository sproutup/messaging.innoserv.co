var express = require('express');
var app = express();
var sqs = require('./sqs');
var sendgrid = require('./sendgrid');


var lastCallDate = new Date();
var lastCall = 'SQS/Sendgrid Server started up';

app.get('/', function (req, res) {
    res.send('Last call: ' + lastCall + ' at ' + lastCallDate.toString());
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
            lastCall = 'Error in pulling from queue';
            lastCallDate = new Date();
            setTimeout(pullFromQueue, 300000);
        }
        // Perform function with message, delete if done with message
        else if (recRes.Messages) {
            var message = recRes.Messages[0];
            performAction(message, function(err, res) {
                if (err) {
                    lastCall = 'Error in pushing message to Sendgrid';
                    lastCallDate = new Date();
                    // Unsuccessful sendgrid call, not deleting message
                }
                else {
                    lastCall = 'Successfully pushed message to Sendgrid';
                    lastCallDate = new Date();
                    deleteFromQueue(message.ReceiptHandle);
                }
                setTimeout(pullFromQueue, 0);
            });
        }
        else {
            //Unsuccessful receive call or nothing to receive
            lastCall = 'Nothing to pull from queue';
            lastCallDate = new Date();
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
                else if (typeof uLst[uI] === 'undefined' || typeof uLst[uI].email === 'undefined' || (typeof cLst[cI] !== 'undefined' && uLst[uI].email > cLst[cI].email)) {
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
            //setTimeout(deleteFromQueue(receiptHandle), 30000);
        }
        else {
            //Successfully deleted message from queue
        }
    });
}


if (typeof process.env.AWS_ACCESS_KEY_ID === 'undefined') {
    console.log('Missing AWS Access Key');
    return;
}
else if (typeof process.env.AWS_SECRET_ACCESS_KEY === 'undefined') {
    console.log('Missing AWS Secret Access Key');
    return;
}
else if (typeof process.env.AWS_SQS_REGION === 'undefined') {
    console.log('Missing AWS Region');
    return;
}
else if (typeof process.env.AWS_QUEUE_NAME === 'undefined') {
    console.log('Missing AWS Queue Name');
    return;
}
else if (typeof process.env.SENDGRID_USERNAME === 'undefined') {
    console.log('Missing Sendgrid Username');
    return;
}
else if (typeof process.env.SENDGRID_PASSWORD === 'undefined') {
    console.log('Missing Sendgrid Password');
    return;
}
else {
    var server = app.listen(3002, function () {
        var host = server.address().address;
        var port = server.address().port;
        console.log('SQS/Sendgrid server listening at http://%s:%s', host, port);
        sqs.initializeSQS(function(err, result) {
            if (err) {
                return;
            }
            pullFromQueue();
        });
    });
}
