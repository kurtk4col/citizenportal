(function ($) {

	function hideKeyboard(element) {
		element.attr('readonly', 'readonly'); // Force keyboard to hide on input field.
		element.attr('disabled', 'true'); // Force keyboard to hide on textarea field.
		setTimeout(function() {
			element.blur();  //actually close the keyboard
			// Remove readonly attribute after keyboard is hidden.
			element.removeAttr('readonly');
			element.removeAttr('disabled');
		}, 100);
	}

	$.widget("custom.combobox", {
		options: {
			inputId: '',
			inputPlaceHolder: '',
			minLen: 0,
			required: false
		},
	
		 _create: function() {
			this.wrapper = $( "<span>" )
			  .addClass( "custom-combobox ui-widget" )
			  .insertAfter( this.element );
	 
			this.element.hide();
			this._createAutocomplete();
			this._createShowAllButton();
		},
	  
		_open: false,
 
		_createAutocomplete: function() {
			var selected = this.element.children( ":selected" ),
			value = selected.val() ? selected.text() : "";
 
			if (this.options.minLen === 0) {
				this.input = $( "<input>" )
					.appendTo( this.wrapper )
					.val( value )
					.attr( "title", "" )
					.attr( "id", this.options.inputId)
					.attr( "placeholder", this.options.inputPlaceHolder)
					.addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left drop-down" )
					.autocomplete({
						delay: 0,
						minLength: this.options.minLen,
						source: $.proxy( this, "_source" ) })
					.tooltip({
						tooltipClass: "ui-state-highlight" })
					.wrap("<div class='dropdown-wrapper'></div>")
					.after("<div class='dropdown-caret-wrapper " + this.options.inputId + "Caret'><span class='caret'></span></div>");
			}
			else {
				this.input = $( "<input>" )
					.appendTo( this.wrapper )
					.val( value )
					.attr( "title", "" )
					.attr( "id", this.options.inputId)
					.attr( "placeholder", this.options.inputPlaceHolder)
					.addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left drop-down" )
					.autocomplete({
						delay: 0,
						minLength: this.options.minLen,
						source: $.proxy( this, "_source" ) })
					.tooltip({
						tooltipClass: "ui-state-highlight" })
			}
			if (this.options.required)
				this.input.addClass("required");
				
			var iid = this.options.inputId;
			var input = this.input;
			$('.' + this.options.inputId + 'Caret').mousedown(function() {
				_open = input.autocomplete( "widget" ).is( ":visible" );
			})
			.click(function() {
				if ((!_open)&&(!top.ableToClose)) {
					top.ableToClose = true;
					input.addClass('focus');
					$('.' + iid + 'Down').click();
				  }
				else {
					top.ableToClose = false;
					input.removeClass('focus');
					$("ul").hide();
				}
			});
 
		},
 
		_createShowAllButton: function() {
			var input = this.input,
			wasOpen = false;
 
			$( "<a>" )
				.attr( "tabIndex", -1 )
				.attr( "title", "Show All Items" )
				.tooltip()
				.appendTo( this.wrapper )
				.button({
					icons: {
						primary: "ui-icon-triangle-1-s"
					},
					text: false
				})
				.removeClass( "ui-corner-all" )
				.addClass( "custom-combobox-toggle ui-corner-right " + this.options.inputId + "Down" )
				.mousedown(function() {
					wasOpen = input.autocomplete( "widget" ).is( ":visible" );
				})
				.click(function() {
					if(!( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) )) { // If we're not mobile, we still want to focus
						input.focus();
					}
	 
					// Close if already visible
					if ( wasOpen ) {
					  return;
					}
	 
					// Pass empty string as value to search for, displaying all results
					input.autocomplete( "search", "" );
				});
		},
 
		_source: function( request, response ) {
			var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
			response( this.element.children( "option" ).map(function() {
				var text = $( this ).text();
				if ( this.value && ( !request.term || matcher.test(text) ) )
					return {
						label: text,
						value: text,
						option: this
					};
			}) );
		},
 
		_removeIfInvalid: function( event, ui ) {
 
			// Selected an item, nothing to do
			if ( ui.item ) {
				return;
			}
	 
			// Search for a match (case-insensitive)
			var value = this.input.val(),
			valueLowerCase = value.toLowerCase(),
			valid = false;
			this.element.children( "option" ).each(function() {
				if ( $( this ).text().toLowerCase() === valueLowerCase ) {
					this.selected = valid = true;
					return false;
				}
			});
	 
			// Found a match, nothing to do
			if ( valid ) {
				return;
			}
	 
			// Remove invalid value
			this.input
				.val( "" )
				.attr( "title", value + " didn't match any item" )
				.tooltip( "open" );
			this.element.val( "" );
			this._delay(function() {
				this.input.tooltip( "close" ).attr( "title", "" );
			}, 2500 );
			this.input.autocomplete( "instance" ).term = "";
		},
 
		_destroy: function() {
			this.wrapper.remove();
			this.element.show();
		}
	});
})( jQuery );

(function($) {
	$.fn.changeElementType = function(newType) {
		var attrs = {};

		$.each(this[0].attributes, function(idx, attr) {
			attrs[attr.nodeName] = attr.value;
		});

		this.replaceWith(function() {
			return $("<" + newType + "/>", attrs).append($(this).contents());
		});
	};
})(jQuery);

function alert2(m, t, b) {
	BootstrapDialog.show({
		message: m,
		title: t,
		closable: false,
		buttons: [{
			label: b,
			hotkey: 13,
			action: function(dialogRef){
				dialogRef.close();
			}
		}]
	});
}

function alert3(m, t, b, h) {
	BootstrapDialog.show({
		message: m,
		title: t,
		closable: false,
		buttons: [{
			label: b,
			hotkey: 13,
			action: function(dialogRef){
				dialogRef.close();
			}
		}],
		onhidden: function(dialogRef){
			h.focus();
			h.trigger('click'); // Focus and pull up keyboard for portable devices
		}
	});
}