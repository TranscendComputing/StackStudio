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
        'jquery.jstree'
], function( $, _, Backbone, Common, Gh3 ) {
       
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
                        } else if ( view.templatesContent ) {
                            var nodeData = $("#" + node[0].id).data();
                            if (nodeData.type === "dir") {
                                var dir = nodeData;
                                dir.fetchContents(function(err, contents) {
                                    dir.eachContent(function(content) {
                                        if (content.type === "file") {
                                            var file = dir.getFileByName(content.name);
                                            var id = file.name.split(".")[0].toLowerCase();
                                            var node = {
                                                "data": {
                                                    "title": file.name,
                                                    "attr": {"id": id + "_link", "class": "tree_a"}
                                                },
                                                "metadata": file,
                                                "attr": {"id": id + "_container", "class": "tree_li"}
                                            };
                                            data.push(node);
                                        }
                                    });
                                    dataFunction(data);
                                });
                            }
                        } else {
                               //Grab TranscendComputing org for interrogation into repo(s)
                               var user = new Gh3.User("TranscendComputing");
                               user.fetch(function(err, resUser){
                                   if (err) {
                                       console.log("Error...", err);
                                   }
                               });
                               
                               //Grab CloudFormationTemplates repo
                               var repo = new Gh3.Repository("CloudFormationTemplates", user);
                               repo.fetch(function(err,res) {
                                   if (err) {console.log("Error....", err);}
                                   
                                   if ( repo.message && (repo.message.match("API Rate Limit Exceeded for") !== null) ) {
                                       if (!Common.github) {
                                           alert(repo.message + "  Please login to continue working with remote templates.");
                                       }
                                   }
                                   
                                   repo.fetchBranches(function(err,res) {
                                       if (err) {console.log("Error fetching branches....", err);}
                                       
                                       //Grab master branch
                                       var master = repo.getBranchByName("master");
                                       master.fetchContents(function(err,res) {
                                           if (err) {console.log("Error fetching content....", err);}
                                           
                                           view.templatesContent = master;
                                           
                                           master.eachContent(function(content) {
                                               if (content.type === "dir") {
                                                    //Get directory
                                                    var repoDir = master.getDirByName(content.name);
                                                   
                                                    var id = repoDir.name.split(".")[0].toLowerCase();
                                                    var node = {
                                                        "data": {
                                                            "title": repoDir.name,
                                                            "attr": {"id": id + "_link", "class": "tree_a"}                                    
                                                        },
                                                        "metadata": repoDir,
                                                        "attr": {"id": id + "_container", "class": "tree_li"},
                                                        "state": "closed"
                                                        
                                                    };
                                                    data.push(node);
                                               }
                                           });
                                           dataFunction(data);
                                       });
                                   });
                               });
                               return data;
                        }
                    },
                    "correct_state": false
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
                }
            });
        }
        
    });
    
    return TemplatesListView;
});
