/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
 /*jshint smarttabs:true */
 /*global define:true console:true */
 define([
  'jquery',
  'underscore',
  'backbone',
  'icanhaz',
  'interpreters/cloud_interpreter',
  'jquery.terminal',
  'jquery-plugins' // for jquery.purr
  ], function( $, _, Backbone, ich, Interpreter ) {
    'use strict';

  // The Console Application
  // -----------------------

  /**
   * Embedded model representing a result from a command.
   *
   * @name Message
   * @constructor
   * @category Console
   * @param {Object} initialization object.
   * @returns {Object} Returns a Message instance.
   */
  var Message = Backbone.Model.extend({

    defaults: {
      type: 'success',
      message: ''
    }
  });

  /**
   * CommandLineView is UI view for console and command line.
   *
   * @name CommandLineView
   * @constructor
   * @category Console
   * @param {Object} initialization object.
   * @returns {Object} Returns a CommandLineView instance.
   */
  var CommandLineView = Backbone.View.extend({

    /** True if expanded to a multiline window */
    expanded: false,

    enabled: false,

    /** Instead of generating a new element, bind to the existing skeleton of
     * the view already present in the HTML.
     */
    el: '#console_area',

    /** Delegated events */
    events: {
      'click #con_expand': 'toggleFullSize',
      'click #con_options': 'popupOptions',
      'click .export_to': 'exportTo',
      'click .con_clear': 'clear',
      'hover': 'toggleActive'
    },

    chooseInterpreter: function(newInterpreter) {
          //TODO: dynamically load different interpreters
    },

    /** At initialization, initialize any components that still require JS. */
    initialize: function() {
      this.interpreter = new Interpreter();
      // Ensure this = this, even when called back, also bind first argument
      this.handleCommand = _.bind(this.handleCommand, this, this.interpreter);
      this.onCommandKey = _.bind(this.onCommandKey, this, this.interpreter);
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
      }).next().hide().menu( {trigger: $("#con_options")} );
      this.expanded = true; // set to expanded, then toggle, for cmd-only start.
      this.toggleFullSize();
    },

    /** No rendering to do, presently; the elements are already on the page. */
    render: function() {
    },

    handleCommand: function(interpreter, command, term) {
      if (command !== '') {
        try {
          var result = new Message();
          result.set(this.interpreter.exec(command, term));
          if (result !== undefined) {
            if (term) {
              if (result.get('type') === 'error') {
                term.error(String(result.get('message')));
              } else {
                term.echo(String(result.get('message')));
              }
            } else {
              $(ich.alert(result.attributes)).purr();
            }
          }
        } catch (e) {
          if (term) {
            term.error(String(e));
          } else {
            $(ich.alert(String(e))).purr();
          }
        }
      } else {
        if (term) {
          term.echo('');
        }
      }
    },

    onCommandKey: function(interpreter, event, term) {
      //TODO: pop up completions on commands, arguments.
      //console.log("Got key.", event);
    },

    toggleFullSize: function() {
      if ($('#cloud_cmd')['cmd'] === undefined) {
        return;
      }
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
          //prompt : '[1;32mcloud[0m> ',
          prompt : 'cloud> ',
          keypress : this.onCommandKey
        });

      } else {
        if (this.$console) {
          this.$console.disable();
          this.$console.hide();
        }
        if (this.$cmd) {
          this.$cmd.show();
          return;
        }
        this.$cmd = $('#cloud_cmd').cmd({
          enabled: false,
          greetings : 'Cloud Console',
          name : 'cloud_console',
          width : '100%',
          //prompt : '[1;32mcloud[0m> ',
          prompt : 'cloud> ',
          tabcompletion: true,
          commands : this.handleCommand,
          keypress : this.onCommandKey
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

    toggleActive: function() {
      if (this.enabled) {
        if (this.expanded) {
          this.$console.disable();
        }
        else {
          this.$cmd.disable();
        }
        this.enabled = false;
      } else {
        if (this.expanded) {
          this.$console.enable();
        }
        else {
          this.$cmd.enable();
        }
        this.enabled = true;
      }
    },

    clear: function() {
      if (this.expanded) {
        this.$console.clear();
      }
      return false;
    },

    exportTo: function() {
      console.log("Export menu.");
      // TODO: send commands first, then navigate.
      document.location = "/projects/open";
    }

  });

return CommandLineView;
});
