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
        'common',
        'jquery.jstree'
], function( $, _, Backbone, Common ) {
       
    var TemplatesListView = Backbone.View.extend({
        
        //TODO define element
        //OR use tagName, className, ...
        el: "#templates_list",
        
        tree: undefined,
        
        events: {
            //TODO
        },
        
        initialize: function(){
            //TODO
        },
        
        render: function() {
            console.log("rendering tree...");
            this.tree = $("#templates_list").jstree({ 
                // List of active plugins
                "plugins" : [ 
                    "json_data", "cookies", "crrm", "themeroller"
                ],
                
                "core": {
                    "animation": 0,
                    "load_open": true
                },
    
                // I usually configure the plugin that handles the data first
                // This example uses JSON as it is most common
                "json_data" : {
                    "data": [
                    {
                        "data": {
                            "title": "CloudFormation Templates",
                            "attr": {"class": "root_folder"}
                        },
                        "state": "closed",
                        "metadata": {
                            "url": "https://api.github.com/repos/TranscendComputing/CloudFormationTemplates/contents/"
                        }
                    }], 
                    "ajax": {
                        "url": function(node) {
                            if (node === -1) {
                                return "";
                            } else {
                                return node.data( "url" );
                            }
                        },
                        "type": "get",
                        "success": function(ops) {
                            var data = [];
                            console.log("OPS", ops);
                            for(var opnum in ops){
                                var op = ops[opnum];
                                var id = op.name.split(".")[0].toLowerCase();
                                var node = {
                                    "data": {
                                        "title": op.name,
                                        "attr": {"id": id + "_link", "class": "tree_a"}                                    
                                    },
                                    "metadata": op,
                                    "attr": {"id": id + "_container", "class": "tree_li"}
                                    
                                };
                                if (op.type === "dir") {
                                    node.state = "closed";
                                }
                                console.log("OP", op);
                                if (op.name !== "README.md") {
                                    data.push( node );
                                }
                            }
                            
                            console.log(data);
                            return data;
                        },
                        "error": function(j, t, e) {
                            console.log(j,t,e);
                        }
                    },
                    "correct_state": false
                }
            });
            
            return this;
        }
        
    });
    
    return TemplatesListView;
});
