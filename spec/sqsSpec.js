var request = require('request');
var nock = require('nock');

describe('SQS Testing', function() {
    var sqs = require('../src/sqs');

    var testMessage1 = 'validMessage';
    var testMessage2 = 'goodMessage';
    var testMessage3 = 'vtMessage';
    
    describe("Ensure initialization", function() {
        
        it("initialize queue, queueUrl present", function(done) {
            sqs.initializeSQS(function(err, res) {
                expect(res.QueueUrl).not.toBe(undefined);
                done();
            });
        });
    });
    
    describe("Message test", function() {
        
        var messageId1;
        var messageId2;
        var receiptHandle1;
        var receiptHandle2;
        
        it("push message1 status causes no errors, grab messageId", function(done) {
            sqs.pushSQS(testMessage1, function(err, res) {
                messageId1 = res.MessageId;
                expect(res).not.toBe('null');
                done();
            });
        });
        
        it("push message1 res: messageId exists, new", function (done) {
            sqs.pushSQS(testMessage1, function(err, res) {
                messageId2 = res.MessageId;
                expect(messageId2).not.toBe(undefined);
                expect(messageId2).not.toBe(messageId1);
                done();
            });
        });
        
        it("pull: no errors, grab receiptHandle", function(done) {
            sqs.pullSQS(undefined, function(err, res) {
                if (typeof res.Messages !== 'undefined') {
                    receiptHandle1 = res.Messages[0].ReceiptHandle;
                }
                expect(res).not.toBe('null');
                done();
            });
        });
        
        it("pull res: message shows message1", function(done) {
            sqs.pullSQS(undefined, function(err, res) {
                expect(res.Messages).not.toBe(undefined);
                if (typeof res.Messages !== 'undefined') {
                    expect(res.Messages[0].Body).toBe(testMessage1);
                    receiptHandle2 = res.Messages[0].ReceiptHandle;
                }
                done();
            });
        });
        
        it("delete past two messages, no err", function(done) {
            
            sqs.deleteSQS(receiptHandle1, function(err, res) {
                expect(res).not.toBe('null');
                
                sqs.deleteSQS(receiptHandle2, function(err, res) {
                    expect(res).not.toBe('null');
                    done();
                });
            });
        });
        
        it("push/pull/delete new message successfully", function(done) {
            sqs.pushSQS(testMessage2, function(err, res) {
                expect(res).not.toBe('null');
                
                sqs.pullSQS(undefined, function(err, res) {
                    var receiptHanlde;
                    expect(res.Messages).not.toBe(undefined);
                    if (typeof res.Messages !== 'undefined') {
                        expect(res.Messages[0].Body).toBe(testMessage2);
                        receiptHandle = res.Messages[0].ReceiptHandle;
                    }
                    
                    sqs.deleteSQS(receiptHandle, function(err, res) {
                        expect(res).not.toBe('null');
                        done();
                    });
                });
            });
        });
        
        it("pulling with visibility timeout", function(done) {
            sqs.pushSQS(testMessage3, function(err, res) {
                expect(res).not.toBe('null');
                
                sqs.pullSQS(0, function(err, res1) {
                    var messageId;
                    expect(res1.Messages).not.toBe(undefined);
                    if (typeof res1.Messages !== 'undefined') {
                        expect(res1.Messages[0].Body).toBe(testMessage3);
                        messageId = res1.Messages[0].MessageId;
                    }
                    
                    sqs.pullSQS(undefined, function(err, res2) {
                        var receiptHandle;
                        expect(res2.Messages).not.toBe(undefined);
                        if (typeof res2.Messages !== 'undefined') {
                            expect(res2.Messages[0].Body).toBe(testMessage3);
                            expect(res2.Messages[0].MessageId).toBe(messageId);
                            receiptHandle = res2.Messages[0].ReceiptHandle;
                        }

                        sqs.deleteSQS(receiptHandle, function(err, res) {
                            expect(res).not.toBe('null');
                            done();
                        });
                    });
                });
            });
        });
        
        it("pull res: no message to pull", function(done) {
            sqs.pullSQS(undefined, function(err, res) {
                expect(res.Messages).toBe(undefined);
                done();
            });
        });
    });
});
