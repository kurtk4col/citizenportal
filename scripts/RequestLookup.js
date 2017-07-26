$(document).ready(function(){
// Written & Commented by Sean Stout for Lucity, Inc. (c) 2014. Some scripts provided by 3rd party authors & are copyright to their respective owners
	$(document).scrollTop(0);
	$('#loadingmask').fadeOut(500, function(){ $(this).remove(); });
	jQuery.support.cors = true; // Needed for IE
	ko.validation.rules.pattern.message = 'Invalid.';

	ko.validation.configure({
		registerExtenders: true,
		messagesOnModified: true,
		insertMessages: true,
		parseInputAttributes: true,
		messageTemplate: null
	});

	$("form").addClass("form-horizontal");
	$("form div").addClass("form-group");
	$("form div div").addClass("col-md-4");
	$("input").addClass("form-control");
	$("label").addClass("col-md-offset-2 col-md-2 control-label");
	$("button").addClass("btn btn-default");
	$("#GetRequest").attr('data-bind', 'click: submit');
	$("#GetRequest").attr('data-loading-text', 'Fetching...');

	function viewModel() {
		var self = this;

		this.RequestorNumberInput = ko.observable().extend({required: true});
		this.RequestorEmailInput = ko.observable().extend({required: true, email: true});
		$('#RequestorNumberInput').attr('data-bind', 'value: RequestorNumberInput');
		$('#RequestorEmailInput').attr('data-bind', 'value: RequestorEmailInput');

		this.reqArray = [];
		this.reqArray.push(this.RequestorNumberInput);
		this.reqArray.push(this.RequestorEmailInput);

		$("center div").each(function() {
			var el = $(this);
			self[el.attr('id')] = ko.observable("");
			el.attr("data-bind", "text: " + el.attr('id'));
		});

		self.errors = ko.validation.group(this.reqArray, {deep: true});

		$("#RequestorEmailInput").keypress(function (event) {
			if (event.which == 13){
				self.RequestorEmailInput($("#RequestorEmailInput").val());
				submit();
				this.blur();
			}
		});

		$("#RequestorNumberInput").keypress(function (event) {
			if (event.which == 13) {
				self.RequestorNumberInput($("#RequestorNumberInput").val());
				submit();
				this.blur();
			}
		});

		submit = function() {
			if (self.errors().length === 0) { // All required fields are filled
				var sub = $(this);
				sub.btn = $("#GetRequest");
				sub.btn.button('loading');
				$.getJSON($('#RESTAPI').html() + '/Request/?format=json&Email=' + self.RequestorEmailInput() + '&RequestNumber=' + self.RequestorNumberInput(), function(data) {
					if (data.length > 0) {
						$.each(data, function(id, rec) {
							$("center div").each(function() {
								var el = $(this);
								var date;
							 /*	if (el.attr('id') == 'RequestorName1')
									self[el.attr('id')]("Requestor's first name: " + rec[el.attr('id')]);
								if (el.attr('id') == 'RequestorName2')
									self[el.attr('id')]("Requestor's last name: " + rec[el.attr('id')]); */
								if (el.attr('id') == 'RequestNumber')
									self[el.attr('id')]("Request number: " + rec[el.attr('id')]);
								if (el.attr('id') == 'StatusType')
									self[el.attr('id')]("Status: " + rec[el.attr('id')]);
								if (el.attr('id') == 'StatusDate') {
									date = new Date(rec[el.attr('id')]);
									if (typeof Date.prototype.toISOString == "function")
										self[el.attr('id')]("Status date: " + ((date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear()));
									else
										self[el.attr('id')]("Status date: " + date);
								}
								if (el.attr('id') == 'ProblemType')
									self[el.attr('id')]("Problem type: " + rec[el.attr('id')]);
								if (el.attr('id') == 'Notes')
									self[el.attr('id')]("Notes: " + rec[el.attr('id')]);
								if (el.attr('id') == 'CreationDateTime') {
									date = new Date(rec[el.attr('id')]);
									if (typeof Date.prototype.toISOString == "function")
										self[el.attr('id')]("Creation date: " + ((date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear()));
									else
										self[el.attr('id')]("Status date: " + date);

								}

							});
						});
					}
					else {
						self.StatusType("");
						self.StatusDate("");
						self.ProblemType("");
						self.Notes("");
						self.CreationDateTime("");
						self.RequestNumber("Request Not Found");
					}
				}).always(function() { sub.btn.button('reset'); });
			}
			else {
				alert('Form must be filled out properly');
				self.errors.showAllMessages();
			}
		};
	}

	ko.applyBindings(new viewModel());
});
