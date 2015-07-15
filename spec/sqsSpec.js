var request = require('request');

describe('SQS Server', function() {
    var Sqs = require('../src/sqs');
    var sqs;

    var queueUrl = 'https://sqs.us-east-1.amazonaws.com/772918356582/testSQS';

    var base_url = 'http://localhost:4000/';
    var initialization_url = base_url + 'initialize';
    var push_base_url = base_url + 'push/';
    var pull_url = base_url + 'pull';
    var delete_base_url = base_url + 'delete/';

    var testMessage1 = 'validMessage';
    var testMessage2 = 'goodMessage';
    var testMessage3 = 'vtMessage';
    
    var push_1_url = push_base_url + testMessage1;
    var push_2_url = push_base_url + testMessage2;
    var push_3_url = push_base_url + testMessage3;
    
    var pull_vt0_url = pull_url + '?vt=0';
    
    describe("GET /", function() {
        
        it("returns status code 200", function(done) {
            request.get(base_url, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
        });

        it("returns sqs server", function(done) {
            request.get(base_url, function(error, response, body) {
                expect(body).toBe("SQS Server");
                done();
            });
        });
    });
    
    describe("Ensure initialization", function() {
        
        it("returns status code 200, queueUrl present", function(done) {
            request.get(initialization_url, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                expect((JSON.parse(body)).QueueUrl).not.toBe(undefined);
                done();
            });
        });
    });
    
    describe("Message test", function() {
        
        var messageId1;
        var messageId2;
        var receiptHandle1;
        var receiptHandle2;
        
        it("push empty message status code != 200", function(done) {
            request.get(push_base_url, function(error, response, body) {
                expect(response.statusCode).not.toBe(200);
                done();
            });
        });
        
        it("push message1 status code == 200", function(done) {
            request.get(push_1_url, function(error, response, body) {
                messageId1 = (JSON.parse(body)).MessageId;
                expect(response.statusCode).toBe(200);
                expect(body).not.toBe('null');
                done();
            });
        });
        
        it("push message1 body: messageId exists, new", function (done) {
            request.get(push_1_url, function(error, response, body) {
                messageId2 = (JSON.parse(body)).MessageId;
                expect(messageId2).not.toBe(undefined);
                expect(messageId2).not.toBe(messageId1);
                done();
            });
        });
        
        it("pull: status code is 200", function(done) {
            request.get(pull_url, function(error, response, body) {
                var jsonBody = JSON.parse(body);
                if (typeof jsonBody.Messages !== 'undefined') {
                    receiptHandle1 = jsonBody.Messages[0].ReceiptHandle;
                }
                expect(response.statusCode).toBe(200);
                expect(body).not.toBe('null');
                done();
            });
        });
        
        it("pull body: message shows message1", function(done) {
            request.get(pull_url, function(error, response, body) {
                var jsonBody = JSON.parse(body);
                expect(jsonBody.Messages).not.toBe(undefined);
                if (typeof jsonBody.Messages !== 'undefined') {
                    expect(jsonBody.Messages[0].Body).toBe(testMessage1);
                    receiptHandle2 = jsonBody.Messages[0].ReceiptHandle;
                }
                done();
            });
        });
        
        it("delete past two messages, status code = 200, no err", function(done) {
            var deleteUrl1 = delete_base_url + encodeURIComponent(receiptHandle1);
            var deleteUrl2 = delete_base_url + encodeURIComponent(receiptHandle2);
            
            request.get(deleteUrl1, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                expect(body).not.toBe('null');
                
                request.get(deleteUrl2, function(error, response, body) {
                    expect(response.statusCode).toBe(200);
                    expect(body).not.toBe('null');
                    done();
                });
            });
        });
        
        it("push/pull/delete new message successfully", function(done) {
            request.get(push_2_url, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                expect(body).not.toBe('null');
                
                request.get(pull_url, function(error, response, body) {
                    var deleteUrl;
                    var jsonBody = JSON.parse(body);
                    expect(jsonBody.Messages).not.toBe(undefined);
                    if (typeof jsonBody.Messages !== 'undefined') {
                        expect(jsonBody.Messages[0].Body).toBe(testMessage2);
                        deleteUrl = delete_base_url + encodeURIComponent(jsonBody.Messages[0].ReceiptHandle);
                    }
                    
                    request.get(deleteUrl, function(error, response, body) {
                        expect(response.statusCode).toBe(200);
                        expect(body).not.toBe('null');
                        done();
                    });
                });
            });
        });
        
        it("pulling with visibility timeout", function(done) {
            request.get(push_3_url, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                expect(body).not.toBe('null');
                
                request.get(pull_vt0_url, function(error, response, body) {
                    var messageId;
                    var jsonBody1 = JSON.parse(body);
                    expect(jsonBody1.Messages).not.toBe(undefined);
                    if (typeof jsonBody1.Messages !== 'undefined') {
                        expect(jsonBody1.Messages[0].Body).toBe(testMessage3);
                        messageId = jsonBody1.Messages[0].MessageId;
                    }
                    
                    request.get(pull_url, function(error, response, body) {
                        var deleteUrl;
                        var jsonBody2 = JSON.parse(body);
                        expect(jsonBody2.Messages).not.toBe(undefined);
                        if (typeof jsonBody2.Messages !== 'undefined') {
                            expect(jsonBody2.Messages[0].Body).toBe(testMessage3);
                            expect(jsonBody2.Messages[0].MessageId).toBe(messageId);
                            deleteUrl = delete_base_url + encodeURIComponent(jsonBody2.Messages[0].ReceiptHandle);
                        }

                        request.get(deleteUrl, function(error, response, body) {
                            expect(response.statusCode).toBe(200);
                            expect(body).not.toBe('null');
                            done();
                        });
                    });
                });
            });
        });
        
        it("pull body: no message to pull", function(done) {
            request.get(pull_url, function(error, response, body) {
                expect((JSON.parse(body)).Messages).toBe(undefined);
                done();
            });
        });
    });
});
