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
        'common',
        'ace',
        'jquery-ui'
], function( $, _, Backbone, ich, Common, ace ) {
    
    var AutocompleteItemView = Backbone.View.extend({
        
        id: "autocomplete",
        
        tagName: "input",
        
        events: {
            //'click': 'selectItem'
        },
        
        render: function() {
          var values = ["t1.micro", "m1.small", "m1.medium", "m1.large"];
          this.$el.autocomplete({
              source: function( request, response) {
                  var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( request.term ), "i" );
                  response( $.grep( values, function( item ) {
                      return matcher.test( item );
                  }) );
              },
              autoFocus: true,
              select: this.handleSelect
          });
          return this;  
        },
        
        handleSelect: function( event, ui ) {
            $("#autocomplete").remove();
            $("#autocomplete_container").remove();
            var editor = ace.edit("design_editor");
            var range = editor.getSelectionRange();
            var selectedValue = ui.item.value;
            editor.session.replace(range, selectedValue);
        }
        
    });
    
    return AutocompleteItemView;
});
