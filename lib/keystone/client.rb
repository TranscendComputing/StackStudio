require 'rest_client'
require 'keystone/v2_0/client'

module Keystone
	class Client
		attr_accessor :catalog, :token
		def initialize(attributes, connection_options)
			attributes = attributes.symbolize_keys
			username = attributes[:openstack_username]
		    password = attributes[:openstack_api_key]
			tenant_name = attributes[:openstack_tenant]

            # Remove '/tokens' path from auth url -- Keystone client adds this path
			@auth_url = attributes[:openstack_auth_url].gsub("/tokens", "")
			@keystone_client = Keystone::V2_0::Client.new(:username => username, :password => password, :tenant_name => tenant_name, :auth_url => @auth_url)
		    @catalog = @keystone_client.service_catalog
			@token = JSON.parse(@keystone_client.service_catalog.token.to_json)["id"]
		end

		def list_users
			users = JSON.parse(RestClient.get "#{@auth_url}/users", {"X-Auth-Token" => @token, :accept => :json})
			return users
		end

		def list_groups
			groups = JSON.parse(RestClient.get "#{@auth_url}/tenants", {"X-Auth-Token" => @token, :accept => :json})
			return groups
		end

		def list_group_users(id)
			return JSON.parse(RestClient.get "#{@auth_url}/#{id}/users", {"X-Auth-Token" => @token, :accept => :json})
		end

		def create_user(params={})
			request = {}
			new_user = {}
			new_user[:name] = params[:name]
			new_user[:email] = params[:email] unless params[:email].right_blank?
			new_user[:tenantId] = params[:group_id] unless params[:group_id].right_blank?
			new_user[:enabled] = params[:enabled] || true
			request[:user] = new_user

			return RestClient.post("#{@auth_url}/users", request.to_json, {"X-Auth-Token" => @token, :accept => :json, :content_type => :json})
			#return RestClient.post("#{@auth_url}/users", request.to_json, {"X-Auth-Token" => @token, :accept => :json, :content_type => :json}){|response, request, result| response } 
			#return JSON.parse(response)
		end

		def delete_user(user_id)
			RestClient.delete("#{@auth_url}/users/#{user_id}",{"X-Auth-Token" => @token, :accept => :json, :content_type => :json})
		rescue RestClient::ResourceNotFound => error
			response = JSON.parse(error.response)["error"]
			aws_error = []
			aws_error << [response["title"], response["message"]]
			raise RightAws::AwsError.new(aws_error, response["code"])
		end

		def update_user(user_id, name, params={})
			request = {}
			updated_user = {}
			updated_user[:name] = name
			updated_user[:id] = user_id
			updated_user[:email] = params[:email] unless params[:email].right_blank?
			updated_user[:tenantId] = params[:group_id] unless params[:group_id].right_blank?
			updated_user[:enabled] = params[:enabled] || true
			request[:user] = updated_user

			return RestClient.post("#{@auth_url}/users/#{user_id}", request.to_json, {"X-Auth-Token" => @token, :accept => :json, :content_type => :json})
		#rescue RestClient::NotFound => error
		#	response = JSON.parse(error.response)["error"]
		#	aws_error = []
		#	aws_error << [response["title"], response["message"]]
		#	raise RightAws::AwsError.new(aws_error, response["code"])
		end

		def list_user_roles(user_id, service_id=nil)
			if service_id.nil?
				url = "#{@auth_url}/users/#{user_id}/roles"
			else
				url = "#{@auth_url}/users/#{user_id}/roles?serviceId=#{service_id}"
			end
			return RestClient.get(url, {"X-Auth-Token" => @token, :accept => :json})
		end

		def create_group(options={})
			request = {}
			new_group = {}
			new_group[:name] = options[:name]
			new_group[:description] = options[:description] unless options[:description].right_blank?
			new_group[:enabled] = options[:enabled] || true
			request[:tenant] = new_group

			return RestClient.post("#{@auth_url}/tenants", request.to_json, {"X-Auth-Token" => @token, :accept => :json, :content_type => :json})
		end

		def delete_group(group_id)
			RestClient.delete("#{@auth_url}/tenants/#{group_id}",{"X-Auth-Token" => @token, :accept => :json, :content_type => :json})
		rescue RestClient::ResourceNotFound => error
			response = JSON.parse(error.response)["error"]
			aws_error = []
			aws_error << [response["title"], response["message"]]
			raise RightAws::AwsError.new(aws_error, response["code"])
		end

		def update_group(group_id, name, options)
			request = {:tenant => {}}
			updated_group = request[:tenant]
			updated_group[:id] = group_id
			updated_group[:name] = name
			updated_group[:description] = options[:description] unless options[:description].right_blank?
			updated_group[:enabled] = options[:enabled] || true
			
			return RestClient.post("#{@auth_url}/tenants#{group_id}", {"X-Auth-Token" => @token, :accept => :json, :content_type => :json})
		#rescue RestClient::NotFound => error
		#	response = JSON.parse(error.response)["error"]
		#	aws_error = []
		#	aws_error << [response["title"], response["message"]]
		#	raise RightAws::AwsError.new(aws_error, response["code"])
		end




	end
end
