// Reference: Class website assignment 1 instruction
var express = require('express');
var app = express();
var myParser = require("body-parser");
app.use(myParser.urlencoded({extended:true}));
var qs = require('qs');
var cookieParser = require('cookie-parser');
app.use(cookieParser());
var session = require('express-session');

// create a secret for session
// Reference: Professor Daniel Port Lab 15
// Reference: Professor Daniel Port - Assignment 3 Code Example - https://dport96.github.io/ITM352/morea/180.Assignment3/reading-code-examples.html
app.use(session({secret: "ITM352 rocks!"}));


// To load file system
// Reference Lab 14 from Professor Daniel Port
var fs = require('fs');
// Read user information file
var user_info_file = './user_information.json'
var user_info = JSON.parse(fs.readFileSync(user_info_file, 'utf-8'));

app.use(express.static('.'));
app.listen(8080, () => console.log(`listening on port 8080`));

app.use(express.static('./store_information'));

app.post('/process_submit_tutorial', function(request, response, next) {
    var tutorial_quantity = request.body
    for (i=0; tutorial_quantity[i] != ''; i++) {
        let errs = isNonNegInt(tutorial_quantity,true);
        if (errs.length>1) {
            return;
        } else {
            sessionStorage.setItem(`tutorial_quantities[i]`,`tutorial_quantity[i]`)
        }
    }
});

// process login information
// Reference Professor Daniel Port Screencast:https://www.youtube.com/watch?v=cJxLxCzL-0M
app.post('/process_login', function(request, response, next){
    console.log(request.query)
    // Check login information with database information
    // Reference Professor Daniel Port Lab 14
    let username_inputted = request.body['user_name'];
    let password_inputted = request.body['user_password'];
    // Check if the client is login by checking cookie
    if (typeof request.cookies['user_name'] != 'undefined') {
    // if cookie is not undefined, redirect back to login page
        console.log(`Session is sent, session ID is ${request.session.id}`)
        response.redirect('login_page.html');
    }
    if (typeof user_info[username_inputted]!= 'undefined') { //Check if the username exists 
        if(user_info[username_inputted]['password'] == password_inputted ) {
    // Successfully login
    // If password matches, send client a cookie to record client login status
        response.cookie('userlogin',username_inputted);
        response.redirect('login_page.html'); 
        } else { // Password doesn't match with database, redirect back to login page
            request.query['password_wrong'] = 'true';
            response.redirect('login_page.html?' + qs.stringify(request.query));
        }
    } else { //If the username doesn't exist, ask client to create an account
        request.query['uname_notexist'] = 'true';
        response.redirect('login_page.html?' + qs.stringify(request.query)); // Redirect back to login page with order information
        
    }
});

// process registration 
// Reference Professor Daniel Port Screencast:https://www.youtube.com/watch?v=cJxLxCzL-0M
app.post('/process_register', function(request, response, next){
    // Check input validation
    // push method reference: Lab 11 - Professor Daniel Port
    // Set different variable for validation checking
    let error_message = []; // to push error message
    var letters = /^[A-Za-z]+$/; // for full name validation
    var validinput = /^[0-9a-zA-Z]+$/; // for username validation
    var password = request.body['password']; // checking passwords
    var confirm_password = request.body['confirm_password']; 
    var mailformat = /^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/; // for email validation
    // Check full name
    if (letters.test(request.body['new_client_full_name'])) {
        // no error meessage is displayed if it returns ture
        // .test() refers from https://www.w3schools.com/jsref/jsref_regexp_test.asp
        console.log('valid full name');
    } else {
        error_message.push('Please enter valid full name!')
    };
    
    // Checl username
    if (validinput.test(request.body['new_user_name'])) {
        // no error meessage is displayed if it returns ture
        console.log('valid username');
    } else {
        error_message.push('Please enter valid user name!');
    };

    // Check password
    if (password == confirm_password) {
        // no error meessage is displayed if it returns ture
        console.log('Matched password');
    } else {
        error_message.push('Passwords Not Match')
    };

    // Check email
    if (mailformat.test(request.body['new_email'])) {
        // no error meessage is displayed if it returns ture
        console.log('valid email');
    } else {
        error_message.push('Please enter valid email!')
    };

    // Update database with registration information
    // Reference Professor Daniel Port Lab 14
    username = request.body["new_user_name"];
    user_info[username] = {};
    user_info[username].password = request.body["password"];
    user_info[username].email = request.body["new_email"];
    user_info[username].name = request.body["new_client_full_name"];
    if (error_message.length == 0) {
    // Use file system write to update database
    fs.writeFileSync(user_info_file, JSON.stringify(user_info));
    if (typeof request.cookie != 'undefine') {
    // if client had login before, delete the previous cookie first
    // Reference: https://www.tutorialspoint.com/expressjs/expressjs_cookies.htm
    response.clearCookie('userlogin');
    };
    // Send client a new cookie regarding the new account
    response.cookie('userlogin',request.body['new_user_name']);
    // After create an account, redirect to login page and let client login
    response.redirect('login_page.html');}
    else {
        // not response to client submission if there is any invalid input
        console.log('Invalid input, not response to registration!');
    }
});

    // Check client inputted tax year if it is a positive integer and matches with the updated restriction
    function isValidYear (y,returnErrors=false) {
        var errors = [];
        if(y =='' && !qtyTextboxOb.value =='')  errors.push('Please enter your desired tax year!');
        if(Number(y) != y) errors.push('Your tax year is not a number!'); 
        if(y < 0) errors.push('Please do not enter a negative number in the tax year box!'); 
        if(parseInt(y) != y) errors.push('Please enter an integer in the tax year box!'); 
        return returnErrors ? errors : (errors.length == 0); 
    }

    // Check input number if it is an positive integet
    // Reference - Check Positive Integet: Lab 11 - Professor Daniel Port
    function isNonNegInt(q,returnErrors=false) {
        if(q =='') q=0; // Client should not receive any error message if there is no input in the textbox
        var errors = []; // assume no errors at first
        if(Number(q) != q) errors.push('Not a number!'); // Check if string is a number value
        if(q < 0) errors.push('Negative value!'); // Check if it is non-negative
        if(parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer
        return returnErrors ? errors : (errors.length == 0); // If there is no error message in the array, the length should be 0, which returns back to true, the input is a positive integer
    };