/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true alert:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'common',
        'gh3',
        'models/account',
        'jquery.jstree'
], function( $, _, Backbone, Common, Gh3, Account ) {
       
    var TemplatesListView = Backbone.View.extend({
        
        //TODO define element
        //OR use tagName, className, ...
        el: "#templates_list",
        
        tree: undefined,
        
        events: {
            'click .jstree_custom_item': 'handleClick' 
        },
        
        initialize: function(){
            Common.vent.on("account:login", this.reRenderTree);
            
            //var userAcct = new Account({username: 'sstudiouser', password: 'transcendcomputing'});
            //userAcct.login();
        },
        
        handleNodeData: function(a,b,c) {
            return {};  
        },
        
        render: function() {
            var view = this;
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
                        "attr": {"id": "templates_root_folder"},
                        "state": "closed",
                        "metadata": {
                            "url": "https://api.github.com/repos/TranscendComputing/CloudFormationTemplates/contents/",
                            "parent_tree": "#templates_list"
                        }
                    }], 
                    "ajax": {
                        "url": function(node) {
                            if (node === -1) {
                                return "";
                            } else {
                                return "/getit?url=" + node.data( "url" );
                            }
                        },
                        "type": "get",
                        "success": function(ops) {
                            var data = [];
                            for(var opnum in ops){
                                var op = ops[opnum];
                                //Add reference to parent tree
                                op.parent_tree = "#templates_list";
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
                                
                                if (op.name !== "README.md") {
                                    data.push( node );
                                }
                            }
                            
                            return data;
                        },
                        "error": function(j, t, e) {
                            console.log("Error retrieving data", j,t,e);
                        }
                    },
                    "correct_state": false
                },
                
                "themeroller": {
                    "item": "jstree_custom_item"
                }
            });            
            
            return this;
        },
        
        loadTemplate: function(e) {
            return false;
        },
        
        handleClick: function() {
            console.log('clicked');
            return false;
        },
        
        reRenderTree: function() {
            
        }
        
    });
    
    return TemplatesListView;
});
