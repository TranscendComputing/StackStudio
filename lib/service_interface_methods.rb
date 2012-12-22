module ServiceInterfaceMethods
	def getResourceInterface(account_info)
		@account = $client.cloud_account_details(account_info[:cloud_account_id])
        @cloud = $client.cloud_details(@account.cloud_id)
        
        if @cloud.topstack_enabled == true && @account.topstack_configured == false
            raise ArgumentError, {:message => "Cloud account must be re-saved in order to configure for topstack services.", :title => "ValidationError"}
        end
        
		params = {}
		if account_info[:service] == "EBS"
			account_info[:service] = ServiceTypes::EC2
		end
	        
		CloudTargetOverride.get_cloud_url_params(@account, account_info[:service], params )
	
		aws_options = {}
		aws_options[:connection_options] = {:connect_timeout => 120, :read_timeout => 90, :retry_limit => 4, :write_timeout => 90}
		aws_options[:aws_access_key_id] = @account.access_key
		aws_options[:aws_secret_access_key] = @account.secret_key
		if @account.cloud_provider == CloudConstants::Type::AWS && account_info[:service] != ServiceTypes::IAM && !account_info[:region].nil?
			aws_options[:region] = account_info[:region]
		end
		
		unless params.empty?
			aws_options.merge!(:host => params[:host], :port => params[:port], :path => params[:path], :scheme => params[:scheme])
		end

		case account_info[:service]
		when ServiceTypes::ELB
			return Fog::AWS::ELB.new(aws_options)
		when ServiceTypes::EC2
            options = @account.cloud_attributes.merge(:provider => @account.cloud_provider)
            if options[:provider].downcase == "eucalyptus"
                options[:provider] = "aws"
                options[:version] = "2010-08-31"
                options.merge!(aws_options)
            end
            #For debugging purposes, run through RightAws and fiddler
            if !@debug.nil?
                options = {}
                CloudTargetOverride.get_cloud_url_params(@account, "EC2", options )
                unless options.empty?
                    options[:server] = options[:host]
                    options.delete(:host)
                    options[:protocol] = "http"
                    options[:service] = options[:path]
                    options.delete(:path)
                end
                return RightAws::Ec2.new(@account.access_key, @account.secret_key, options)
			end
			return Fog::Compute.new(options)
		when ServiceTypes::ACW
			return Fog::AWS::CloudWatch.new(aws_options)
		when ServiceTypes::AWSCFN
			return Fog::AWS::CloudFormation.new(aws_options)
			#return AWS::CloudFormation::Client.new(:access_key_id => @account.access_key, :secret_access_key => @account.secret_key)
		when ServiceTypes::AWSEB
            #For debugging purposes, run through RightAws and fiddler
            if !@debug.nil?
                options = {}
                CloudTargetOverride.get_cloud_url_params(@account, "AWSEB", options )
                unless options.empty?
                    options[:server] = options[:host]
                    options.delete(:host)
                    options[:protocol] = "http"
                    options[:service] = options[:path]
                    options.delete(:path)
                end
                return RightAws::AwsEbInterface.new(@account.access_key, @account.secret_key, options)
			end
			return Fog::AWS::ElasticBeanstalk.new(aws_options)
		when ServiceTypes::CDN
			return Fog::CDN::AWS.new(:aws_access_key_id => @account.access_key, :aws_secret_access_key => @account.secret_key)
		when ServiceTypes::RDS
			if !@debug.nil?
                options = {}
                CloudTargetOverride.get_cloud_url_params(@account, "RDS", options )
                unless options.empty?
                    options[:server] = options[:host]
                    options.delete(:host)
                    options[:protocol] = "http"
                    options[:service] = options[:path]
                    options.delete(:path)
                end
                return RightAws::RdsInterface.new(@account.access_key, @account.secret_key, options)
			end
			return Fog::AWS::RDS.new(aws_options)
		when ServiceTypes::S3
            options = @account.cloud_attributes.merge(:provider => @account.cloud_provider) 
            if options[:provider].downcase == "eucalyptus"
                options[:provider] = "aws"
                #options[:version] = "2010-08-31"
                options.merge!(aws_options)
            end
            if !@debug.nil?
                options = {}
                CloudTargetOverride.get_cloud_url_params(@account, "S3", options )
                unless options.empty?
                    options[:server] = options.delete(:host)
                    options[:protocol] = options.delete(:scheme)
                    options[:service] = options.delete(:path)
                end
                return RightAws::S3Interface.new(@account.access_key, @account.secret_key, options)
			end
			           
			if @account.cloud_provider == CloudConstants::Type::OPENSTACK
				keystone_client = Keystone::Client.new(@account.cloud_attributes, aws_options)
				swift_url = "#{aws_options[:scheme]}://#{aws_options[:host]}:#{aws_options[:port]}#{aws_options[:path]}"
				return Openstack::Swift::Client.new(swift_url, options["openstack_username"], options["openstack_api_key"], keystone_client.token)
			else
				return Fog::Storage.new(options)
			end
		when ServiceTypes::AS
			return Fog::AWS::AutoScaling.new(aws_options)
		when ServiceTypes::SQS
			return Fog::AWS::SQS.new(aws_options)
		when ServiceTypes::SDB
			return Fog::AWS::SimpleDB.new(aws_options)
		when ServiceTypes::SNS
			return Fog::AWS::SNS.new(aws_options)
		when ServiceTypes::ELC
			return Fog::AWS::Elasticache.new(aws_options)
		when ServiceTypes::DNS
			return Fog::DNS::AWS.new(aws_options)
		when ServiceTypes::IAM
			case @account.cloud_provider
			when CloudConstants::Type::ESSEX
			when CloudConstants::Type::OPENSTACK
				attributes = @account.cloud_attributes
				return Keystone::Client.new(attributes, aws_options)
			end
			return Fog::AWS::IAM.new(aws_options)
		end
	end
end
