var request = require('request');

var base_url = 'http://localhost:3000/';
var add_base_url = base_url + 'addEmail/';
var delete_base_url = base_url + 'deleteEmail/';
var list_base_url = base_url + 'listEmails/';

var badList = 'invalidListName';
var testList = 'sendgridTest';
var testColumn = 'Name';

var badEmail = 'invalidEmail';
var testEmail1 = 'validEmail@gmail.com';
var testEmail2 = 'goodEmail@gmail.com';

var testName1 = 'Valid Name';
var testName2 = 'Good Name';

describe('Sendgrid Server', function() {
    var Sendgrid = require('../src/sendgrid');
    var sendgrid;

    it("test list made", function(done) {
        addListUrl = base_url + 'addList/' + testList + '/' + testColumn;
        request.get(addListUrl, function(error, response, body) {
            expect(body).toBe('{"message": "success"}');
            done();
        });
    });
    
    describe("GET /", function() {
        
        it("returns status code 200", function(done) {
            request.get(base_url, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
        });

        it("returns sendgrid server", function(done) {
            request.get(base_url, function(error, response, body) {
                expect(body).toBe("Sendgrid Server");
                done();
            });
        });
    });
    
    
    describe("GET /addEmail/.../.../...", function() {

        var good_url = add_base_url + testList + '/' + testEmail1 + '/' + testName1;
        var goodDuplicateEmail_url = add_base_url + testList + '/' + testEmail1 + '/' + testName2;
        var goodDuplicateName_url = add_base_url + testList + '/' + testEmail2 + '/' + testName1;

        var badList_url = add_base_url + badList + '/' + testEmail1 + '/' + testName1;
        var noList_url = add_base_url + testEmail1 + '/' + testName1;
        var badEmail_url = add_base_url + testList + '/' + badEmail + '/' + testName1;
        var noEmail_url = add_base_url + testList + '/' + testName1;
        var noName_url = add_base_url + testList + '/' + testEmail1;
        
        it("missing list status code != 200", function(done) {
            request.get(noList_url, function(error, response, body) {
                expect(response.statusCode).not.toBe(200);
                done();
            });
        });
        it("missing email status code != 200", function(done) {
            request.get(noEmail_url, function(error, response, body) {
                expect(response.statusCode).not.toBe(200);
                done();
            });
        });
        it("missing name status code != 200", function(done) {
            request.get(noName_url, function(error, response, body) {
                expect(response.statusCode).not.toBe(200);
                done();
            });
        });
        
        it("invalid listName status code == 200", function(done) {
            request.get(badList_url, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
        });
        it("invalid email status code == 200", function(done) {
            request.get(badEmail_url, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
        });
        it("valid request status code == 200", function(done) {
            request.get(good_url, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
        });
        
        it("invalid listName body shows error", function(done) {
            request.get(badList_url, function(error, response, body) {
                expect(body).toBe('{"error": "' + badList + ' does not exist"}');
                done();
            });
        });
        it("invalid email body shows unsuccessful add", function(done) {
            request.get(badEmail_url, function(error, response, body) {
                expect(body).toBe('{"inserted": 0}');
                done();
            });
        });
        it("duplicate call: body shows unsuccessful add", function(done) {
            request.get(good_url, function(error, response, body) {
                expect(body).toBe('{"inserted": 0}');
                done();
            });
        });
        it("duplicate email, valid call: body shows unsuccessful add", function(done) {
            request.get(goodDuplicateEmail_url, function(error, response, body) {
                expect(body).toBe('{"inserted": 0}');
                done();
            });
        });
        it("different email, valid call: body shows successful add", function(done) {
            request.get(goodDuplicateName_url, function(error, response, body) {
                expect(body).toBe('{"inserted": 1}');
                done();
            });
        });
    });
    
    
    describe("GET /deleteEmail/.../.../...", function() {

        var good_url = delete_base_url + testList + '/' + testEmail1 + '/' + testName1;
        var goodDuplicateEmail_url = delete_base_url + testList + '/' + testEmail1 + '/' + testName2;
        var goodDuplicateName_url = delete_base_url + testList + '/' + testEmail2 + '/' + testName1;

        var badList_url = delete_base_url + badList + '/' + testEmail1 + '/' + testName1;
        var noList_url = delete_base_url + testEmail1 + '/' + testName1;
        var badEmail_url = delete_base_url + testList + '/' + badEmail + '/' + testName1;
        var noEmail_url = delete_base_url + testList + '/' + testName1;
        var noName_url = delete_base_url + testList + '/' + testEmail1;
        
        it("missing list: status code != 200", function(done) {
            request.get(noList_url, function(error, response, body) {
                expect(response.statusCode).not.toBe(200);
                done();
            });
        });
        it("missing email: status code != 200", function(done) {
            request.get(noEmail_url, function(error, response, body) {
                expect(response.statusCode).not.toBe(200);
                done();
            });
        });
        it("missing name: status code != 200", function(done) {
            request.get(noName_url, function(error, response, body) {
                expect(response.statusCode).not.toBe(200);
                done();
            });
        });
        
        it("invalid listName: status code == 200", function(done) {
            request.get(badList_url, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
        });
        it("invalid email: status code == 200", function(done) {
            request.get(badEmail_url, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
        });
        it("valid request: status code == 200", function(done) {
            request.get(good_url, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
        });
        
        it("invalid listName: body shows error", function(done) {
            request.get(badList_url, function(error, response, body) {
                expect(body).toBe('{"error": "' + badList + ' does not exist"}');
                done();
            });
        });
        it("invalid email: body shows unsuccessful remove", function(done) {
            request.get(badEmail_url, function(error, response, body) {
                expect(body).toBe('{"removed": 0}');
                done();
            });
        });
        it("nonexistent email, valid call: body shows unsuccessful remove", function(done) {
            request.get(good_url, function(error, response, body) {
                expect(body).toBe('{"removed": 0}');
                done();
            });
        });
        it("existing email, valid call: body shows successful remove", function(done) {
            request.get(goodDuplicateName_url, function(error, response, body) {
                expect(body).toBe('{"removed": 1}');
                done();
            });
        });
    });
    
    
describe("GET /listEmails/...", function() {
        
        // Assumes nothing is in list currently

        var good_url = list_base_url + testList;

        var badList_url = list_base_url + badList;
        var noList_url = list_base_url;
        
        var addUrl1 = add_base_url + testList + '/' + testEmail1 + '/' + testName1;
        var addUrl2 = add_base_url + testList + '/' + testEmail2 + '/' + testName1;
        var deleteUrl1 = delete_base_url + testList + '/' + testEmail1 + '/' + testName1;
        var deleteUrl2 = delete_base_url + testList + '/' + testEmail2 + '/' + testName1;
        
        var badCallResult = '{"traceback": "\'Traceback (most recent call last)' 
            + ':\\\\nFailure: exceptions.ValueError: ' + badList + ' does not exist' 
            + '\\\\n\'", "error": "' + badList + ' does not exist"}';
        var goodCallResult1 = '[{"email": "' + testEmail1 + '", "name": "' + testName1 + '"}]';
        var goodCallResult2 = '[{"email": "' + testEmail2 + '", "name": "' + testName1 + '"}]';
        var goodCallResult12 = '[{"email": "' + testEmail1 + '", "name": "' + testName1 + '"},' 
            + '{"email": "' + testEmail2 + '", "name": "' + testName1 + '"}]';
        
        it("missing list: status code != 200", function(done) {
            request.get(noList_url, function(error, response, body) {
                expect(response.statusCode).not.toBe(200);
                done();
            });
        });
        
        it("invalid listName: status code == 200", function(done) {
            request.get(badList_url, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
        });
        it("valid request: status code == 200", function(done) {
            request.get(good_url, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
        });
        
        it("invalid listName: body shows error", function(done) {
            request.get(badList_url, function(error, response, body) {
                expect(body).toBe(badCallResult);
                done();
            });
        });
        it("valid call: body shows empty array", function(done) {
            request.get(good_url, function(error, response, body) {
                expect(body).toBe('[]');
                done();
            });
        });
        
        it("added one, valid call: body shows one element in array", function (done) {
            request.get(addUrl1, function(error, response, body) {
                expect(body).toBe('{"inserted": 1}');
                request.get(good_url, function(error, response, body) {
                    expect(body).toBe(goodCallResult1);
                    done();
                });
            });
        });
        it("added second, valid call: body shows two elements in array", function (done) {
            request.get(addUrl2, function(error, response, body) {
                expect(body).toBe('{"inserted": 1}');
                request.get(good_url, function(error, response, body) {
                    expect(body).toBe(goodCallResult12);
                    done();
                });
            });
        });
        it("removed first, valid call: body shows one element in array", function(done) {
            request.get(deleteUrl1, function(error, response, body) {
                expect(body).toBe('{"removed": 1}');
                request.get(good_url, function(error, response, body) {
                    expect(body).toBe(goodCallResult2);
                    done();
                });
            });
        });
        it("removed second, valid call: body shows no elements in array", function(done) {
            request.get(deleteUrl2, function(error, response, body) {
                expect(body).toBe('{"removed": 1}');
                request.get(good_url, function(error, response, body) {
                    expect(body).toBe('[]');
                    done();
                });
            });
        });
    });

    it("test list deleted", function(done) {
        deleteListUrl = base_url + 'deleteList/' + testList;
        request.get(deleteListUrl, function(error, response, body) {
            expect(body).toBe('{"message": "success"}');
            done();
        });
    });
});
