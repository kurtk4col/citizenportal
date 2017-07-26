$(document).ready(function() {
        // Written & Commented by Perry Gowdy for Lucity, Inc. (c) 2017. Some scripts provided by 3rd party authors & are copyright to their respective owners
        $(document).scrollTop(0);
        $('#loadingmask').fadeOut(500, function() {
            $(this).remove();
        });
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
        $("#GetWorkOrder").attr('data-bind', 'click: submit');
        $("#GetWorkOrder").attr('data-loading-text', 'Fetching...');

        function viewModel() {
            var self = this;

            this.WorkOrderNumberInput = ko.observable().extend({
                required: true
            });
            $('#WorkOrderNumberInput').attr('data-bind', 'value: WorkOrderNumberInput');

            this.reqArray = [];
            this.reqArray.push(this.WorkOrderNumberInput);

            $("center div").each(function() {
                var el = $(this);
                self[el.attr('id')] = ko.observable("");
                el.attr("data-bind", "text: " + el.attr('id'));
            });

            self.errors = ko.validation.group(this.reqArray, {
                deep: true
            });

            $("#WorkOrderNumberInput").keypress(function(event) {
                if (event.which == 13) {
                    self.RequestorNumberInput($("#WorkOrderNumberInput").val());
                    submit();
                    this.blur();
                }
            });

            function setHeader(xhr) {
                xhr.setRequestHeader('APPID', 'c6ce418f-c2da-4ca1-a797-41a513e5cc63'); // This value should correspond to your APPID number assigned through Client Applications in the Admin Portal of Lucity Web App
            }

            submit = function() {
                if (self.errors().length === 0) { // All required fields are filled
                    var sub = $(this);
                    sub.btn = $("#GetRequest");
                    sub.btn.button('loading');
                    $.ajax({
                                url: $('#RESTAPI').html() + '/WorkOrder/?format=json&CommonId=' + self.WorkOrderNumberInput(),
                                method: 'GET',
                                dataType: 'json',
                                crossDomain: true,
                                success: function(data) {
                                    if (data[0]) {
                                        var returnedWorkOrder = data[0];
                                        $('#WorkOrderNumber').html("Work Order Number: " + returnedWorkOrder['WorkOrderNumber']);
                                        $('#StatusType').html("Status Type: " + returnedWorkOrder['StatusType']);
                                        var date = new Date(returnedWorkOrder['StatusDate']);
                                        $('#StatusDate').html("Status Date: " + (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear());
                                        $('#ProblemType').html("Problem Type: " + returnedWorkOrder['ProblemType']);
                                        $('#Notes').html("Notes: " + returnedWorkOrder['Notes']);
                                        date = new Date(returnedWorkOrder['CreationDateTime']);
                                        $('#CreationDateTime').html("Creation Date and Time: " + (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear());
                                    } else {
                                        self.StatusType("");
                                        self.StatusDate("");
                                        self.ProblemType("");
                                        self.Notes("");
                                        self.CreationDateTime("");
                                        self.WorkOrderNumber("Request Not Found");
                                    }
                        },
                        error: function() {
                            alert('Failed Request');
                        },
                        beforeSend: setHeader
                });
        } else {
            alert('Form must be filled out properly');
            self.errors.showAllMessages();
        }
    };
}
ko.applyBindings(new viewModel());
});
