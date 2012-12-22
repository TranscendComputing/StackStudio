var consoleapp = consoleapp || {};

$(function( $ ) {
	'use strict';

	// The Console Application
	// ---------------

	// Embedded model; message.
	consoleapp.Message = Backbone.Model.extend({

		defaults: {
			type: 'success',
			message: '',
		}
	});

	// Our overall **CommandLineView** is UI view for console and command line.
	consoleapp.CommandLineView = Backbone.View.extend({

		expanded: false,

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#console_area',

		// Delegated events.
		events: {
			'click #con_expand': 'toggleFullSize',
			'click #con_options': 'popupOptions',
			'click .export_to': 'exportTo'
		},

		// At initialization, initialize any components that still require JS.
		initialize: function() {
			$('#con_expand').button({
	            icons: {
	                primary: "ui-icon-arrowthick-2-n-s"
	            },
	            text: false
			});
			$('#con_options').button({
	            icons: {
	                primary: "ui-icon-gear"
	            },
	            text: false
			}).next().hide().menu( {/*select: selected, */trigger: $("#con_options")} );
			this.expanded = true; // set to expanded, then toggle, for cmd-only start.
			this.toggleFullSize();
		},

		// No rendering to do, presently; the elements are already on the page.
		render: function() {
		},

		handleCommand: function(command, term) {
			if (command !== '') {
				try {
					var result = new consoleapp.Message();
					if (command.indexOf('cloud-') == 0) {
						result.set('message', "Started 1 instance.");
					} else if (command.indexOf('cloud-run-instances') == 0) {
						result.set('message', "Started 1 instance.");
					} else if (command == 'cloud-describe-instances') {
						result = "Displaying cloud instances.";
					} else {
						result.set('message', " Unsupported operation.");
						result.set('type', "error");
					}
					if (result !== undefined) {
						if (term) {
							if (result.get('type') == 'error') {
								term.echo(new String('[1;31mError[0m'+result.get('message')));
							} else {
								term.echo(new String(result.get('message')));
							}
						} else {
							$(ich.alert(result.attributes)).purr();
						}
					}
				} catch (e) {
					if (term) {
						term.error(new String(e));
					} else {
						$(ich.alert(new String(e))).purr();
					}
				}
			} else {
				if (term) {
					term.echo('');
				}
			}
		},

		toggleFullSize: function() {
			this.expanded = ! this.expanded;
			if (this.expanded) {
				if (this.$cmd) {
					this.$cmd.disable();
					this.$cmd.hide();
				}
				if (this.$console) {
					this.$console.show();
					this.$console.enable();
					return;
				}
				this.$console =
				$('#cloud_console').terminal(this.handleCommand, {
					greetings : 'Cloud Console',
					name : 'cloud_console',
					height : 200,
					prompt : '[1;32mcloud[0m> '
				});

			} else {
				if (this.$console) {
					this.$console.disable();
					this.$console.hide();
				}
				if (this.$cmd) {
					this.$cmd.show();
					this.$cmd.enable();
					return;
				}
				this.$cmd = $('#cloud_cmd').cmd({
					greetings : 'Cloud Console',
					name : 'cloud_console',
					width : '100%',
					prompt : '[1;32mcloud[0m> ',
					commands : this.handleCommand
				});
			}
		},

		popupOptions: function() {
			var menu = $( "#con_options" ).next().show().position({
                my: "left top -200",
                at: "right bottom",
                of: $("#con_options")
            });
            $( menu ).one( "click", function() {
                menu.hide();
            });
		},

		exportTo: function() {
			console.log("Export menu.");
			// TODO: send commands first, then navigate.
			document.location = "/projects/open";
		}

	});
});
