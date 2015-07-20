var request = require('request');
var nock = require('nock');

describe('Sendgrid Testing', function() {
    var sendgrid = require('../src/sendgrid');

    var sendgridUsername = 'testUsername';
    var sendgridPassword = 'testPassword';
    
    var sendgrid_base_url = 'https://api.sendgrid.com';
    var sendgrid_addList_url = '/api/newsletter/lists/add.json';
    var sendgrid_deleteList_url = '/api/newsletter/lists/delete.json';
    var sendgrid_addEmail_url = '/api/newsletter/lists/email/add.json';
    var sendgrid_deleteEmail_url = '/api/newsletter/lists/email/delete.json';
    var sendgrid_listEmails_url = '/api/newsletter/lists/email/get.json';

    var badList = 'invalidListName';
    var testList = 'sendgridTest';
    var testColumn = 'Name';

    var badEmail = 'invalidEmail';
    var testEmail1 = 'validEmail@gmail.com';
    var testEmail2 = 'goodEmail@gmail.com';

    var testName1 = 'Valid Name';
    var testName2 = 'Good Name';
    
    
    // Long variables used multiple times, using variables declared above
    // Using nock to mock servers with these variables
    var empty_success = 'Sendgrid Server';
    var addDeleteList_success = '{"message": "success"}';
    var add_success = '{"inserted": 1}';
    var add_failed = '{"inserted": 0}';
    var delete_success = '{"removed": 1}';
    var delete_failed = '{"removed": 0}';
    var list_name_error = '{"error": "' + badList + ' does not exist"}';
    var bad_list_call_res = '{"traceback": "\'Traceback (most recent call last)' 
        + ':\\\\nFailure: exceptions.ValueError: ' + badList + ' does not exist' 
        + '\\\\n\'", "error": "' + badList + ' does not exist"}';
    var empty_list_call_res = '[]';
    var good_list_call_res1 = '[{"email": "' + testEmail1 + '", "name": "' + testName1 + '"}]';
    var good_list_call_res2 = '[{"email": "' + testEmail2 + '", "name": "' + testName1 + '"}]';
    var good_list_call_res12 = '[{"email": "' + testEmail1 + '", "name": "' + testName1 + '"},' 
        + '{"email": "' + testEmail2 + '", "name": "' + testName1 + '"}]';
    
    
//    // Setting up nock testing, to be implemented
//    var addListGood = nock(sendgrid_base_url)
//                    .post(sendgrid_addList_url, {
//                        'api_user': sendgridUsername,
//                        'api_key': sendgridPassword,
//                        'list': testList,
//                        'name': testColumn
//                    })
//                    .reply(200, 'Incorrect reply');
//    var addEmailGood1Data = {
//        'email': testEmail1,
//        'name': testName1
//    };
//    var addEmailGood1 = nock(sendgrid_base_url)
//                    .post(sendgrid_addEmail_url, {
//                        'api_user': sendgridUsername,
//                        'api_key': sendgridPassword,
//                        'list': testList,
//                        'data': JSON.stringify(addEmailGood1Data)
//                    })
//                    .once()
//                    .reply(200, add_success);
//    var addEmailBadList = nock(sendgrid_base_url)
//                    .post(sendgrid_addEmail_url, {
//                        'api_user': sendgridUsername,
//                        'api_key': sendgridPassword,
//                        'list': badList,
//                        'data': JSON.stringify(addGoodEmail1Data)
//                    })
//                    .reply(200, list_name_error);
//    var addEmailBadEmailData = {
//        'email': badEmail,
//        'name': testName1
//    };
//    var addEmailBadEmail = nock(sendgrid_base_url)
//                    .post(sendgrid_addEmail_url, {
//                        'api_user': sendgridUsername,
//                        'api_key': sendgridPassword,
//                        'list': testList,
//                        'data': JSON.stringify(addEmailBadEmailData)
//                    })
//                    .reply(200, list_name_error);
//    var addEmailDuplicateEmailData = {
//        'email': testEmail1,
//        'name': testName2
//    };
//    var addEmailDuplicateEmail = nock(sendgrid_base_url)
//                    .post(sendgrid_addEmail_url, {
//                        'api_user': sendgridUsername,
//                        'api_key': sendgridPassword,
//                        'list': testList,
//                        'data': JSON.stringify(addEmailDuplicateEmailData)
//                    })
//                    .reply(200, add_failed);
//    var addEmailDuplicateNameData = {
//        'email': testEmail2,
//        'name': testName1
//    };
//    var addEmailDuplicateName = nock(sendgrid_base_url)
//                    .post(sendgrid_addEmail_url, {
//                        'api_user': sendgridUsername,
//                        'api_key': sendgridPassword,
//                        'list': testList,
//                        'data': JSON.stringify(addEmailDuplicateNameData)
//                    })
//                    .once()
//                    .reply(200, add_success);
//    var deleteGoodList = nock(sendgrid_base_url)
//                    .post(sendgrid_deleteList_url, {
//                        'api_user': sendgridUsername,
//                        'api_key': sendgridPassword,
//                        'list': testList,
//                    })
//                    .reply(200, 'Incorrect reply');
    
    it("test addList", function(done) {
        sendgrid.addList(testList, testColumn, function(err, res) {
            expect(res).toBe(addDeleteList_success);
            done();
        });
    });
    
    
    describe("test addEmail", function() {
        
        it("valid request successful", function(done) {
            sendgrid.addEmail(testList, testEmail1, testName1, function(err, res) {
                expect(res).toBe(add_success);
                done();
            });
        });
        
        it("invalid listName shows error", function(done) {
            sendgrid.addEmail(badList, testEmail1, testName1, function(err, res) {
                expect(res).toBe(list_name_error);
                done();
            });
        });
        it("invalid email shows unsuccessful add", function(done) {
            sendgrid.addEmail(testList, badEmail, testName1, function(err, res) {
                expect(res).toBe(add_failed);
                done();
            });
        });
        it("duplicate call shows unsuccessful add", function(done) {
            sendgrid.addEmail(testList, testEmail1, testName1, function(err, res) {
                expect(res).toBe(add_failed);
                done();
            });
        });
        it("duplicate email, valid call shows unsuccessful add", function(done) {
            sendgrid.addEmail(testList, testEmail1, testName2, function(err, res) {
                expect(res).toBe(add_failed);
                done();
            });
        });
        it("different email, valid call shows successful add", function(done) {
            sendgrid.addEmail(testList, testEmail2, testName1, function(err, res) {
                expect(res).toBe(add_success);
                done();
            });
        });
    });
    
    
    describe("test deleteEmail", function() {
        it("valid request successful", function(done) {
            sendgrid.deleteEmail(testList, testEmail1, testName1, function(err, res) {
                expect(res).toBe(delete_success);
                done();
            });
        });
        
        it("invalid listName shows error", function(done) {
            sendgrid.deleteEmail(badList, testEmail1, testName1, function(err, res) {
                expect(res).toBe(list_name_error);
                done();
            });
        });
        it("invalid email shows unsuccessful remove", function(done) {
            sendgrid.deleteEmail(testList, badEmail, testName1, function(err, res) {
                expect(res).toBe(delete_failed);
                done();
            });
        });
        it("nonexistent email, valid call shows unsuccessful remove", function(done) {
            sendgrid.deleteEmail(testList, testEmail1, testName1, function(err, res) {
                expect(res).toBe(delete_failed);
                done();
            });
        });
        it("existing email, valid call shows successful remove", function(done) {
            sendgrid.deleteEmail(testList, testEmail2, testName1, function(err, res) {
                expect(res).toBe(delete_success);
                done();
            });
        });
    });

    describe("GET /listEmails/...", function() {
        
        // Assumes nothing is in list currently
        
        it("invalid listName shows error", function(done) {
            sendgrid.listEmails(badList, function(err, res) {
                expect(res).toBe(bad_list_call_res);
                done();
            });
        });
        it("valid call shows empty array", function(done) {
            sendgrid.listEmails(testList, function(err, res) {
                expect(res).toBe(empty_list_call_res);
                done();
            });
        });
        
        it("added one, valid call shows one element in array", function (done) {
            sendgrid.addEmail(testList, testEmail1, testName1, function(err, res) {
                expect(res).toBe(add_success);
                sendgrid.listEmails(testList, function(err, res) {
                    expect(res).toBe(good_list_call_res1);
                    done();
                });
            });
        });
        it("added second, valid call shows two elements in array", function (done) {
            sendgrid.addEmail(testList, testEmail2, testName1, function(err, res) {
                expect(res).toBe(add_success);
                sendgrid.listEmails(testList, function(err, res) {
                    expect(res).toBe(good_list_call_res12);
                    done();
                });
            });
        });
        it("removed first, valid call shows one element in array", function(done) {
            sendgrid.deleteEmail(testList, testEmail1, testName1, function(err, res) {
                expect(res).toBe(delete_sucess);
                sendgrid.listEmails(testList, function(err, res) {
                    expect(res).toBe(good_list_call_res2);
                    done();
                });
            });
        });
        it("removed second, valid call shows no elements in array", function(done) {
            sendgrid.deleteEmail(testList, testEmail2, testName1, function(err, res) {
                expect(res).toBe(delete_sucess);
                sendgrid.listEmails(testList, function(err, res) {
                    expect(res).toBe(empty_list_call_res);
                    done();
                });
            });
        });
    });

    it("test list deleted", function(done) {
        sendgrid.deleteList(testList, function(err, res) {
            expect(res).toBe(addDeleteList_success);
            done();
        });
    });
});
