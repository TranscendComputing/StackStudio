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
        'Gh3',
        'models/account',
        'jquery.jstree'
], function( $, _, Backbone, Common, Gh3, Account ) {
       
    var TemplatesListView = Backbone.View.extend({
        
        //TODO define element
        //OR use tagName, className, ...
        el: "#templates_list",
        
        tree: undefined,
        
        events: {
            //TODO
        },
        
        initialize: function(){
            Common.vent.on("account:login", this.reRenderTree);
            
            var userAcct = new Account({username: 'sstudiouser', password: '1g3ty*mn3v!'});
            userAcct.login();
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
                    "data": function(node, dataFunction) {
                        var data = [];
                        if (node === -1) {
                            var rootData = [
                            {
                                "data": {
                                    "title": "CloudFormation Templates",
                                    "attr": {"class": "root_folder"}
                                },
                                "attr": {"id": "templates_root"},
                                "state": "closed"
                            }];
                            dataFunction(rootData);
                        } else if (view.templatesContent){
                            //TODO
                        } else {
                            var templatesRepo = Common.github.getRepo("TranscendComputing", "CloudFormationTemplates");
                            
                            templatesRepo.getTree('master?recursive=true', function(err, tree) {
                                console.log("ERROR", err);
                                var node, currentDirectory;
                                view.templatesContent = tree;
                                $.each(tree, function(index, item) {
                                    if (item.type === "tree") {
                                        node = {
                                            "data": {
                                                "title": item.path,
                                                "attr": {"id": item.path.toLowerCase() + "_link", "class": "tree_a"}
                                            },
                                            "metadata": item,
                                            "attr": {"id": item.path.toLowerCase() + "_container", "class": "tree_li"}
                                        };
                                        data.push(node);
                                        currentDirectory = node;
                                    }
                                    if ( (item.type === "blob") && (item.path !== "README.md") ) {
                                        var name = item.path.split("/").pop();
                                        var id = name.split(".")[0];
                                        node = {
                                            "data": {
                                                "title": name,
                                                "attr": {"id": id.toLowerCase() + "_link", "class": "tree_a"}
                                            },
                                            "metadata": item,
                                            "attr": {"id": id.toLowerCase() + "_container", "class": "tree_li"}
                                        };
                                        if (currentDirectory && (item.path.indexOf(currentDirectory.data.title) !== -1) ) {
                                            if (!currentDirectory.children) {
                                                currentDirectory.children = [];
                                            }
                                            currentDirectory.children.push( node );
                                        } else {
                                            data.push(node);
                                        }
                                    } 
                                });
                                dataFunction(data);
                            });
                               
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
        
        handleNodeClick: function() {
            return false;
        },
        
        reRenderTree: function() {
            
        }
        
    });
    
    return TemplatesListView;
});
