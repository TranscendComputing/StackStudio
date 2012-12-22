require 'chef/rest'

class Chef
    class RestClient
    
    
        def initialize(url, client_name=Socket.gethostname)
            @rest = Chef::REST.new(url, client_name)
        end
        
        def list_cookbooks
            return @rest.get_rest "cookbooks"
        end
        
        def get_cookbook(name, version=nil)
            if version.nil?
                cookbook = @rest.get_rest "cookbooks/#{name}"
                version = cookbook[name]["versions"][0]["version"]
            end
            return @rest.get_rest "cookbooks/#{name}/#{version}"
        end
        
        def get_cookbook_attributes(name, version=nil)
            cookbook = get_cookbook(name, version)
            return cookbook.metadata.attributes
        end
        
        def list_roles
            role_names = @rest.get_rest "roles"
            roles = []
            role_names.each_key do |name|
                roles << get_role(name)
            end
            return roles
        end
        
        def get_role(name)
            role = @rest.get_rest "roles/#{name}"
            return role.as_json
        end
        
        def get_runlist_description(runlist)
            recipes = []
            runlist.each do |r|
                recipe = r.split("recipe[")[1].split("]")[0]
                if !recipe.nil?
                    cookbook = get_cookbook(recipe)                
                    recipes << {:name => cookbook.name,
                                :version => cookbook.metadata.version,
                                :long_description => cookbook.metadata.long_description,
                                :description => cookbook.metadata.description,
                                :platforms => cookbook.metadata.platforms,
                                :recipes => cookbook.metadata.recipes,
                                :dependencies => cookbook.metadata.dependencies}
                end
            end
            return recipes
        end
    end
end