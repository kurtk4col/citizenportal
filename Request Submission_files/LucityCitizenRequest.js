$(document).ready(function(){
	// Written & Commented by Sean Stout for Lucity, Inc. (c) 2014. Some scripts provided by 3rd party authors & are copyright to their respective owners
	top.isValid = function() {
		return checkForm($("Request_Form"));  // This line is specific to the included Captcha. If not using included Captcha, then change line to "return true;" or whatever is specific to your Captcha
	};

	top.ableToClose = false;
	top.ableToUpload = true;
	top.XCoordinate;
	top.YCoordinate;
	top.useCoords = false;
	top.UserXCoordinate;
	top.UserYCoordinate;
	top.TRACKURL = $('#TRACKURL').html();
	top.MAINURL = $('#MAINURL').html();

	var codeValueList = {};
	var typeValueList = {};
	var fileName = "";
	var dropArray = [ // These will become combo boxes
		"AreaCode",
		"BuildingTypeCode",
		"CityLocation",
		"DepartmentCode",
		"DivisionCode",
		"LocationBuildingType",
		"NameTypeCode",
		"PriorityCode",
		"StatusCode",
		"SubAreaCode",
		"SubDivisionCode",
		"User16Code",
		"User17Code",
		"User18Code",
		"User1Code",
		"User2Code",
		"User3Code",
		"WorkOrderUser1",
		"WorkOrderUser16",
		"WorkOrderUser17",
		"WorkOrderUser18",
		"WorkOrderUser19",
		"WorkOrderUser2",
		"WorkOrderUser20",
		"WorkOrderUser21",
		"WorkOrderUser3",
		"WorkOrderUser50Code",
		"WorkOrderUser51Code",
		"CategoryCode",
		"SupervisorCode",
		"CauseCode",
		"ProblemCode",
		"AssignedCrewCode"
	];
	var streetArray = [
		"RequestorStreet",
		"RequestorStreet2",          
		"Street",
		"Street2"
	];
	
	if (document.getElementById('FileToUpload').disabled) {
			top.ableToUpload = false;
	}
	
	if (/(Android (1.0|1.1|1.5|1.6|2.0|2.1))|(Windows Phone (OS 7|8.0))|(XBLWP)|(ZuneWP)|(w(eb)?OSBrowser)|(webOS)|(Kindle\/(1.0|2.0|2.5|3.0))/.test(navigator.userAgent) ) {
			top.ableToUpload = false;
	}
	
	if (top.ableToUpload === false)
	{
		$("#UploaderDiv").hide();
	}
	
	// Dropdown functionality to make it nice for mobile users
	$("input").focus(function() {
		top.ableToClose = false;
		$("input").removeClass('focus');
		$("ul").hide();
	});
	
	$(document).on('focus', '.drop-down', function() {
		top.ableToClose = false;
		$("ul").hide();
	});
	
	$(document).click(function(e){
		if (( $(e.target).closest(".custom-combobox").length > 0)||( $(e.target).closest("select").length > 0))
			return false;
		top.ableToClose = false;
		$("input").removeClass('focus');
		$("ul").hide();
	});
	
	$(document).on('click', 'ul', function() {
		top.ableToClose = false;
		$("input").removeClass('focus');
		$("input").blur();
	});
		
	$.each(dropArray, function(id, val) { // Change into combo boxes
		if ($("#" + val).length > 0) {
			if ($("#" + val).hasClass("required"))
				this.required = true;
			else
				this.required = false;
			$("#" + val).changeElementType("select");
			$("#" + val).attr('id', "_" + val);
			$("#_" + val).before("<label for='" + "_" + val +"' style='display: none;'>Hidden Combobox Label</label>"); // Necessary for ADA compliance?
			$("#_" + val).combobox({ inputId: val, inputPlaceHolder: $("#_" + val).attr('placeholder'), required: this.required});
			$("#_" + val).scrollTop();
		}
	});
		
	$.each(streetArray, function(id, val) { // Change into combo boxes
		if ($("#" + val).length > 0) {
			$("#" + val).changeElementType("select");
			$("#" + val).attr('id', "_" + val);
			$("#_" + val).before("<label for='" + "_" + val +"' style='display: none;'>Hidden Combobox Label</label>"); // Necessary for ADA compliance?
			$("#_" + val).combobox({ inputId: val, inputPlaceHolder: $("#_" + val).attr('placeholder'), minLen: 3});
			$("#_" + val).scrollTop();
		}
	});
	
	// These are specially handled
	if ("#ProblemCode".length > 0)
		$("#ProblemCode").removeClass("drop-down");
	if ("#Street".length > 0)
		$("#Street").removeClass("drop-down");
	if ("#Street2".length > 0)
		$("#Street2").removeClass("drop-down");
	if ("#RequestorStreet".length > 0)
		$("#RequestorStreet").removeClass("drop-down");
	if ("#RequestorStreet2".length > 0)
		$("#RequestorStreet2").removeClass("drop-down");


	$("#FillFormProperly").dialog({autoOpen: false});
	jQuery.support.cors = true;
	ko.validation.rules.pattern.message = 'Invalid.';
	
	$("#prog").toggle();
	
	ko.validation.configure({
		registerExtenders: true,
		messagesOnModified: true,
		insertMessages: true,
		parseInputAttributes: true,
		messageTemplate: null
	});
	
	// Used to validate email, if the client so chooses
	ko.validation.rules.emailConfirm = {
		validator: function (email, confirmEmail) {
			return email === confirmEmail;
		},
		message: 'Emails must match'
	};
	ko.validation.registerExtenders();
	
	// Adding classes so client doesn't have to     -- NOTE: User should not use radio buttons, currently they will not work, but this functionality can be added
	$("input").each(function() {
		var el = $(this);
		if ((el.attr('type') != "checkbox")&&(el.attr('type') != "file")&&(el.attr('type') != "button")&&(el.parents("#Captcha_Div").length === 0))
			el.addClass("form-control");
	});
	$("textarea").addClass("form-control");
	$("label").addClass("control-label");
	$("button").addClass("btn btn-default");
	$("#submit").attr('data-bind', 'click: submit');
	$("#submit").attr('data-loading-text', 'Submitting...');
	$("#OpenMap").attr('data-bind', 'click: openMap');
	$("#ConfirmCoords").attr('data-bind', 'click: confirmCoords').removeClass("btn-default").addClass("btn-primary");
	$("#CancelCoords").attr('data-bind', 'click: cancelMap').removeClass("btn-default").addClass("btn-danger");
		
	$("#FileToUpload").change(function() {
		fileName = fileSelected();
	});

	function watcher() {
	
		var self = this;	

		getLocation();
		
		this.reqArray = []; // Necessary to confirm all required elements are filled out
		
		// Dealing with "Remember Me" Functionality
		this.setCookie = function(cname, cvalue, exdays) {
			var d = new Date();
			d.setTime(d.getTime() + (exdays*24*60*60*1000));
			var expires = "expires="+d.toGMTString();
			document.cookie = cname + "=" + cvalue + "; " + expires;
		};

		this.getCookie = function(cname) {
			var name = cname + "=";
			var ca = document.cookie.split(';');
			for(var i=0; i<ca.length; i++) {
				var c = ca[i].trim();
				if (c.indexOf(name) === 0) 
					return c.substring(name.length, c.length);
			}
			return "";
		};
		
		// For "Use requestor's Address" checkbox
		this.transferAddress = ko.observable(false);
		
		// Dynamic Knockout observable set up
		$("input").each(function() {
			var el = $(this);
			if (($(this).attr('type') != 'file')&&($(this).attr('type') != 'button')) {
				if ($("#" + el.attr('id')).hasClass("required")) {
					self[el.attr('id')] = ko.observable("").extend({required: true});
					self.reqArray.push(self[el.attr('id')]);
					el.parent().addClass("has-warning");
				}
				else
					self[el.attr('id')] = ko.observable("");
					
				if ((el.attr('id').substring(0,9) == 'Requestor')||(el.attr('id') == 'Business'))
					el.addClass("remember");
					
				if (el.attr('id') == 'RequestorEmail') {
					self[el.attr('id')] = self[el.attr('id')].extend({email: true});
					self.reqArray.push(self[el.attr('id')]);
				}
				else if (el.attr('id') == 'ConfirmRequestorEmail') {
					self[el.attr('id')] = self[el.attr('id')].extend({email: true, emailConfirm: self.RequestorEmail});
					self.reqArray.push(self[el.attr('id')]);
				}
			}
		});     
		$("textarea").each(function() {
			var el = $(this);
			if ($("#" + el.attr('id')).hasClass("required")) {
				self[el.attr('id')] = ko.observable("").extend({required: true});
				self.reqArray.push(self[el.attr('id')]);
				el.parent().addClass("has-warning");
			}
			else
				self[el.attr('id')] = ko.observable("");
		}); 
		
		$("select").each(function() {
			var el = $(this);
			if ($("#" + el.attr('id')).hasClass("required"))
				el.parent().addClass("has-warning");
		});
			
		$(".form-control").each( function() {
			el = $(this);
			el.attr("data-bind", "value: " + el.attr('id'));
		});
		
		// Give drop downs their data-binding
		$(".drop-down").each( function() {
			el = $(this);
			el.attr("data-bind", "value: " + el.attr('id')); // These data bindings seem to be fine with being either text or value. Interesting
		});
		// Special drop downs require special data binding
		$("#ProblemCode").attr("data-bind", "value: ProblemCode, valueUpdate: 'afterkeydown'");
		$("#RequestorStreet").attr("data-bind", "value: RequestorStreet, valueUpdate:'afterkeydown'");
		$("#RequestorStreet2").attr("data-bind", "value: RequestorStreet2, valueUpdate:'afterkeydown'");
		$("#Street").attr("data-bind", "value: Street, valueUpdate:'afterkeydown'");
		$("#Street2").attr("data-bind", "value: Street2, valueUpdate:'afterkeydown'");
		
		var preventPaste = false;
		if (($('#ConfirmRequestorEmail').hasClass('preventpaste'))||($('#RequestorEmail').hasClass('preventpaste')))
			preventPaste = true;
		
		// Prevents copying and pasting email
		if (preventPaste) {
		$('#ConfirmRequestorEmail').bind("paste",function(e) {
			e.preventDefault();
			alert3('Cannot paste into this field', 'ERROR', 'OK', $("#ConfirmRequestorEmail"));
		});
		
		$('#RequestorEmail').bind("paste",function(e) {
			e.preventDefault();
			alert3('Cannot paste into this field', 'ERROR', 'OK', $("#RequestorEmail"));
		});
		}
		
		self.errors = ko.validation.group(this.reqArray, {deep: true}); // Makes sure all required fields are filled out
		
		// Functionality for "Use Requestor's Address" checkbox
		$("#UseRequestorsAddress").prop('checked',false); // IE will remember if something was left checked, we don't want this to be remembered
		
		$("#UseRequestorsAddress").change(function() {
			if ($("#UseRequestorsAddress").prop('checked')) {
				$("#UseCoords").prop('checked', false);
		
				// First we have to check to make sure this is even a valid selection
				var check1 = false;
				var check2 = false;
				var k;
				if ($("#RequestorStreet").length > 0) {
					for (k in streetList) {
						if (self.RequestorStreet().toUpperCase().trim() == streetList[k].toUpperCase().trim()) {
							self.RequestorStreet(streetList[k]); // Allow user to type in correct answers with incorrect case
							check1 = true;
						}
						else if (self.RequestorStreet().length === 0)
							check1 = true;
					}
				}
				else
					check1 = true;
					
				if ($("#RequestorStreet2").length > 0) {
					for (k in streetList) {
						if (self.RequestorStreet2().toUpperCase().trim() == streetList[k].toUpperCase().trim()) {
							self.RequestorStreet2.val(streetList[k]); // Allow user to type in correct answers with incorrect case
							check2 = true;
						}
						else if (self.RequestorStreet2().length === 0)
							check2 = true;
					}
				}
				else
					check2 = true;
					
				if ((check1 === true)&&(check2 === true)) { // If it is a valid selection
					if (!((typeof self.BuildingNumber === 'undefined')||(typeof self.RequestorBuildingNumber === 'undefined')))
						self.BuildingNumber(self.RequestorBuildingNumber());
					if (!((typeof self.Building2Number === 'undefined')||(typeof self.RequestorBuilding2Number === 'undefined')))
						self.Building2Number(self.RequestorBuilding2Number());
					if (!((typeof self.Street === 'undefined')||(typeof self.RequestorStreet === 'undefined')))
						self.Street(self.RequestorStreet());
					if (!((typeof self.Street2 === 'undefined')||(typeof self.RequestorStreet2 === 'undefined')))
						self.Street2(self.RequestorStreet2());
				}
				else
					$("#UseRequestorsAddress").prop('checked',false);
			}
		});
		
		$("#BuildingNumber").focusout(function() {
			if (self.BuildingNumber() != self.RequestorBuildingNumber())
				$("#UseRequestorsAddress").prop('checked', false);
		});
		$("#Building2Number").focusout(function() {
			if (self.Building2Number() != self.RequestorBuilding2Number())
				$("#UseRequestorsAddress").prop('checked', false);
		});
		$("#Street").focusout(function() {
			if (self.Street() != self.RequestorStreet())
				$("#UseRequestorsAddress").prop('checked', false);
		});
		$("#Street2").focusout(function() {
			if (self.Street2() != self.RequestorStreet2())
				$("#UseRequestorsAddress").prop('checked', false);
		});
		$("#RequestorBuildingNumber").focusout(function() {
			if (self.BuildingNumber() != self.RequestorBuildingNumber())
				$("#UseRequestorsAddress").prop('checked', false);
		});
		$("#RequestorBuilding2Number").focusout(function() {
			if (self.Building2Number() != self.RequestorBuilding2Number())
				$("#UseRequestorsAddress").prop('checked', false);
		});
		$("#RequestorStreet").focusout(function() {
			if (self.Street() != self.RequestorStreet())
				$("#UseRequestorsAddress").prop('checked', false);
		});
		$("#RequestorStreet2").focusout(function() {
			if (self.Street2() != self.RequestorStreet2())
				$("#UseRequestorsAddress").prop('checked', false);
		});
		
		
		//Populates the dropdown menus
		$(".drop-down").each( function(i,el) {
			el = $(el);
			codeValueList[el.attr('id')] = [];
			typeValueList[el.attr('id')] = [];
			$.getJSON($('#RESTAPI').html()+'/LookupList/Request.svc/' + el.attr('id') + '/?format=json', function(data) {
				$.each(data, function(id, rec) {
					codeValueList[el.attr('id')].push(rec.CodeValue);
					typeValueList[el.attr('id')].push(rec.TypeValue);
				});
			});
			el.autocomplete({
				source: function(request, response) {
					var results = $.ui.autocomplete.filter(typeValueList[el.attr('id')], request.term);
					response(results);//.slice(0,10));
				},
				delay: 50
			});
		}); 
		
		$("#CaptchaInput").keypress(function (event) {
			if (event.which == 13)
				submit();
		});
		
		$("#UseCoords").change(function() {
			if (typeof top.XCoordinate === 'undefined')
				$("#UseCoords").prop('checked', false)
			if ($("#UseCoords").prop('checked') === true)
				$("#UseRequestorsAddress").prop('checked',false);
		});
		
		submit = function () {
			if (self.errors().length === 0) { // All required fields are filled	
				if (top.isValid()) {
					if ($("#UseCoords").prop('checked') === true)
						top.useCoords = true;
					var userInput = {}; // Get ready to take in the information
					var categoryHolder = "";
					var btn = $("#submit");
					var k;
					btn.button('loading');
					for (k in codeValueList.CategoryCode) {
							if (typeValueList.CategoryCode[k] == self.CategoryCode())
								categoryHolder = '<br> Category: ' + typeValueList.CategoryCode[k];
						}
					
					// Take in the information
					$("input").each(function() {				
						var el = $(this);
						if ((el.attr('type') != "checkbox")&&(el.attr('type') != "file")&&(el.attr('type') != "button")&&(el.parents("#Captcha_Div").length === 0)) {
							if ((el.hasClass("drop-down"))||(el.attr('id') == "ProblemCode")) { // Replace type value with code value
								for (var k in codeValueList[el.attr('id')]) {
									if (typeValueList[el.attr('id')][k] == self[el.attr('id')]())
										userInput[el.attr('id')] = codeValueList[el.attr('id')][k]; // Send the code value, not the type value
								}
							}
							else
								userInput[el.attr('id')] = self[el.attr('id')]();
						}
					});
					$("textarea").each(function() {
						var el = $(this);
						userInput[el.attr('id')] = self[el.attr('id')]();
					});
					
					var URLpost = $('#RESTAPI').html() + '/Requests.svc/?format=json';
					
					if (top.useCoords) { // If we're using the Longitude and Latitude
						// Get ready to send in the coordinates
						userInput.XCoordinate = top.XCoordinate;
						userInput.YCoordinate = top.YCoordinate;
						// Update the POST URL
						URLpost = $('#RESTAPI').html() + '/Requests.svc/?COORDSYS=LATLONG&format=json';
						// Don't send in information that won't be used.
						userInput.BuildingNumber = null;
						userInput.Building2Number = null;
						userInput.LocationApartment = null;
						userInput.LocationCity = null;
						userInput.LocationState = null;
						userInput.LocationZipCode = null;
						userInput.Street = null;
						userInput.Street2 = null;
					}
					
					// If there is no input, must be sent as null
					for (k in userInput) {
						if (userInput[k]==="")
							userInput[k] = null;
					}
					
					if ($('#FixedCategory').length > 0)
						userInput.CategoryCode = $('#FixedCategory').html();
						
					if ($('#FixedProblem').length > 0)
						userInput.ProblemCode = $('#FixedProblem').html();	
					
					var userJSON = JSON.stringify(userInput); // Convert to JSON
					$.ajax({
						url: URLpost,
						type: 'POST',
						contentType: "application/json;charset=UTF-8",
						data: userJSON,
						success: function (data) {						
							var info = [data.RequestNumber, self.RequestorName1(), self.RequestorName2(), self.RequestorEmail(), categoryHolder, fileName]
							$( document ).on( "click", "a", function( event ){
									event.preventDefault();
									location.href = $( event.target ).attr( "href" );
							});
							if (fileName !== "") { // If user is uploading an image
								$("#prog").toggle();								
								uploadFile(data.AutoNumber, info);
							}
							else {
								document.body.innerHTML = '<p style="text-align: center; color: black;"><span style="text-align: center; font-size:1.1em;">Thank you for your submission.<br><br> Reference Number: ' + data.RequestNumber + '<br> First Name: ' + self.RequestorName1() + '<br> Last Name: ' + self.RequestorName2() + ' <br> Email: ' + self.RequestorEmail() + categoryHolder + '<br><br><br>Additional Options:<br><a class="btn btn-default" href="' + top.MAINURL + '">Add Another</a><br><br><a class="btn btn-default" href="' + top.TRACKURL + '">Track this submission</a></span></p>';
								$(document).scrollTop(0);
							}
						},
						error: function (xhr, ajaxOptions, thrownError) {
							alert2(xhr.status, 'Status', 'OK');
							alert2(thrownError, 'Thrown Error', 'OK');
							alert2(userJSON, 'JSON Sent', 'OK');
						} 
					});  
				}
			} else {
				alert2('Form must be filled out properly', 'ERROR', 'OK');
				self.errors.showAllMessages();
			}
		};
		
 		// Used if user uses mouse to select a dropdown item
		$(".drop-down").each( function() {
			var el = $(this);
			el.focusout(function() {
				self[el.attr('id')]($("#" + el.attr('id')).val());
			});
		});
		$("#ProblemCode").focusout(function() {
			self.ProblemCode($("#ProblemCode").val());
		});
  		$("#RequestorStreet").focusout(function() {
			self.RequestorStreet($("#RequestorStreet").val());
		});
  		$("#RequestorStreet2").focusout(function() {
			self.RequestorStreet($("#RequestorStreet2").val());
		});
		$("#Street").focusout(function() {
			self.Street($("#Street").val());
		});
		$("#Street2").focusout(function() {
			self.Street($("#Street2").val());
		});

		// Functionality for "Remember Me" checkbox
 		var rememberMe = self.getCookie("rememberMe");
		if (rememberMe == "remember") {
			$("#RememberMe").prop('checked', true);
			$("input").each(function() {
				var el = $(this);
				if ((el.attr('id').substring(0,9) == 'Requestor')||(el.attr('id') == 'Business')||(el.attr('id') == 'ConfirmRequestorEmail'))
					self[el.attr('id')](self.getCookie(el.attr('id')));
			});
		}
		
		$("#RememberMe").change(function() {
			if ($("#RememberMe").is(':checked')) {
				self.setCookie("rememberMe", "remember", 365);
				$("input").each(function() {
					var el = $(this);
					if ((el.attr('id').substring(0,9) == 'Requestor')||(el.attr('id') == 'Business')||(el.attr('id') == 'ConfirmRequestorEmail'))
						self.setCookie(el.attr('id'), self[el.attr('id')](), 365);
				});
			}
			else
				document.cookie = "rememberMe=remember; expires=Thu, 01 Jan 1970 00:00:00 GMT";
		}); 
		
		$("input").each(function() {
			var el = $(this);
			if (($(this).attr('type') != 'file')&&($(this).attr('type') != 'button')) {
				if ((el.attr('id').substring(0,9) == 'Requestor')||(el.attr('id') == 'Business')||(el.attr('id') == 'ConfirmRequestorEmail')) {
					el.focusout(function() {
						if ($("#RememberMe").is(':checked'))
							self.setCookie(el.attr('id'), self[el.attr('id')](), 365);
					});
				}
			}
		});		
	}
	
	// Populates the "ProblemCode" dropdown menu
	codeValueList.ProblemCode = [];
	typeValueList.ProblemCode = [];
	if ($("#ProblemCodeList").length > 0) { // If ProblemCodeList is given
		data = $.parseJSON($("#ProblemCodeList").html());
		$.each(data, function(id, rec) {
			codeValueList.ProblemCode.push(rec.CodeValue);
			typeValueList.ProblemCode.push(rec.TypeValue);
		});
		$(" #ProblemCode ").autocomplete({
			source: function(request, response) {
				var results = $.ui.autocomplete.filter(typeValueList.ProblemCode, request.term);
				response(results);
			}
		});
	}
	else { // Otherwise use standard 311
		$.getJSON($('#RESTAPI').html()+'/LookupList/Request.svc/ProblemCode/?311Only=true&format=json', function(data) { // Only get '311' problems
			$.each(data, function(id, rec) {
				codeValueList.ProblemCode.push(rec.CodeValue);
				typeValueList.ProblemCode.push(rec.TypeValue);
			});
			$(" #ProblemCode ").autocomplete({
				source: function(request, response) {
					var results = $.ui.autocomplete.filter(typeValueList.ProblemCode, request.term);
					response(results);
				}
			});
		}); 
	}

	// Populates all of the street related dropdown menus
	var streetList = [];
	$.getJSON($('#RESTAPI').html()+'/LookupList/Request.svc/Street/?format=json', function(data) {
		$.each(data, function(id, rec) {
			streetList.push(rec.Name); // List of all the streets
		});
		$(" #RequestorStreet ").autocomplete({ // Populate the autocomplete
			source: function(request, response) {
				var results = $.ui.autocomplete.filter(streetList, request.term);
				response(results);
			}
		});
		$(" #RequestorStreet2 ").autocomplete({ // Populate the autocomplete
			source: function(request, response) {
				var results = $.ui.autocomplete.filter(streetList, request.term);
				response(results);
			}
		});
		$(" #Street ").autocomplete({ // Populate the autocomplete
			source: function(request, response) {
				var results = $.ui.autocomplete.filter(streetList, request.term);
				response(results);
			}
		});
		$(" #Street2 ").autocomplete({ // Populate the autocomplete
			source: function(request, response) {
				var results = $.ui.autocomplete.filter(streetList, request.term);
				response(results);
			}
		});
	}); 
	
	// Forces drop downs (except streets & ProblemCode) to have valid inputs
	// $(document).on syntax must be used for some reason
	$(document).on('focusout', '.drop-down', function() {
		var el = $(this);
		var $label = $("label[for='"+el.attr('id')+"']");
		var check = false;
		var temp = el.val().toString();
		for (var k in typeValueList[el.attr('id')]) {
			if (el.val().toUpperCase().trim() === typeValueList[el.attr('id')][k].toUpperCase().trim()) {
				el.val(typeValueList[el.attr('id')][k]); // Allow user to type in correct answers with incorrect case
				check = true;
			}
		}
		if ((check === false)&&(temp.length > 0))
			alert3("Must select a valid " + $label.text(),'ERROR','OK', el);
	});
	
	$("#ProblemCode").focusout(function() { // Forces ProblemCode to have valid input
		var check = false;
		var temp = $("#ProblemCode").val().toString();
		var el = $(this);
		var $label = $("label[for='ProblemCode']");
		for (var k in typeValueList.ProblemCode) {
			if ($("#ProblemCode").val().toUpperCase().trim() == typeValueList.ProblemCode[k].toUpperCase().trim()) {
				$("#ProblemCode").val(typeValueList.ProblemCode[k]);
				check = true;
			}
		}
		if ((check === false)&&(temp.length > 0))
			alert3("Must select a valid " + $label.text(),'ERROR','OK', $("#ProblemCode"));
	});
	
	$("#Street").focusout(function() { // Forces Street to have valid input
		var check = false;
		var temp = $("#Street").val().toString();
		for (var k in streetList) {
			if ($("#Street").val().toUpperCase().trim() == streetList[k].toUpperCase().trim()) {
				$("#Street").val(streetList[k]); // Allow user to type in correct answers with incorrect case
				check = true;
			}
		}
		if ((check === false)&&(temp.length > 0))
			alert3("Must select a valid street",'ERROR','OK', $("#Street"));
	});
	
	$("#Street2").focusout(function() { // Forces Street2 to have valid input
		var check = false;
		var temp = $("#Street2").val().toString();
		for (var k in streetList) {
			if ($("#Street2").val().toUpperCase().trim() == streetList[k].toUpperCase().trim()) {
				$("#Street2").val(streetList[k]); // Allow user to type in correct answers with incorrect case
				check = true;
			}
		}
		if ((check === false)&&(temp.length > 0))
			alert3("Must select a valid street",'ERROR','OK', $("#Street2"));
	});
	
	ko.applyBindings(new watcher());

});