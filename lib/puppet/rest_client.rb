require 'rest-client'
require 'json'

class Puppet
    class RestClient
    
        def initialize(puppet_master_url, environment="production")
            @url = "#{puppet_master_url}/#{environment}"
        end
        
        def list_resources
            response = ::RestClient.get "#{@url}/resource_types/*", {:accept => :pson}
            @resources = JSON.parse(response)
            return @resources
        end
        
        def list_class_resources
            get_types("hostclass")
        end
        
        def list_module_resources
            classes = list_class_resources
            modules = []
            classes.each do |c|
                unless c["file"].match("/init.pp").nil?
                    modules << c
                end
            end
            return modules
        end
        
        def list_node_resources
            get_types("node")
        end
        
        def list_facts(node)
            response = ::RestClient.get "#{@url}/facts/#{node}", {:accept => :pson}
            return JSON.parse(response)
        end
        
        def list_all_agents
            response = ::RestClient.get "#{@url}/facts_search/search?facts.hostname.ne=", {:accept => :pson}
            @agents = JSON.parse(response)
            return @agents
        end
        
        def search_by_facts(fact_name, fact_value)
            response = ::RestClient.get "#{@url}/facts_search/search?facts.#{fact_name}=#{fact_value}", {:accept => :pson}
            return JSON.parse(response)
        end
        
        def describe_all_agents
            @agents ||= list_all_agents
            query = []
            @agents.each do |a|
                query << list_facts(a)
            end
            return query
        end
        
        private
        
        def get_types(type)
            @resources ||= list_resources
            types = []
            @resources.each do |r|
                if r["type"] == type
                    types << r
                end
            end
            return types
        end
        
    end
end