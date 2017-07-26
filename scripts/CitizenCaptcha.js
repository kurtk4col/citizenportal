function checkForm(theform){
// Written & Commented by Sean Stout for Lucity, Inc. (c) 2014.	
	var why = "";
	
	if($("#CaptchaInput").val() == "")
		why += "- Security code should not be empty.\n";
	
	if($("#CaptchaInput").val != "")
	{
		if(ValidCaptcha($("#CaptchaInput").val()) == false)
			why += "- Security code did not match.\n";
	}
	if(why != "")
	{
		alert2(why, "Incorrect Captcha", "OK");
		generate();
		return false;
	}
	return true;
}

var code = '';
//Generates the captcha function
function generate() {
	var ac = Math.random();
	var bc = Math.random();
	var cc = Math.random();
	var dc = Math.random();
	var ec = Math.random();
	if (ac > .666)
		var a = String.fromCharCode(Math.ceil(Math.random() * 25) + 65);
	else if (ac > .333)
		var a = String.fromCharCode(Math.ceil(Math.random() * 25) + 97);
	else
		var a = Math.ceil(Math.random() * 9) + '';
		
	if (bc > .666)
		var b = String.fromCharCode(Math.ceil(Math.random() * 25) + 65);
	else if (bc > .333)
		var b = String.fromCharCode(Math.ceil(Math.random() * 25) + 97);
	else
		var b = Math.ceil(Math.random() * 9) + '';
		
	if (cc > .666)
		var c = String.fromCharCode(Math.ceil(Math.random() * 25) + 65);
	else if (cc > .333)
		var c = String.fromCharCode(Math.ceil(Math.random() * 25) + 97);
	else
		var c = Math.ceil(Math.random() * 9) + '';
		
	if (dc > .666)
		var d = String.fromCharCode(Math.ceil(Math.random() * 25) + 65);
	else if (dc > .333)
		var d = String.fromCharCode(Math.ceil(Math.random() * 25) + 97);
	else
		var d = Math.ceil(Math.random() * 9) + '';
		
	if (ec > .666)
		var e = String.fromCharCode(Math.ceil(Math.random() * 25) + 65);
	else if (ec > .333)
		var e = String.fromCharCode(Math.ceil(Math.random() * 25) + 97);
	else
		var e = Math.ceil(Math.random() * 9) + '';
		
	code = a + b + c + d + e;
	document.getElementById("Captcha").innerHTML = code;
}

// Validate the Entered input against the generated security code function
function ValidCaptcha(){
var str1 = (document.getElementById('Captcha').innerHTML).replace(/\s|/g, '');
var str2 = (document.getElementById('CaptchaInput').value).replace(/\s|/g, '');
if (str1 == str2){
return true;
}else{
return false;
}
}
	
$(document).ready(function(){
	$("#CaptchaInput").attr('autocorrect', 'off');
	$("#CaptchaInput").attr('autocapitalize', 'off');
	generate();
});