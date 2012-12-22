class TopStack
    class RestClient
        include ServiceInterfaceMethods
        
        ACCOUNT_NOT_FOUND="Account Not Found"
        DONE="done"
        ALREADY_EXISTS="Already Exists"
        
        def initialize(cloud, account=nil)
                @cloud = cloud
                @account = account
                # Iterate through cloud services to get valid topstack host
                iaas_services = [ServiceTypes::EC2, ServiceTypes::S3, ServiceTypes::IAM]
                @cloud.cloud_services.each do |s|
                    if !iaas_services.include?(s.service_type) && s.enabled == true
                        @host = s.host
                        break
                    end
                end
                
                if @host.nil?
                    @host = "localhost"
                end
                
                @uri = URI.parse("http://#{@host}:8080/ASInternal")
        end
        
        def create_account
            createAccountRequest = set_account_request
            createAccountRequest["Action"] = "CreateAccount"

            response = Net::HTTP.post_form(@uri, createAccountRequest)
            if response.body.downcase == "done"
                return {:message => response.body.downcase, :status => 200}
                ::Rails.logger.error("ASInternal =====> CreateAccountResponse: #{response.body}")
            else
                ::Rails.logger.error("ASInternal =====> CreateAccountResponse: #{response.body}")
                return {:message => response.body, :status => 404}
            end
        end
        
        def update_account            
            update_account_request = set_account_request
            update_account_request["Action"] = "UpdateAccount"

            response = Net::HTTP.post_form(@uri, update_account_request)
            if response.body.downcase == "done"
                return {:message => response.body.downcase, :status => 200}
                ::Rails.logger.error("ASInternal =====> UpdateAccountResponse: #{response.body}")
            else
                ::Rails.logger.error("ASInternal =====> UpdateAccountResponse: #{response.body}")
                return {:message => response.body, :status => 404}
            end
        end
        
        def delete_account(access_key, secret_key)
            deleteAccountRequest = {}
            deleteAccountRequest["Action"] = "DeleteAccount"
            deleteAccountRequest["AccessKey"] = access_key
            deleteAccountRequest["SecretKey"] = secret_key
            
            response = Net::HTTP.post_form(@uri, deleteAccountRequest)
            if response.body.downcase == "done"
                return {:message => response.body.downcase, :status => 200}
                ::Rails.logger.error("ASInternal =====> DeleteAccountResponse: #{response.body}")
            else
                ::Rails.logger.error("ASInternal =====> DeleteAccountResponse: #{response.body}")
                return {:message => response.body, :status => 404}
            end
        end
        
        protected
        
        def set_account_request
            accountRequest = {}
            accountRequest["UserName"] = "#{@account.name}_#{@cloud.name}"
            accountRequest["CloudName"] = @cloud.topstack_id
            accountRequest["AccessKey"] = @account.access_key
            accountRequest["SecretKey"] = @account.secret_key
            
            ## Set extra openstack properties if applicable
            unless @account.cloud_attributes["openstack_username"].nil?
                accountRequest["APIUsername"] = @account.cloud_attributes["openstack_username"]
                accountRequest["APIPassword"] = @account.cloud_attributes["openstack_api_key"]
                
                ## Topstack uses tenant ID instead of tenant name as UI does
                keystone_client = Keystone::Client.new(@account.cloud_attributes, {:aws_access_key_id => @account.access_key, :aws_secret_access_key => @account.secret_key})
                accountRequest["APITenant"] = keystone_client.catalog.token["tenant"]
            end
            
            return accountRequest
        end
    
    end
end