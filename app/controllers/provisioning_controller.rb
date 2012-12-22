class ProvisioningController < ApplicationController
	include ServiceInterfaceMethods
    include ResponseUtilities
    
    before_filter :setup_interface
    
	##################
	#   ACW Actions
	##################
	
	def get_alarm_resources
		@account = $client.cloud_account_details(params[:cloud_account_id])
        @resource_interface = AWS::SNS.new(:access_key_id => @account.access_key, :secret_access_key => @account.secret_key)
		topics = []
		@resource_interface.topics.each do |t|
			topic = t.to_h
			topic.delete(:policy)
			subscriptions = []
			t.subscriptions.each do |subscription|
				subscriptions << {:endpoint => subscription.endpoint, :protocol => subscription.protocol.to_s, :subscription_arn => subscription.arn}
	        	end
			topic.merge(:subscriptions => subscriptions)
			topics << topic
		end
		cloud_id = $client.cloud_account_details(params[:cloud_account_id]).cloud_id
		prices = get_prices("alarm", cloud_id)
		resources = {:topics => topics, :prices => prices}
		render :json => resources
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code         
	end

	def describe_alarms
		@acw = getResourceInterface(params)
		alarms = @acw.describe_alarms.body["DescribeAlarmsResult"]["MetricAlarms"]
		render :json => alarms
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code         
	end
	
	def put_metric_alarm
		if params[:alarm_actions] == "null"
			alarm_actions = []
		else
			alarm_actions = JSON.parse(params[:alarm_actions])
		end
		if params[:ok_actions] == "null"
			ok_actions = []
		else
			ok_actions = JSON.parse(params[:ok_actions])
		end
		if params[:insufficient_actions] == "null"
			insufficient_actions = []
		else
			insufficient_actions = JSON.parse(params[:insufficient_actions])
		end
		options = {}
		options["AlarmActions"] = alarm_actions unless alarm_actions.length == 0
		options["AlarmDescription"] = params[:description] unless params[:description].nil?
		options["AlarmName"] = params[:name]
		options["ComparisonOperator"] = params[:comparison]
		options["Dimensions"] = [{"Name"=>params[:dimension_name],"Value"=>params[:dimension_value]}]
		options["EvaluationPeriods"] = params[:eval_periods].to_i
		options["InsufficientDataActions"] = insufficient_actions unless insufficient_actions.length == 0
		options["MetricName"] = params[:metric_name]
		options["Namespace"] = params[:namespace]
		options["OKActions"] = ok_actions unless ok_actions.length == 0
		options["Period"] = params[:period].to_i
		options["Statistic"] = params[:statistic]
		options["Threshold"] = params[:threshold].to_f
		options["Unit"] = params[:unit]
		@resource_interface.put_metric_alarm(options)
        
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
		render :json => @response.to_json, :status => @status_code         
	end
    
    def delete_alarm
    	@resource_interface.delete_alarms([params['physical_id']])
        
        # Setup audit log info
        @physical_resource_id = params['physical_id']
        audit_log
    	render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params['physical_id']
        audit_log
		render :json => @response.to_json, :status => @status_code         
    end
    
	##################
	#   AS Actions
	##################
    
	def describe_auto_scaling_groups
		if params[:physical_id].nil?
			response = @resource_interface.describe_auto_scaling_groups.body["DescribeAutoScalingGroupsResult"]["AutoScalingGroups"]
		else
			grps = @resource_interface.describe_auto_scaling_groups({"AutoScalingGroupNames" => [params[:physical_id]]}).body["DescribeAutoScalingGroupsResult"]["AutoScalingGroups"]
            #Fog returns empty items, so we will parse these out
            grps.each do |grp|
                unless grp["AutoScalingGroupName"].nil?
                    response = grp
                    break
                end
            end
		end
		
		render :json => response
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code         
	end

	def launch_auto_scaling_group
		params[:service] = "ACW"
		@acw = getResourceInterface(params)
        
        name = params[:name]
        launch_config_name = name + "-lc"
        
        # Instantiate new launch config, set parameters, save
        config = @resource_interface.configurations.new
        config.id                   = launch_config_name
        config.image_id             = params[:image_id]
        config.instance_type        = params[:flavor_id]
        config.key_name             = params[:key_name] unless params[:key_name].nil?
        config.security_groups      = Array(JSON.parse(params[:security_groups]))
        config.instance_monitoring  = (params[:monitoring] == true)
    	config.save
		
        # Instantiate new auto scaled group, set parameters, save
        group = @resource_interface.groups.new
        group.id                            = name
        group.availability_zones            = params[:availability_zone]
        group.launch_configuration_name     = launch_config_name
        group.max_size                      = params[:max_size]
        group.min_size                      = params[:min_size]
        group.desired_capacity              = params[:desired_capacity] || params[:min_size]
        group.save
        
       		
   		if(params[:trigger])
            scale_up_name = group.id + "ScaleUpPolicy"
            
            # Instantiate new auto scaled group trigger, set parameters, save
            up_policy = @resource_interface.policies.new
            up_policy.adjustment_type          = params[:adjustment_type] unless params[:adjustment_type].nil?
            up_policy.auto_scaling_group_name  = group.id
            up_policy.id                       = scale_up_name
            up_policy.scaling_adjustment       = params[:scale_increment] unless params[:scale_increment].nil?
			#create scale up policy and metric alarm
			
			upOptions = {}
			upOptions["AlarmName"] = group.id + params[:trigger_measurement] + "UpAlarm"
			upOptions["AlarmActions"] = [up_policy.arn]
			upOptions["Dimensions"] = [{'Name' => "AutoScalingGroupName", 'Value' => group.id}]
			upOptions["ComparisonOperator"] = "GreaterThanThreshold"
			upOptions["Namespace"] = "AWS/EC2"
			upOptions["EvaluationPeriods"] = 1
			upOptions["MetricName"] = params[:trigger_measurement]
			upOptions["Period"] = params[:measure_period]
			upOptions["Statistic"] = params[:trigger_statistic]
			upOptions["Threshold"] = params[:upper_threshold]
			upOptions["Unit"] = params[:trigger_unit]
			@acw.put_metric_alarm(upOptions)
   			
   			#create scale down policy and metric alarm
   			scaleDownName = name + "ScaleDownPolicy"
   			downPolicy = @resource_interface.put_scaling_policy("ChangeInCapacity", name, scaleDownName, params[:scale_decrement]).body["PutScalingPolicyResult"]["PolicyARN"]
   			downOptions = {}
   			downOptions["AlarmName"] = name + params[:trigger_measurement] + "DownAlarm"
   			downOptions["AlarmActions"] = [downPolicy]
   			downOptions["Dimensions"] = [{"Name" => "AutoScalingGroupName", "Value" => name}]
   			downOptions["ComparisonOperator"] = "LessThanThreshold"
   			downOptions["Namespace"] = "AWS/EC2"
   			downOptions["EvaluationPeriods"] = 1
   			downOptions["MetricName"] = params[:trigger_measurement]
   			downOptions["Period"] = params[:measure_period]
   			downOptions["Statistic"] = params[:trigger_statistic]
   			downOptions["Threshold"] = params[:lower_threshold]
   			downOptions["Unit"] = params[:trigger_unit]
   			@acw.put_metric_alarm(downOptions)
   		end
        
        # Setup audit log info
        @logical_resource_id = params[:name]
        @physical_resource_id = group.arn
		audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        
        # Setup audit log info
        @logical_resource_id = params[:name]
        audit_log
		render :json => @response.to_json, :status => @status_code         
	end
    
	def create_launch_configuration
        @resource_interface = getResourceInterface(params)
        audit_log
		render :json => @resource_interface.create_launch_configuration()
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        audit_log
		render :json => @response.to_json, :status => @status_code         
	end

	def delete_auto_scaling_group
		@as = getResourceInterface(params)
		policies = @as.describe_policies({"AutoScalingGroupName" => params[:physical_id]}).body["DescribePoliciesResult"]["ScalingPolicies"]
		policies.each do |t|
			@as.delete_policy(params[:physical_id], t["PolicyName"]) unless t["PolicyName"].nil?
		end
		@as.delete_auto_scaling_group(params[:physical_id])
		@as.delete_launch_configuration(params[:child_id]) unless params[:child_id].nil?
        
        # Setup audit log info
        @logical_resource_id  = params[:physical_id]
        @physical_resource_id = params[:physical_id]
        audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @logical_resource_id  = params[:physical_id]
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code         
	end

	def spin_down_auto_scale
		@as = getResourceInterface(params)
		@as.update_auto_scaling_group(params[:physical_id], {"MinSize" => 0, "MaxSize" => 0, "DesiredCapacity" => 0})
        # Setup audit log info
        @logical_resource_id  = params[:physical_id]
        @physical_resource_id = params[:physical_id]
        audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @logical_resource_id  = params[:physical_id]
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code         
	end
    
    #######################
    #   ASInternal Actions
    #
    #   // Used for TopStack internal purposes
    #   // Also used for creating new cloud accounts
    #
    #######################

    def create_cloud_account
        acct_params = params[:account][:cloud_account]
        
        @account = StackPlace::CloudAccount.new
        @account.name                =   acct_params[:name]
        @account.description         =   acct_params[:description]
        @account.access_key          =   acct_params[:access_key]
        @account.secret_key          =   acct_params[:secret_key]
        @account.cloud_attributes    =   acct_params[:cloud_attributes]
        @account.stack_preferences   =   acct_params[:stack_preferences] unless acct_params[:stack_preferences].nil?
        
        @cloud = $client.cloud_details(params[:cloud_id])
        
        if @cloud.topstack_enabled == false
            @account = $client.create_cloud_account(params[:user_id], params[:cloud_id], @account)
            render :json => @account.to_json
        else        
            require "#{Rails.root}/lib/top_stack/rest_client.rb"
            cli = TopStack::RestClient.new(@cloud, @account)
            response = cli.create_account
            
            if response[:message] == TopStack::RestClient::ALREADY_EXISTS
                response = cli.update_account
            end
            
            if response[:status] == 200
                @account.topstack_configured = true
                @account = $client.create_cloud_account(params[:user_id], params[:cloud_id], @account)
                render :json => @account.to_json
            else
                render :nothing => true, :status => response[:status]
            end
        end
    end
    
    def update_cloud_account
        acct_params = params[:account][:cloud_account]
        
        @account = $client.cloud_account_details(params[:cloud_account_id])
        
        @account.name                =   acct_params[:name]
        @account.description         =   acct_params[:description]
        @account.access_key          =   acct_params[:access_key]
        @account.secret_key          =   acct_params[:secret_key]
        @account.cloud_attributes    =   acct_params[:cloud_attributes]
        @account.stack_preferences   =   acct_params[:stack_preferences]
        
        @cloud = $client.cloud_details(params[:cloud_id])
 
        if @cloud.topstack_enabled == false
            @account = $client.update_cloud_account(params[:user_id], params[:cloud_id], @account)
            render :json => @account.to_json
        else        
            require "#{Rails.root}/lib/top_stack/rest_client.rb"
            cli = TopStack::RestClient.new(@cloud, @account)
            
            if @account.topstack_configured == false
                response = cli.create_account
                if response[:message] == TopStack::RestClient::ALREADY_EXISTS
                    response = cli.update_account
                end
            else
                response = cli.update_account
            end
            
            if response[:status] == 200
                @account.topstack_configured = true
                @account = $client.update_cloud_account(params[:user_id], params[:cloud_id], @account)
                render :json => @account.to_json
            else
                render :nothing => true, :status => response[:status]
            end
        end
    end
    
    def delete_cloud_account
        @cloud = $client.cloud_details(params[:cloud_id])
        
        if @cloud.topstack_enabled == false
            @account = $client.delete_cloud_account(params[:user_id], params[:account_id])
            render :json => @account.to_json
        else        
            require "#{Rails.root}/lib/top_stack/rest_client.rb"
            cli = TopStack::RestClient.new(@cloud)
            response = cli.delete_account(params[:old_access_key], params[:old_secret_key])
            if response[:message] == TopStack::RestClient::DONE || response[:message] == TopStack::RestClient::ACCOUNT_NOT_FOUND
                @account = $client.delete_cloud_account(params[:user_id], params[:account_id])
                render :json => @account.to_json
            else
                render :nothing => true, :status => response[:status]
            end
        end
    end
	
	##################
	#   AWSCFN Actions
	##################
    
	def create_stack
		keys = params[:parameterKeys].split(",")
		values = params[:parameterValues].split(",")
		stack_parameters = {}
		keys.each_with_index do |k,i|
			stack_parameters[k] = values[i]
		end

		options = {}
		options["NotificationARNs"] = [params[:sns_topic]] unless params[:sns_topic].right_blank?
		options["TimeoutInMinutes"] = params[:creation_timeout] unless params[:creation_timeout].nil?
		options["DisableRollback"] = params[:disable_rollback] || true
		options["TemplateBody"] = params[:body]
		options["Parameters"] = stack_parameters unless stack_parameters == {}
		options["Capabilities"] = ["CAPABILITY_IAM"]

        @resource_interface = getResourceInterface(params)
		stack_id = @resource_interface.create_stack(params[:name], options).body["StackId"]

        # Setup audit log info
        @logical_resource_id  = params[:name]
        @physical_resource_id = stack_id
		audit_log
		render :json => stack_id
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @logical_resource_id  = params[:name]
        audit_log
		render :json => @response.to_json, :status => @status_code 
	end
    
    def update_stack
		keys = params[:parameterKeys].split(",")
		values = params[:parameterValues].split(",")
		stack_parameters = {}
		keys.each_with_index do |k,i|
			stack_parameters[k] = values[i]
		end

		options = {}
		options["TemplateBody"] = params[:body]
		options["Parameters"] = stack_parameters unless stack_parameters == {}
		options["Capabilities"] = ["CAPABILITY_IAM"]

		@resource_interface = getResourceInterface(params)
		stack_id = @resource_interface.update_stack(params[:name], options).body["StackId"]

        # Setup audit log info
        @logical_resource_id  = params[:name]
        @physical_resource_id = stack_id
		audit_log
		render :json => stack_id
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @logical_resource_id  = params[:name]
        audit_log
		render :json => @response.to_json, :status => @status_code 
    end
    
    def convert_json
        template = params.delete(:template_body)
        template_json = JSON.parse(template.to_json)
        render :text => JSON.pretty_generate(template_json)
    end

	def validate_template
		case params[:source]
        when "stackplace"
			url = StackPlace::Config.host
			url += "/stackplace/v1/templates/"
			url +=  params[:data]
			url += "/raw"
            open(url, :ssl_verify_mode => OpenSSL::SSL::VERIFY_NONE){ |f| @template = f.read }
        when "upload"
            @template = params[:data]
        when "url"
            open(params[:data], :ssl_verify_mode => OpenSSL::SSL::VERIFY_NONE){ |f| @template = f.read }
		end
		@resource_interface = getResourceInterface(params)
		validation = @resource_interface.validate_template({"TemplateBody" => @template})
		render :json => validation
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code 
	end

	def delete_stack
		@resource_interface = getResourceInterface(params)
		response = @resource_interface.delete_stack(params[:stack_name])
        
        # Setup audit log info
        @logical_resource_id  = params[:stack_name]
		audit_log
		render :json => response
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @logical_resource_id  = params[:stack_name]
        audit_log
		render :json => @response.to_json, :status => @status_code 
	end
    
    def describe_stacks
        @resource_interface = getResourceInterface(params)
        if params[:stack_name].nil?
            response = @resource_interface.describe_stacks
            render :json => response.body["Stacks"]
        else
            response = @resource_interface.describe_stacks({"StackName" => params[:stack_name]})
            render :json => response.body["Stacks"].first
        end
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code       
    end

	def describe_stack_resources
		@resource_interface = getResourceInterface(params)
		render :json => @resource_interface.describe_stack_resources({"StackName" => params[:stack_name]}).body["StackResources"]
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code 
	end

	def describe_stack_events
		@resource_interface = getResourceInterface(params)
		render :json => @resource_interface.describe_stack_events(params[:stack_name]).body["StackEvents"]
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code 
	end
	
	def describe_embedded_stack
		@resource_interface = getResourceInterface(params)
		begin
			stack = @resource_interface.describe_stacks({"StackName" => params[:physical_id]}).body["Stacks"].first
			events = @resource_interface.describe_stack_events(stack[:stack_name]).body["StackEvents"]
			if(!stack["StackStatus"].nil?)
				case stack["StackStatus"]
					when "CREATE_IN_PROGRESS"
						stack_status = "launching"
					when "CREATE_COMPLETE"
						stack_status = "available"
					when "CREATE_FAILED"
						stack_status = "failed launch"
					when "DELETE_IN_PROGRESS"
						stack_status = "deleting"
					when "DELETE_COMPLETE"
						stack_status = "terminated"
					when "DELETE_FAILED"
						stack_status = "failed shut-down"
					when "ROLLBACK_COMPLETE"
						stack_status = "failed launch"
					when "ROLLBACK_IN_PROGRESS"
						stack_status = "failed launch"
					when "ROLLBACK_FAILED"
						stack_status = "failed launch"
					else
						stack_status = "launching"
				end
			else
				stack_status = "launching"
			end
		
			if stack_status == "available"
				template = @resource_interface.get_template(stack[:stack_name]).body["TemplateBody"]
				resources = @resource_interface.describe_stack_resources({"StackName" => stack["StackName"]}).stack_resources
				stack_details = {:stack => stack, :resources => resources, :events => events, :template => template,:aws_state => stack_status}
			else
				stack_details = {:stack => stack, :events => events, :aws_state => stack_status}
			end
		
			render :json => stack_details
    rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code 
	    end
	end

	##################
	#   AWSEB Actions
	##################
    	
	def describe_applications
		@resource_interface = getResourceInterface(params)
		if params[:physical_id].nil?
			applications = []
			@resource_interface.applications.each do |app|
				application = app.attributes
				environments = []
				app.environments.each do |e|
					env = e.attributes
                    begin
                        env[:resources] = @resource_interface.describe_environment_resources({"EnvironmentName"=>e.name}).body["DescribeEnvironmentResourcesResult"]["EnvironmentResources"]
                    rescue Excon::Errors::SocketError => error
                        env[:resources] = []
                    rescue Fog::AWS::ElasticBeanstalk::InvalidParameterError => error
                        env[:resources] = []
                    end
					environments << env
				end
				versions = []
				app.versions.each {|version| versions << version.attributes}
				events = []
				app.events.each {|event| events << event.attributes}
				applications << application.merge(:environments => environments, :versions => versions, :events => events)
			end
			render :json => applications
		else
			app = @resource_interface.applications.get(params[:physical_id])
            application = app.attributes
            environments = []
            app.environments.each do |e|
                env = e.attributes
                begin
                    env[:resources] = @resource_interface.describe_environment_resources({"EnvironmentName"=>e.name}).body["DescribeEnvironmentResourcesResult"]["EnvironmentResources"]
                rescue Excon::Errors::SocketError => error
                    env[:resources] = []
                rescue Fog::AWS::ElasticBeanstalk::InvalidParameterError => error
                        env[:resources] = []
                end
                environments << env
            end
            versions = []
            app.versions.each {|version| versions << version.attributes}
            events = []
            app.events.each {|event| events << event.attributes}
            application.merge!(:environments => environments, :versions => versions, :events => events)
			render :json => application
		end
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code        
	end
	
	def get_beanstalk_resources
		@bean = getResourceInterface(params)
		solution_stacks = @bean.list_available_solution_stacks.body["ListAvailableSolutionStacksResult"]["SolutionStackDetails"]
        
		cloud_id = $client.cloud_account_details(params[:cloud_account_id]).cloud_id
		prices = get_prices("compute", cloud_id)
        
        params[:service] = "EC2"
        @ec2 = getResourceInterface(params)
        key_pairs = []
        @ec2.key_pairs.each {|key| key_pairs << key.attributes}
        
        params[:service] = "S3"
        set_storage(params)
        buckets = []
        if $storage.is_a?Openstack::Swift::Client
            $storage.list_containers.each {|dir| buckets << Bucket.new(dir).to_json}
        else
            $storage.directories.each {|dir| buckets << dir.attributes}
        end
        
		resources = {"solutionStacks" => solution_stacks, "prices" => prices, "key_pairs" => key_pairs, "buckets" => buckets}
		render :json => resources
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code         
	end

	def create_application		
		@resource_interface = getResourceInterface(params)
     
		# Get properties from parameters sent
		application_properties = params["ApplicationProperties"]
		version_properties = application_properties["ApplicationVersions"][0]
		environment_properties = params["EnvironmentProperties"]
        
        # Create initial version and set auto_create_application to 'true' 
		version = @resource_interface.versions.new
		version.auto_create_application = true
		version.label = version_properties["VersionLabel"]
		version.application_name = params["ApplicationName"]
		version.description = application_properties["Description"] unless application_properties["Description"].right_blank?
		version.source_bundle = version_properties["SourceBundle"] unless version_properties["SourceBundle"].nil?
		version.save

		# If needed, create application environment
		unless environment_properties.nil?
			environment = @resource_interface.environments.new
			environment.name = params["EnvironmentName"]
			environment.application_name = params["ApplicationName"]
			environment.cname_prefix = environment_properties["CNAMEPrefix"]
			environment.description = environment_properties["Description"]
			environment.option_settings = environment_properties["OptionSettings"]
			environment.solution_stack_name = environment_properties["SolutionStackName"]
			environment.template_name = environment_properties["TemplateName"]
			environment.version_label = version.label
			environment.save
		end

        # Setup audit log info
        @physical_resource_id = params['ApplicationName']
		audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params['ApplicationName']
        audit_log
		render :json => @response.to_json, :status => @status_code         
	end
    
	def create_application_versions
        @resource_interface = getResourceInterface(params)
		version = @resource_interface.versions.new
		version.label = params["VersionLabel"]
		version.application_name = params["ApplicationName"]
		version.description = params["Description"] unless params["Description"].right_blank?
		version.source_bundle = params["SourceBundle"] unless params["SourceBundle"].nil?
		version.save
        
        # Setup audit log info
        @physical_resource_id = params['ApplicationName']
        audit_log
		render :json => version.attributes
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params['ApplicationName']
        audit_log
		render :json => @response.to_json, :status => @status_code         
	end
    
	def create_environment
		@resource_interface = getResourceInterface(params)
		environment = @resource_interface.environments.new
        options = params[:options]
		environment.name = params[:name]
        
        if options["ApplicationName"].is_a?Hash
            options["ApplicationName"] = options["ApplicationName"].delete("Ref")
        end
		environment.application_name = options["ApplicationName"]
		environment.cname_prefix = options["CNAMEPrefix"]
		environment.description = options["Description"]
		environment.option_settings = options["OptionSettings"]
        environment.options_to_remove = options["OptionsToRemove"]
		environment.solution_stack_name = options["SolutionStackName"]
		environment.template_name = options["TemplateName"]
		environment.version_label = options["VersionLabel"]
		environment.save
        
        # Setup audit log info
        @physical_resource_id = params['ApplicationName']
        audit_log
		render :json => environment.attributes
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params['ApplicationName']
        audit_log
		render :json => @response.to_json, :status => @status_code         
	end

	def list_available_solution_stacks
		@resource_interface = getResourceInterface(params)
		render :json => @resource_interface.list_available_solution_stacks.body["ListAvailableSolutionStacksResult"]["SolutionStackDetails"]
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code        
	end

	def describe_environment_events
		@resource_interface = getResourceInterface(params)
		options = {}
		options[:environment_id] = params[:environment_id]
   		options[:severity] = params[:severity] unless params[:severity].nil?
		render :json => @resource_interface.describe_events(params)
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code        
	end
    
    def describe_beanstalk_events
        @resource_interface = getResourceInterface(params)
        response = @resource_interface.events.all(params[:filters])
        events = []
        response.each {|event| events << event.attributes}
        render :json => events
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code        
    end

	def describe_environments
		@resource_interface = getResourceInterface(params)
		environments = []
        response = @resource_interface.environments.all(params[:filters])
        response.each {|env| environments << env.attributes}
		render :json => environments
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code        
	end
	
	def destroy_beanstalk
		@resource_interface = getResourceInterface(params)
		application = @resource_interface.applications.get(params[:physical_id])
		application.environments.each {|environment| environment.destroy}
		application.destroy
        
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
		audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code
	end
    
    def check_dns_availability
        @resource_interface = getResourceInterface(params)
        render :json => @resource_interface.check_dns_availability({"CNAMEPrefix"=>params[:cname]}).body["CheckDNSAvailabilityResult"]
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code        
    end
	
	##################
	#   CDN Actions
	##################
	
	def get_distribution
		@resource_interface = getResourceInterface(params)
		begin
			cdn = @resource_interface.get_distribution(params[:physical_id]).body
			case cdn["Status"]
				when "InProgress"
					status = "launching"
				when "Deployed"
					status = "available"
			end
		rescue Excon::Errors::NotFound => error
			cdn = nil
			status = "launching"
		end
		
		resource = {:cdn => cdn, :aws_state => status}
		render :json => resource
	end

	##################
	#  Chef Actions
	##################
	
	def get_roles
        cloud_account = $client.cloud_account_details(params[:cloud_account_id])
        preferences = cloud_account.stack_preferences
        url = preferences["chef_server_url"]
        roles = []
        
        Spice.setup do |s|
                s.server_url  = preferences["chef_server_url"]
                s.client_name = Socket.gethostname
                s.client_key    = Spice.read_key_file("/etc/chef/#{Socket.gethostname}_client.pem")
        end
        
        connection = Spice::Connection.new
        connection.roles.each do |r|
            #roles << r.attrs
            
            cookbooks = []
            r.run_list.each do |recipe|
                unless recipe.match("recipe").nil?
                    recipe_name = recipe.split("recipe[")[1].split("]")[0]
                    connection.cookbook(recipe_name).versions.each do |version|
                        cookbook = connection.cookbook_version(recipe_name, version)
                        cookbooks << cookbook.attrs
                    end
                    
                end
            end
            
            role_attributes = r.attrs
            role_attributes["cookbooks"] = cookbooks
            
            roles << role_attributes
            
        end
        
        render :json => roles
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code
	end
    
    ##################
	#   Puppet Actions
	##################
    
    def get_puppet_modules
        cloud_account = $client.cloud_account_details(params[:cloud_account_id])
        preferences = cloud_account.stack_preferences
        url = preferences["puppet_server_url"]
        
        require "#{Rails.root}/lib/puppet/rest_client.rb"
        
        cli = Puppet::RestClient.new(url)
        modules = cli.list_module_resources
        
        render :json => modules
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code
	end

	##################
	#   DNS Actions
	##################
	
	def list_hosted_zones
		render :json => @resource_interface.list_hosted_zones.body["HostedZones"]
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code        
	end

	def list_resource_record_sets
		render :json => @resource_interface.list_resource_record_sets(params[:zone_id]).body["ResourceRecordSets"]
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code        
	end
	
	def get_dns_prices
		cloud_id = $client.cloud_account_details(params[:cloud_account_id]).cloud_id
		prices = get_prices("dns", cloud_id)
		render :json => prices
	end
	
	def create_hosted_zone
		options = {}
		options[:comment] = params[:comment] unless params[:comment].nil?
        #Temporary passing of caller ref, just to test that Topstack service works
        options[:caller_ref] = "ref#{rand(1000000).to_s}"
		@resource_interface.create_hosted_zone(params[:name], options)
        
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
		render :json => @response.to_json, :status => @status_code        
	end
	
	def create_record_set
		change_batch = []
		change = {}
		change[:action] = 'CREATE'
		change[:name] = params[:name]
		change[:type] = params[:type]
		change[:ttl] = params[:ttl] unless params[:ttl] == "-1"
		change[:resource_records] = []
		values = params[:value].split("\n")
		values.each do |t|
			change[:resource_records] << t.to_s
		end
		change_batch << change
		@resource_interface.change_resource_record_sets(params[:zone_id], change_batch)
        
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
		render :json => @response.to_json, :status => @status_code        
	end
	
	def edit_record_set
		change_batch = []
		delete_change = {}
		create_change = {}

		delete_change[:action] = 'DELETE'
		delete_change[:name] = params[:previous_name]
		delete_change[:type] = params[:previous_type]
		delete_change[:ttl] = params[:previous_ttl]
		delete_change[:resource_records] = []
		values_one = params[:previous_value].split("\n")
		values_one.each do |t|
			delete_change[:resource_records] << t.to_s
		end

		create_change[:action] = 'CREATE'
		create_change[:name] = params[:name]
		create_change[:type] = params[:type]
		create_change[:ttl] = params[:ttl] unless params[:ttl] == "-1"
		create_change[:resource_records] = []
		values_two = params[:value].split("\n")
		values_two.each do |t|
			create_change[:resource_records] << t.to_s
		end
		change_batch << delete_change
		change_batch << create_change
		@resource_interface.change_resource_record_sets(params[:zone_id], change_batch)
        
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
		render :json => @response.to_json, :status => @status_code        
    end
	
	def delete_hosted_zone
		@resource_interface.delete_hosted_zone(params[:physical_id])
        
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code
	end
	
	def delete_record_set
		record = JSON.parse(params[:resource_object])
		change_batch = []
		change = {}
		change[:action] = 'DELETE'
		change[:name] = record["name"]
		change[:type] = record["type"]
		change[:ttl] = record["ttl"]
		change[:resource_records] = []
		values = record["value"].split("\n")
		values.each do |t|
			change[:resource_records] << t.to_s
		end
		change_batch << change
		@resource_interface.change_resource_record_sets(record["zone_id"], change_batch)
        
        # Setup audit log info
        @physical_resource_id = record["name"]
		audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = record["name"]
        audit_log
		render :json => @response.to_json, :status => @status_code        
	end


		
	##################
	#   EC2 Actions
	##################
    
    def create_security_group
        @resource_interface = getResourceInterface(params)
        security_group = @resource_interface.security_groups.new(:name => params[:group_name], :description => params[:description])
        security_group.save
        
        # Setup audit log info
        @physical_resource_id = params[:group_name]
        audit_log
        render :json => security_group.attributes
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:group_name]
        audit_log
		render :json => @response.to_json, :status => @status_code        
    end
    
    def start_instance
        @resource_interface = getResourceInterface(params)
        server = @resource_interface.servers.get(params[:physical_id])
        server.start
        
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
        render :json => server.attributes
    rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code
    end

    def stop_instance
        @resource_interface = getResourceInterface(params)
        server = @resource_interface.servers.get(params[:physical_id])
        server.stop
        
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
        render :json => server.attributes
    rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code
    end
	
	def describe_availability_zones
		render :json => @resource_interface.describe_availability_zones.body["availabilityZoneInfo"]
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code        
	end

	def describe_snapshots
		@resource_interface = getResourceInterface(params)
		render :json => @resource_interface.describe_snapshots.to_json
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code
	end

	def delete_security_group
		@resource_interface = getResourceInterface(params)
		group = @resource_interface.security_groups.get(params[:physical_id])
		group.destroy
        
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code
	end


	def describe_security_groups
		set_compute(params)
        if params[:physical_id].nil?
            security_groups = []
            
            security_groups = []
            $compute.security_groups.each do |grp|
                # Do not return groups without a name (fog gem returns some blank groups), or topstack generated groups
                if !grp.name.nil? && grp.name.match(/rds-/).nil? && grp.name.match(/__elb/).nil? && grp.name.match(/__ecache_/).nil?
                    security_groups << grp.attributes
                end
            end
            
			render :json => security_groups
		else
			render :json => $compute.security_groups.get(params[:physical_id]).to_json
		end
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code
	end

	def describe_instances
		set_compute(params)		
		parser = MultiCloudParser::Compute.new
        if params[:physical_id].nil?
            resources = {}
            servers = []
            $compute.servers.each do |s|
                if !s.id.nil?
                    servers << s
                end
            end
            formatted_servers = parser.describe_instances_parser(@attributes[:provider], servers, @cloud, @account)
            
            security_groups = []
			# Will not work as if using OR ("||") to keep this from entering, syntax error
			if !$compute.is_a?Fog::Compute::Rackspace::Real
				if !$compute.is_a?Fog::Compute::Joyent::Real
					$compute.security_groups.each do |group|
						if !group.name.nil? && group.name.match(/rds-/).nil? && group.name.match(/__elb/).nil? && group.name.match(/__ecache_/).nil?
							 security_groups << group.attributes
						end
					end
				end
			end
            
            reserved_instances = []
			spot_instances = []
			elastic_ips = []
            if @account.cloud_provider == CloudConstants::Type::AWS
                reserved_instances = $compute.describe_reserved_instances.body["reservedInstancesSet"]
				spot_instances = $compute.describe_spot_instance_requests.body["spotInstanceRequestSet"]
				elastic_ips = $compute.describe_addresses.body["addressesSet"]
            end
			
			key_pairs = []
			if @account.cloud_provider == CloudConstants::Type::JOYENT
				$compute.keys.each do |key|
					key = key.attributes
					key[:public_key] = key[:key]
					key.delete(:key)
					key_pairs << key
				end
			elsif @account.cloud_provider == CloudConstants::Type::CLOUDSTACK
				$compute.list_ssh_key_pairs["listsshkeypairsresponse"]["sshkeypair"].each do |key|
					key_pairs << key
				end
			#All others work the same, but Rackspace does not support keypairs
			elsif @account.cloud_provider != CloudConstants::Type::RACKSPACE
				$compute.key_pairs.each do |key|
					key_pairs << key.attributes
				end
			end
             
             resources[:instances] = formatted_servers
             resources[:security_groups] = security_groups
             resources[:reserved_instances] = reserved_instances
			 resources[:spot_instances] = spot_instances
			 resources[:elastic_ips] = elastic_ips
			 resources[:key_pairs] = key_pairs
             render :json => resources
        else
            server = $compute.servers.get(params[:physical_id])
            formatted_server = parser.describe_instance_parser(@attributes[:provider], server, @cloud, @account)
            render :json => formatted_server
        end
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code        
	end
	
	def describe_instances_by_zone
		set_compute(params)
		case @attributes[:provider]
			when CloudConstants::Type::AWS
                begin
                    servers = $compute.servers.all("availability-zone"=>params[:availability_zone])
                rescue
                    servers = []
                    result = $compute.servers.all
                    result.each do |s|
                        if s.availability_zone == params[:availability_zone] && s.key_name.match(/__key/).nil?
                            servers << s
                        end
                    end
                end
				parser = MultiCloudParser::Compute.new
				formatted_servers = parser.describe_instances_parser(@attributes[:provider], servers, @cloud)
				render :json => formatted_servers
			when CloudConstants::Type::CLOUDSTACK
				servers = $compute.list_virtual_machines({:zoneid=>params[:availability_zone]})["listvirtualmachinesresponse"]["virtualmachine"] || []
				render :json => servers
			when CloudConstants::Type::OPENSTACK
				servers = $compute.servers
				parser = MultiCloudParser::Compute.new
				formatted_servers = parser.describe_instances_parser(@attributes[:provider], servers, @cloud)
				render :json => formatted_servers
		end
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code        
	end

	def describe_instance_attribute
		@resource_interface = getResourceInterface(params)
		render :text =>  @resource_interface.describe_instance_attribute(params[:physical_id], params[:attribute])
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code
	end
	
	def reboot_instance
		set_compute(params)
		server = $compute.servers.get(params[:physical_id])
		server.reboot
		audit_log
		render :json => server.attributes
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code    
	end
	
	def get_console_output
		set_compute(params)
		result = $compute.get_console_output(params[:physical_id]).body["output"]
		audit_log
		render :json => result
	rescue => error
		@response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code  
	end

	def describe_volumes
        if params[:physical_id].nil?
            set_compute(params)
            volumes = $compute.volumes
            parser = MultiCloudParser::Compute.new
            formatted_volumes = parser.describe_volumes_parser(@attributes[:provider], volumes, @account)
            render :json => formatted_volumes
        else
            volume = $compute.volumes.get(params[:physical_id])
            formatted_volume = parser.describe_volume_parser(@attributes[:provider], volume, @cloud, @account)
            render :json => formatted_volume
        end
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code        
	end
    
	def allocate_address
		set_compute(params)
		address = {}
		case @attributes[:provider]
			when CloudConstants::Type::AWS
				address[:public_ip] = $compute.allocate_address.body["publicIp"]
			when CloudConstants::Type::HP, CloudConstants::Type::OPENSTACK
				address[:public_ip] = $compute.allocate_address.body["floating_ip"]["ip"]
		end
        
        audit_log
		#Response: {:public_ip => "172.31.255.11"}
		render :json => address
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        audit_log
		render :json => @response.to_json, :status => @status_code        
	end

	def associate_address
		set_compute(params)
		case @attributes[:provider]
			when CloudConstants::Type::AWS, CloudConstants::Type::HP, CloudConstants::Type::OPENSTACK
				$compute.associate_address(params[:instance_id], params[:address])
		end
        
        # Setup audit log info
        @physical_resource_id = params[:instance_id]
		audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:instance_id]
        audit_log
		render :json => @response.to_json, :status => @status_code        
	end

	def disassociate_address
		set_compute(params)
		if params[:address].nil?
			params[:address] = params[:physical_id]
		end
		
		case @attributes[:provider]
			when CloudConstants::Type::AWS
				$compute.disassociate_address(params[:address])
			when CloudConstants::Type::HP, CloudConstants::Type::OPENSTACK
				$compute.disassociate_address(params[:instance_id], params[:address])
		end
        
        # Setup audit log info
        @physical_resource_id = params[:instance_id]
		audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:instance_id]
        audit_log
		render :json => @response.to_json, :status => @status_code	
	end

	def release_address
		set_compute(params)
		if params[:address].nil?
			params[:address] = params[:physical_id]
		end
		
		case @attributes[:provider]
			when CloudConstants::Type::AWS
				$compute.release_address(params[:address])
			when CloudConstants::Type::HP, CloudConstants::Type::OPENSTACK
				#must release_address with address id
				$compute.addresses.each do |t|
					if t.ip == params[:address]
						$compute.release_address(t.id)
					end
				end
		end
        
        # Setup audit log info
        @physical_resource_id = params[:address]
		audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:address]
        audit_log
		render :json => @response.to_json, :status => @status_code        
	end	    
    
	def create_tags
		@resource_interface = getResourceInterface(params)
        audit_log
		render :json => @resource_interface.create_tags()
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        audit_log
		render :json => @response.to_json, :status => @status_code
	end
    
	def create_volume
		set_compute(params)
		case @attributes[:provider]
			when CloudConstants::Type::AWS
				options = params
			when CloudConstants::Type::CLOUDSTACK
				options = {}
				options[:name] = params[:name]
				options[:zone_id] = params[:availability_zone]
				options[:disk_offering_id] = params[:disk_offering_id] unless params[:disk_offering_id].nil?
				options[:snapshot_id] = params[:snapshot_id] unless params[:snapshot_id].nil?
			when CloudConstants::Type::OPENSTACK
				options = {}
				options[:name] = params[:name]
				options[:description] = params[:description]
				options[:size] = params[:size]
				options[:snapshot_id] = params[:snapshot_id] unless params[:snapshot_id].nil?
		end
		volume = $compute.volumes.create(options) unless options.nil?
		
		if is_amazon
			$compute.create_tags(volume.id, {"Name" => params[:name]})
		end
        
        # Save properties for StackStudio display purposes
        cloud_resource = StackPlace::CloudResource.new
        cloud_resource.physical_id = volume.id
        cloud_resource.properties = {:name=>params[:name], :description=>params[:description]}
        $client.create_cloud_resource(params[:user_id], params[:cloud_account_id], cloud_resource)
        
        # Setup audit log info
        @physical_resource_id = volume.id
        @logical_resource_id  = params[:name]
		audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @logical_resource_id  = params[:name]
        audit_log
		render :json => @response.to_json, :status => @status_code        
	end

	def create_key_pair
		set_compute(params)
		if @account.cloud_provider == CloudConstants::Type::CLOUDSTACK
			new_key = $compute.create_ssh_key_pair(params[:key_pair_name])
		else
			new_key = $compute.key_pairs.create({:name => params[:key_pair_name]})
		end
        
        # Setup audit log info
        @physical_resource_id = params[:key_pair_name]
		audit_log
		render :json => new_key.attributes
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:key_pair_name]
        audit_log
		render :json => @response.to_json, :status => @status_code
	end
	
	def import_key_pair
		set_compute(params)
		if @account.cloud_provider == CloudConstants::Type::JOYENT
			$compute.keys.create({:name => params[:key_pair_name], :key => params[:public_key]})
		elsif @account.cloud_provider == CloudConstants::Type::AWS
			$compute.import_key_pair(params[:key_pair_name], params[:public_key])
		else
			# HP and OpenStack
			$compute.create_key_pair(params[:key_pair_name], params[:public_key])
		end
		
		audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code
	end
	
	def delete_key_pair
		set_compute(params)
		if @account.cloud_provider == CloudConstants::Type::JOYENT
			$compute.keys.get(params[:physical_id]).destroy
		elsif @account.cloud_provider == CloudConstants::Type::CLOUDSTACK
			$compute.delete_ssh_key_pair(params[:physical_id])
		else
			$compute.key_pairs.get(params[:physical_id]).destroy
		end
		
		audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code
	end

	def describe_key_pairs
		@resource_interface = getResourceInterface(params)
		keys = @resource_interface.describe_key_pairs
		render :json => keys.to_json
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code
	end


	def delete_volume
		set_compute(params)
		if is_euca
			$compute.delete_volume(params[:physical_id])
		else
			$compute.volumes.get(params[:physical_id]).destroy
		end
        
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
		audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code       
	end
	
	def request_spot_instances
		set_compute(params)
		options = {}
		options["Type"] = params["Type"] unless params["Type"].nil?
		#if !params["ValidFrom"].nil?
		#	time = Time.parse(params["ValidFrom"])
		#	if Time.now < time
		#		options["ValidFrom"] = time
		#	end
		#end
        #options["ValidUntil"] = Time.parse(params["ValidUntil"]) unless params["ValidUntil"].nil?
        options["ValidFrom"] = params["ValidUntil"] unless params["ValidFrom"].nil?
		options["ValidUntil"] = params["ValidUntil"] unless params["ValidUntil"].nil?
		options["LaunchGroup"] = params["LaunchGroup"] unless params["LaunchGroup"].nil?
		options["LaunchSpecification.KeyName"] = params["KeyName"] unless params["KeyName"].nil?
		options["LaunchSpecification.Monitoring.Enabled"] = "true" unless params["Monitoring"].nil?
		options["LaunchSpecification.Placement.AvailabilityZone"] = params["AvailabilityZone"] unless params["AvailabilityZone"].nil?
		options["LaunchSpecification.SecurityGroup"] = params["SecurityGroup"] unless params["SecurityGroup"].nil?
		$compute.request_spot_instances(params["ImageId"], params["InstanceType"], params["SpotPrice"], options)
		audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code
	end
	
	def cancel_spot_instance_requests
		set_compute(params)
		$compute.cancel_spot_instance_requests(params[:physical_id])
		@physical_resource_id = params[:physical_id]
		audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code 
		
	end

	def attach_volume
		set_compute(params)
		case @attributes[:provider]
			when CloudConstants::Type::AWS
				$compute.attach_volume(params[:instance_id], params[:volume_id], params[:device])
			when CloudConstants::Type::CLOUDSTACK
				$compute.attach_volume({:id=>params[:volume_id], :virtualmachineid=>params[:instance_id], :deviceid=>params[:device]})
			when CloudConstants::Type::OPENSTACK
				$compute.attach_volume(params[:volume_id], params[:instance_id], params[:device])
		end
        
        # Setup audit log info
        @physical_resource_id = params[:instance_id]
		audit_log
    	render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:instance_id]
        audit_log
		render :json => @response.to_json, :status => @status_code        
    end
	
	def detach_volume
		set_compute(params)
		case @attributes[:provider]
			when CloudConstants::Type::AWS
				$compute.detach_volume(params[:physical_id])
			when CloudConstants::Type::CLOUDSTACK
				$compute.detach_volume({:id=>params[:physical_id], :virtualmachineid=>params[:child_id]})
			when CloudConstants::Type::OPENSTACK
				$compute.detach_volume(params[:child_id], params[:physical_id])
		end
        
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
		audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code
	end
	
	def force_detach_volume
		set_compute(params)
		$compute.detach_volume(params[:physical_id], {'Force'=>true})
		
		 # Setup audit log info
        @physical_resource_id = params[:physical_id]
		audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code
	end

	def terminate_instances
		set_compute(params)
		server = $compute.servers.get(params[:physical_id])
		server.destroy
        
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code
	end	
    
	def launch_instances
		set_compute(params)
		options = {}
		options["name"] = params[:name]
		case @attributes[:provider]	
			when CloudConstants::Type::AWS
				options = params
			when CloudConstants::Type::CLOUDSTACK
				options["image_id"] = params[:image_id]
				options["zone_id"] = params[:availability_zone]
				options["flavor_id"] = params[:flavor_id]
				options["key_name"] = params[:key_name]
				options["display_name"] = params[:name]
			when CloudConstants::Type::JOYENT
				options["package"] = params[:flavor_id]
				options["dataset"] = params[:image_id]
				options["metadata"] = {"root_authorized_keys"=>params[:key_name]}
				options["tag"] = {"description"=>params[:description]}
			when CloudConstants::Type::HP
				options["image_id"] = params[:image_id]
				options["flavor_id"] = params[:flavor_id]
				options["key_name"] = params[:key_name]
			when CloudConstants::Type::OPENSTACK
				options["key_name"] = params[:key_name]
				options["flavor_ref"] = params[:flavor_id]
				options["image_ref"] = params[:image_id]
			when CloudConstants::Type::RACKSPACE
				options["image_id"] = params[:image_id]
				options["flavor_id"] = params[:flavor_id]
		end
		server = $compute.servers.create(options)
		if is_amazon
			$compute.create_tags(server.id, {"Name" => params[:name]})
		end
        
        # Save properties for StackStudio display purposes
        cloud_resource = StackPlace::CloudResource.new
        cloud_resource.physical_id = server.id
        cloud_resource.properties = {:name=>params[:name], :description=>params[:description]}
        $client.create_cloud_resource(params[:user_id], params[:cloud_account_id], cloud_resource)
        
        # Setup audit log info
        @physical_resource_id = server.id
        @logical_resource_id  = params[:name]
        audit_log
		render :nothing => true
	rescue Excon::Errors::Conflict => @error
		if $compute.is_a?Fog::Compute::Joyent::Real
			serv = $compute.servers.stop
			serv.stop
			serv.destroy
            audit_log
			render :nothing => true
		else
            @response = Error.new(error)
            @status_code = @response.code
            # Setup audit log info
            @logical_resource_id  = params[:name]
            audit_log
            render :json => @response.to_json, :status => @status_code
		end
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @logical_resource_id  = params[:name]
        audit_log
		render :json => @response.to_json, :status => @status_code
	end

	def get_mgmt_resources
		set_compute(params)
		resources = {}
		resources[:compute_prices] = get_prices("compute", params[:cloud_id])
		case @attributes[:provider]
		when CloudConstants::Type::AWS
			resources[:designated_images] = $client.cloud_details(params[:cloud_id]).cloud_mappings.as_json
			resources[:availability_zones] = $compute.describe_availability_zones.body["availabilityZoneInfo"]
            resources[:instances] = []
			$compute.servers.each {|s| resources[:instances] << s.attributes}
			resources[:user_images] = []
            owner_id = $compute.security_groups.first.owner_id
            $compute.images.all({"Owner" => owner_id}).each {|image| resources[:user_images] << image.attributes}
            if @cloud.cloud_provider == CloudConstants::Type::AWS
                resources[:spot_price_history] = $compute.describe_spot_price_history.body["spotPriceHistorySet"]
            end
		when CloudConstants::Type::CLOUDSTACK
			zones = $compute.zones
			parser = MultiCloudParser::Compute.new
			formatted_zones = parser.describe_zones_parser(@attributes[:provider], zones)
			resources[:availability_zones] = formatted_zones
			resources[:keys] = $compute.list_ssh_key_pairs["listsshkeypairsresponse"]["sshkeypair"]
		when CloudConstants::Type::JOYENT
			resources[:keys] = []
			$compute.keys.each {|key| resources[:keys] << JSON.parse(key.to_json)}
		end
		
		if @attributes[:provider] != CloudConstants::Type::RACKSPACE and @attributes[:provider] != CloudConstants::Type::CLOUDSTACK and resources[:keys].nil?
			resources[:keys] = []
			$compute.key_pairs.each do |key|
                if key.name.match(/__key_/).nil?
                    resources[:keys] << JSON.parse(key.to_json)
                end
            end
		end
        
		if @attributes[:provider] != CloudConstants::Type::JOYENT && @attributes[:provider] != CloudConstants::Type::CLOUDSTACK
            security_groups = []
            $compute.security_groups.each do |grp|
                # Do not return groups without a name (fog gem returns some blank groups), or topstack generated groups
                if !grp.name.nil? && grp.name.match(/rds-/).nil? && grp.name.match(/__elb/).nil? && grp.name.match(/__ecache_/).nil?
                    security_groups << grp.attributes
                end
            end
			resources[:security_groups] = security_groups
		end        
		
		if @attributes[:provider] != CloudConstants::Type::AWS
			resources[:designated_images] = []
			$compute.images.each do |image|
				if image.name.match(/[Kk]ernel/).nil? && image.name.match(/[Rr]amdisk/).nil?
			        resources[:designated_images] << JSON.parse(image.to_json)
				end
			end
		elsif @attributes[:provider] == CloudConstants::Type::AWS && resources[:designated_images].length == 0
			$compute.images.each do |image|
				if !image.kernel_id.nil? && !image.ramdisk_id.nil?
					resources[:designated_images] << JSON.parse(image.to_json)
				end
			end
		end

		resources[:types] = []
		$compute.flavors.each {|type| resources[:types] << JSON.parse(type.to_json)}
		render :json => resources.to_json
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code       
	end

	def get_volume_resources
		set_compute(params)
		resources = {}
		parser = MultiCloudParser::Compute.new
		if @attributes[:provider] == CloudConstants::Type::CLOUDSTACK
			begin
				snapshots = $compute.list_snapshots["listsnapshotsresponse"]["snapshot"]
				resources[:snapshots] = parser.describe_snapshots_parser(@attributes[:provider], snapshots)
			rescue
				resources[:snapshots] = []
			end
		else
			snapshots = $compute.snapshots
			resources[:snapshots] = parser.describe_snapshots_parser(@attributes[:provider], snapshots)
		end
		
		if @attributes[:provider] == CloudConstants::Type::AWS
			resources[:availability_zones] = $compute.describe_availability_zones.body["availabilityZoneInfo"]
		elsif @attributes[:provider] == CloudConstants::Type::CLOUDSTACK
			zones = $compute.zones
			formatted_zones = parser.describe_zones_parser(@attributes[:provider], zones)
			resources[:availability_zones] = formatted_zones
			resources[:disk_offerings] = $compute.list_disk_offerings["listdiskofferingsresponse"]["diskoffering"]
		end
		cloud_id = $client.cloud_account_details(params[:cloud_account_id]).cloud_id
		prices = get_prices("ebs", cloud_id)
		resources[:prices] = prices
		
		render :json => resources
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code        
	end
    
    def authorize_port_range
        @compute = getResourceInterface(params)
        security_group = @compute.security_groups.get(params[:id])
        options = params[:options]
        group = options[:group]
        
        case @compute
        when Fog::Compute::OpenStack::Real
            cidr_ip = options[:cidr_ip] || "0.0.0.0/0"
            group_id = group[:id] unless group.nil?
            security_group.create_security_group_rule(params[:min], params[:max], options[:ip_protocol], cidr_ip, group_id)
        when Fog::Compute::AWS::Real
            range = params[:min]..params[:max]
            options[:group] = "#{group[:ownerId]}:#{group[:name]}" unless options[:group].nil?
            security_group.authorize_port_range(range, options)
        end
        
        # Setup audit log info
        @physical_resource_id  = group[:name] || group[:id]
        audit_log
        render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:id]
        audit_log
		render :json => @response.to_json, :status => @status_code        
    end
    
    def revoke_port_range
        @compute = getResourceInterface(params)
        security_group = @compute.security_groups.get(params[:id])
        options = params[:options]
        group = options[:group]
        
        case @compute
        when Fog::Compute::OpenStack::Real
            security_group.delete_security_group_rule(options[:rule_id])
        when Fog::Compute::AWS::Real
            range = params[:min]..params[:max]
            options[:group] = "#{group[:ownerId]}:#{group[:name]}" unless options[:group].nil?
            security_group.revoke_port_range(range, options)
        end
        
        # Setup audit log info
        @physical_resource_id  = group[:name] || group[:id]
        audit_log
        render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:id]
        audit_log
		render :json => @response.to_json, :status => @status_code        
    end
    
    def describe_reserved_instances_offerings
        result = @resource_interface.describe_reserved_instances_offerings(params[:filters]).body["reservedInstancesOfferingsSet"]
        render :json => result
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        render :json => @response.to_json, :status => @status_code           
    end
    
    def purchase_reserved_instances_offering
        offerings = params[:offerings]
        instance_ids = []
        offerings.keys.each do |item|
            instance_ids << @resource_interface.purchase_reserved_instances_offering(item, offerings[item]).body["reservedInstancesId"]
        end
        audit_log
        render :json => instance_ids
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        #@physical_resource_id = params[:id]
        audit_log
		render :json => @response.to_json, :status => @status_code         
    end
    
    def describe_spot_price_history
        result = @resource_interface.describe_spot_price_history(params[:filters]).body["spotPriceHistorySet"]
        render :json => result
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        render :json => @response.to_json, :status => @status_code           
    end
    
	
	##################
	#   ELB Actions
	##################

	def describe_load_balancers
		@resource_interface = getResourceInterface(params)
		if params[:physical_id].nil?
			render :json => @resource_interface.describe_load_balancers.body["DescribeLoadBalancersResult"]["LoadBalancerDescriptions"]
		else 
			render :json => @resource_interface.describe_load_balancers('LoadBalancerNames' => [params[:physical_id]]).body["DescribeLoadBalancersResult"]["LoadBalancerDescriptions"].first
		end
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code         
	end

	def create_load_balancer
		listeners = Array(JSON.parse(params[:listeners]))
		
		if params[:availability_zones].nil?
			case get_cloud_type
			when CloudConstants::Type::DIABLO, CloudConstants::Type::ESSEX, CloudConstants::Type::EUCA
				if @cloud.topstack_enabled
					availability_zones = [@cloud.topstack_id]
				end
			when "Amazon Web Services"
                params[:service] = ServiceTypes::EC2
                compute_interface = getResourceInterface(params)
                availability_zones = []
                compute_interface.describe_availability_zones.body["availabilityZoneInfo"].each {|z| availability_zones << z["zoneName"]}
			end
		end
		new_load_balancer = @resource_interface.create_load_balancer(availability_zones, params[:name], listeners).body["CreateLoadBalancerResult"]
        health_check = JSON.parse(params[:health_check])
        @resource_interface.configure_health_check(params[:name], health_check)
		
        # Setup audit log info
        @physical_resource_id = params[:name]
		audit_log
		render :json => new_load_balancer
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
		render :json => @response.to_json, :status => @status_code  
	end
	
	def get_elb_prices
		cloud_id = $client.cloud_account_details(params[:cloud_account_id]).cloud_id
		prices = get_prices("elb", cloud_id)
		resources = {:prices => prices}
		render :json => resources
	end
	
	def get_instances_available_to_load_balancer
		available_instances = []
		unavailable_instance_ids = []
		@elb = getResourceInterface(params)
        cloud_account = $client.cloud_account_details(params[:cloud_account_id])
        
        if cloud_account.cloud_provider == CloudConstants::Type::AWS
            params[:service] = "AS"
            @as = getResourceInterface(params)
            as_groups = @as.describe_auto_scaling_groups.body["DescribeAutoScalingGroupsResult"]["AutoScalingGroups"]
            as_groups.each do |a|
                as_instances = a["Instances"]
                as_instances.each do |s|
                    unavailable_instance_ids << s["InstanceId"]
                end
            end
		end
        
		load_balancers = @elb.describe_load_balancers.body["DescribeLoadBalancersResult"]["LoadBalancerDescriptions"]
		load_balancers.each do |l|
			lb_instances = l["Instances"]
			lb_instances.each do |b|
				unavailable_instance_ids << b
			end
		end
		
        params[:service] = ServiceTypes::EC2
        set_compute(params)
		ec2_instances = $compute.servers
        
		ec2_instances.each do |e|
			if !unavailable_instance_ids.include?(e.id) && e.key_name.match(/__key/).nil?
                if !params[:load_balancer_az].nil?
                    if e.availability_zone == params[:load_balancer_az] && e.state == "running"
                        available_instances << e
                    end
                else
                    available_instances << e
                end
			end
		end
		parser = MultiCloudParser::Compute.new
		formatted_available_instances = parser.describe_instances_parser(@attributes[:provider], available_instances, @cloud, @account)
        
        response_list = []
        formatted_available_instances.each do |inst|
            if inst[:public_ip_address] != params[:load_balancer_ip]
                response_list << inst
            end
        end
        
		render :json => response_list
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code          
    end
	
	def register_instances_with_load_balancer
		@elb = getResourceInterface(params)
		lb = @elb.describe_load_balancers('LoadBalancerNames' => [params[:load_balancer_name]]).body["DescribeLoadBalancersResult"]["LoadBalancerDescriptions"].first
		if(!lb["AvailabilityZones"].include?(params[:availability_zone]))
			@elb.enable_availability_zones_for_load_balancer( params[:availability_zone], params[:load_balancer_name])
		end
		@elb.register_instances_with_load_balancer([params[:instance_id]], params[:load_balancer_name])
        
        # Setup audit log info
        @physical_resource_id = params[:load_balancer_name]
		audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:load_balancer_name]
        audit_log
		render :json => @response.to_json, :status => @status_code          
	end
	
	def deregister_instances_from_load_balancer
		@elb = getResourceInterface(params)
		@elb.deregister_instances_from_load_balancer([params[:instance_id]], params[:physical_id])
        
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
		audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code          
	end
	
	def enable_availability_zones_for_load_balancer
		@elb = getResourceInterface(params)
		@elb.enable_availability_zones_for_load_balancer([params[:availability_zone]], params[:load_balancer_name])
        
        # Setup audit log info
        @physical_resource_id = params[:load_balancer_name]
		audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:load_balancer_name]
        audit_log
		render :json => @response.to_json, :status => @status_code        
    end
	
	def disable_availability_zones_for_load_balancer
		@elb = getResourceInterface(params)
		@elb.disable_availability_zones_for_load_balancer([params[:availability_zone]], params[:load_balancer_name])

        # Setup audit log info
        @physical_resource_id = params[:load_balancer_name]
		audit_log
    	render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:load_balancer_name]
        audit_log
		render :json => @response.to_json, :status => @status_code        
	end
	
	def create_load_balancer_listeners
    	@elb = getResourceInterface(params)
    	listener = [{"Protocol" => params[:protocol],
    				 "LoadBalancerPort" => params[:load_balancer_port],
    				 "InstanceProtocol" => params[:instance_protocol],
    				 "InstancePort" => params[:instance_port]}]	 
    				 
    	@elb.create_load_balancer_listeners(params[:load_balancer_name], listener)
        
        # Setup audit log info
        @physical_resource_id = params[:load_balancer_name]
		audit_log
    	render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:load_balancer_name]
        audit_log
		render :json => @response.to_json, :status => @status_code         
    end
	
	def delete_load_balancer_listeners
    	@elb = getResourceInterface(params)
    	@elb.delete_load_balancer_listeners(params[:load_balancer_name], [params[:load_balancer_port]])
        
        # Setup audit log info
        @physical_resource_id = params[:load_balancer_name]
		audit_log
    	render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:load_balancer_name]
        audit_log
		render :json => @response.to_json, :status => @status_code        
    end
	
	def describe_instance_and_az_health
		@elb = getResourceInterface(params)
		availability_zones = JSON.parse(params[:availability_zones])
		availability_zones_health = []
		availability_zones.each do |r|
			az_health = {}
			az_health["LoadBalancerName"] = params[:physical_id]
			az_health["AvailabilityZone"] = r
			az_health["InstanceCount"] = 0
			az_health["Healthy"] = false
			availability_zones_health << az_health
		end
			
		instance_health = @elb.describe_instance_health(params[:physical_id]).body["DescribeInstanceHealthResult"]["InstanceStates"]
        
        # Set service to EC2 and initialize $compute interface
        params[:service] = ServiceTypes::EC2
        set_compute(params)
        
		instance_health.each do |i|
			instance = $compute.servers.get(i["InstanceId"])
			i["AvailabilityZone"] = instance.availability_zone
			i["LoadBalancerName"] = params[:physical_id]
			availability_zones_health.each do |a|
				if(a["AvailabilityZone"] == i["AvailabilityZone"])
					a["InstanceCount"] = a["InstanceCount"] + 1
					if i["State"] == "InService" || i["State"] == "active" || i["State"] == "running"
						a["Healthy"] = true
					end
				end
			end
		end
		render :json => {"AvailabilityZonesHealth" => availability_zones_health, "InstancesHealth" => instance_health}
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code        
	end
	
	def delete_load_balancer
		@elb = getResourceInterface(params)
		@elb.delete_load_balancer(params[:physical_id])
        
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
		audit_log
		render :nothing => true
	rescue => @error
        response = Error.new(@error)
		@status_code = response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => response.to_json, :status => @status_code          
	end
	
	##################
	#   ELC Actions
	##################
	
    def authorize_cache_security_group_ingress
        @elc = getResourceInterface(params)
        security_group = @elc.security_groups.get(params[:name])
        security_group.authorize_ec2_group(params[:group_name], params[:group_owner])
        
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
        render :json => security_group.attributes
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
		render :json => @response.to_json, :status => @status_code        
    end
    
    def revoke_cache_security_group_ingress
        @elc = getResourceInterface(params)
        security_group = @elc.security_groups.get(params[:name])
        security_group.revoke_ec2_group(params[:group_name], params[:group_owner])
        
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
        render :json => security_group.attributes
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
		render :json => @response.to_json, :status => @status_code        
    end
    
	def create_cache_security_group
		@elc = getResourceInterface(params)
		security_group = @elc.security_groups.new
        security_group.id = params[:group_name]
        security_group.description = params[:description]
        security_group.save
        
        # Setup audit log info
        @physical_resource_id = params[:group_name]
        audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:group_name]
        audit_log
		render :json => @response.to_json, :status => @status_code        
	end
	
	def create_cache_parameter_group
		@elc = getResourceInterface(params)
		@elc.create_cache_parameter_group(params[:name], params[:description], params[:family])
        
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
		render :json => @response.to_json, :status => @status_code        
	end
    
    def delete_cache_security_group
        @elc = getResourceInterface(params)
        security_group = @elc.security_groups.get(params[:name])
        security_group.destroy
        
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
        render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
		render :json => @response.to_json, :status => @status_code        
    end 
	
	def delete_cache_parameter_group
		@elc = getResourceInterface(params)
		@elc.delete_cache_parameter_group(params[:physical_id])
        
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code        
	end

	def describe_cache_clusters
		@elc = getResourceInterface(params)
		if params[:physical_id].nil?
			resources = {}
			clusters = []
			parameter_groups = []
            security_groups = []
			@elc.clusters.each {|cluster| clusters << cluster.attributes}
            @elc.security_groups.each {|group| security_groups << group.attributes}
            @elc.parameter_groups.each {|group| parameter_groups << group.attributes}
			resources[:clusters] = clusters
            resources[:security_groups] = security_groups
			resources[:parameter_groups] = parameter_groups
			render :json => resources
		else
			cluster = @elc.clusters.get(params[:physical_id])
			render :json => cluster.attributes
		end
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code        
	end
	
	def describe_cache_parameters
		@elc = getResourceInterface(params)
		parameters = @elc.describe_cache_parameters(params[:resource_id]).body["DescribeCacheParametersResult"]["Parameters"]
        symbolize_keys(parameters)
		render :json => parameters
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code        
	end

	def create_cache_cluster
		properties = params["Properties"]
		@elc = getResourceInterface(params)
		cluster = @elc.clusters.new		
		cluster.parameter_group = properties["CacheParameterGroupName"]
		cluster.security_groups = properties["CacheSecurityGroupNames"]
		cluster.node_type = properties["CacheNodeType"]
		cluster.num_nodes = properties["NumCacheNodes"]
		cluster.auto_upgrade = properties["AutoMinorVersionUpgrade"] unless properties["AutoMinorVersionUpgrade"] == false
		cluster.engine = properties["Engine"]
		cluster.engine_version = properties["EngineVersion"]
		cluster.port = properties["Port"]
		cluster.notification_config = properties["NotificationTopicArn"]
		cluster.maintenance_window = properties["PreferredMaintenanceWindow"] unless properties["PreferredMaintenanceWindow"].nil?
		cluster.zone = properties["PreferredAvailabilityZone"] unless properties["PreferredAvailabilityZone"].nil?
		properties = cluster.attributes
		properties[:notification_topic_arn] = properties.delete(:notification_config)
		@elc.create_cache_cluster(params[:name], properties)
        
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
		render :json => @response.to_json, :status => @status_code	        
	end

	def describe_cache_security_groups
		@resource_interface = getResourceInterface(params)
        if params[:physical_id].nil?
            security_groups = []
            @resource_interface.security_groups.each {|group| security_groups << group.attributes}
            render :json => security_groups
        else
            security_group = @resource_interface.security_groups.get(params[:physical_id])
            render :json => security_group.attributes
        end
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code        
	end

	def describe_cache_parameter_groups
		@resource_interface = getResourceInterface(params)
		parameter_groups = []
		@resource_interface.parameter_groups.each {|group| parameter_groups << group.attributes}
		render :json => parameter_groups
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code        
	end

	def get_elc_resources
		@resource_interface = getResourceInterface(params)
		security_groups = []
		@resource_interface.security_groups.each {|group| security_groups << group.attributes}
		parameter_groups = []
		@resource_interface.parameter_groups.each {|group| parameter_groups << group.attributes}
		cloud_id = $client.cloud_account_details(params[:cloud_account_id]).cloud_id
		prices = get_prices("elc", cloud_id)
		resources = {:security_groups => security_groups, :parameter_groups => parameter_groups, :prices => prices}
		render :json => resources
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code        
	end
	
	def delete_cache_cluster
		@resource_interface = getResourceInterface(params)
		cluster = @resource_interface.clusters.get(params[:physical_id])
		unless cluster.nil?
			cluster.destroy
		end
        
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
		audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code	
	end
    
    def describe_cache_events
        cluster_name = params[:cluster_name]
		@account = $client.cloud_account_details(params[:cloud_account_id])
		options = {}
		CloudTargetOverride.get_cloud_url_params(@account, params[:service], options )
		unless options.empty?
			options[:server] = options[:host]
			options.delete(:host)
			options[:protocol] = "http"
			options[:service] = options[:path]
			options.delete(:path)
		end
		@resource_interface = RightAws::ElcInterface.new(@account.access_key, @account.secret_key, options)
		options = {}
		options[:aws_id] = cluster_name
		options[:source_type] = "cache-cluster"
		events = @resource_interface.describe_events(options)
		render :json => events.to_json
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code        
    end
    
    def modify_cache_parameter_group
        @resource_interface = getResourceInterface(params)
        @resource_interface.modify_cache_parameter_group(params[:group_name], params[:group_parameters])
        
        # Setup audit log info
        @physical_resource_id = params[:group_name]
        audit_log
        render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:group_name]
        audit_log
		render :json => @response.to_json, :status => @status_code
    end
	
	##################
	#   IAM Actions
	##################
	
	def list_users
		@resource_interface = getResourceInterface(params)
		users = []
		if @resource_interface.is_a?Fog::AWS::IAM::Real
			@resource_interface.users.each {|user| users << user.attributes}
		else
			users = @resource_interface.list_users["users"]
		end
		render :json => users
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code	
	end

	def list_groups
		@resource_interface = getResourceInterface(params)
		if @resource_interface.is_a?Fog::AWS::IAM::Real
			groups = @resource_interface.list_groups.body["Groups"]
		else
			groups = @resource_interface.list_groups["tenants"]
		end
		render :json => groups
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code	
	end

	def list_groups_and_users
		@resource_interface = getResourceInterface(params)
		users = []
		groups = []
		if @resource_interface.is_a?Fog::AWS::IAM::Real
			users_list = @resource_interface.users
			begin
				users_list.each {|user| users << user.attributes.merge(:groups => @resource_interface.list_groups_for_user(user.id).body["GroupsForUser"])}
			rescue
				#May not have permissions for list_groups_for_users
				users_list.each {|user| users<< user.attributes}
			end
			groups_list = @resource_interface.list_groups.body["Groups"]
			groups_list.each do |group|
 				groups << group.merge(:users => @resource_interface.get_group(group["GroupName"]).body["Users"])
			end
		else
			users = @resource_interface.list_users["users"]
			groups = @resource_interface.list_groups["tenants"]
		end
		
		response = {:groups => groups, :users => users}
		render :json => response.to_json
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code        
	end

			
	def get_group
		@resource_interface = getResourceInterface(params)
        response = @resource_interface.get_group(params[:physical_id])
		group = response["Group"]
		users = response["Users"]
		policies = @resource_interface.list_group_policies(params[:physical_id]).body["PolicyNames"]
		resource = {:group => group, :users => users, :policies => policies}
		render :json => resource
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code
	end
	
	def get_user
		@resource_interface = getResourceInterface(params)
		user = @resource_interface.users.get(params[:physical_id]).attributes
		groups = @resource_interface.list_groups_for_user(params[:physical_id]).body["GroupsForUser"]
		policies = @resource_interface.list_user_policies(params[:physical_id]).body["PolicyNames"]
        user.merge(:groups => groups, :policies => policies)
		resource = user
		render :json => resource
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code
	end

	def create_user
		@resource_interface = getResourceInterface(params)
		response = {}
		
		if @resource_interface.is_a?Fog::AWS::IAM::Real
			response[:user] = @resource_interface.create_user(params[:name])
			@resource_interface.create_login_profile(params[:name], params[:password]) unless params[:password].right_blank?

			if params[:generate_keys]
				response[:key] = @resource_interface.create_access_key({"UserName" => params[:name]}).body["AccessKey"]
			end
		else
			response[:user] = @resource_interface.create_user(params)
		end
		
        # Setup audit log info
        @physical_resource_id = params[:name]
		audit_log

		if response[:key].nil?
			render :json => response[:user].to_json
		else
			render :json => response[:key]
		end
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
		render :json => @response.to_json, :status => @status_code
	end

	def create_group
		@resource_interface = getResourceInterface(params)
		users_array = JSON.parse(params[:users])
		if @resource_interface.is_a?Fog::AWS::IAM::Real
			@resource_interface.create_group(params[:name])

			@resource_interface.put_group_policy(params[:name], params[:policy_name], JSON.parse(params[:policy_document]))
		
			if params[:user_type] == "true"
				users_array.each do |user|
					@resource_interface.create_user(user["UserName"])
					@resource_interface.add_user_to_group(params[:name], user["UserName"])
				end
			else
				users_array.each do |user|
					@resource_interface.add_user_to_group(params[:name], user["UserName"])
				end
			end
		else
			group = @resource_interface.create_group(params)
			group = JSON.parse(group)["tenant"].symbolize_keys
			if params[:user_type] == "true"
				users_array.each do |user|
					user = user.symbolize_keys
					@resource_interface.create_user(user.merge(:group_id => group[:id]))
				end
			else
				users_array.each do |user|
					user = user.symbolize_keys
					@resource_interface.update_user(user[:id], user[:name], user.merge(:group_id => group[:id]))
				end
			end
		end
        
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
		render :json => @response.to_json, :status => @status_code        
	end

	def delete_group
		@resource_interface = getResourceInterface(params)
		group_name = params[:physical_id]
		if @resource_interface.is_a?Fog::AWS::IAM::Real
			policies = @resource_interface.list_group_policies(group_name).body["PolicyNames"]
			policies.each {|policy| @resource_interface.delete_group_policy(group_name, policy)}
			users = @resource_interface.get_group(group_name).body["Users"]
			users.each {|user| @resource_interface.remove_user_from_group(group_name, user["UserName"])}
		end
		@resource_interface.delete_group(group_name)
        
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code        
	end


	def delete_user
		@resource_interface = getResourceInterface(params)
		username = params[:physical_id]
		if @resource_interface.is_a?Fog::AWS::IAM::Real
			#Remove policies from user
			@resource_interface.list_user_policies(username).body["PolicyNames"].each do |t|
				@resource_interface.delete_user_policy(username, t)
			end
			#Remove user from groups
			@resource_interface.list_groups_for_user(username).body["GroupsForUser"].each do |g|
				@resource_interface.remove_user_from_group(g[:group_name], username)
			end
			#Delete User Access Keys
			@resource_interface.list_access_keys({"UserName" => username}).body["AccessKeys"].each do |a|
				@resource_interface.delete_access_key(a[:access_key_id], "UserName" => username)
			end
			#Delete Signing Certs
			@resource_interface.list_signing_certificates({"UserName" => username}).body["SigningCertificates"].each do |s|
				@resource_interface.delete_signing_certificate(s[:certificate_id])
			end
			
			begin
				@resource_interface.delete_login_profile(username)
			rescue
				#Rescue because there may not be a login, but user still needs to be deleted
			end
		end

		@resource_interface.delete_user(username)

        # Setup audit log info
        @physical_resource_id = params[:physical_id]
		audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code
	end

	##################
	#   RDS Actions
	##################

	def describe_db_instances
		@rds = getResourceInterface(params)
		if params[:physical_id].nil?
			resource = {}
            
			databases = []
			@rds.servers.each {|db| databases << db.attributes}
            
            snapshots = []
            begin
                @rds.snapshots.each {|snap| snapshots << snap.attributes}
            rescue Excon::Errors::NotFound => error
                # Topstack returns error if no snapshot is found
            end
            
            security_groups = []
            @rds.security_groups.each {|grp| security_groups << grp.attributes}
            
            parameter_groups = []
            @rds.parameter_groups.each {|grp| parameter_groups << grp.attributes}
            
			resource[:databases] = databases
            resource[:snapshots] = snapshots
            resource[:security_groups] = security_groups
			resource[:parameter_groups] = parameter_groups
            
			render :json => resource
		else
			database = @rds.servers.get(params[:physical_id])
			render :json => database.attributes
		end
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code  
	end

	def create_db_instance
		@resource_interface = getResourceInterface(params)
        if @cloud.topstack_enabled
            params["AvailabilityZone"] = @cloud.topstack_id
        end
		attributes = {}

		# Required
		attributes[:id] =                                       params["DBInstanceIdentifier"]
	    attributes[:allocated_storage] =                        params["AllocatedStorage"]
	    attributes[:engine] =                                   params["Engine"]
		attributes[:master_username] =                          params["MasterUsername"]
		attributes[:password] =                                 params["MasterUserPassword"]

		# Optional
		attributes[:auto_minor_version_upgrade] =               params["AutoVersion"]                   unless params["AutoVersion"].nil?
		attributes[:availability_zone] =                        params["AvailabilityZone"]              unless params["AvailabilityZone"].nil?
		attributes[:backup_retention_period] =                  params["BackupRetentionPeriod"]         unless params["BackupRetentionPeriod"].nil?
		attributes[:db_name] =                                  params["DBName"]                        unless params["DBName"].nil?
		attributes[:port] =                                     params["Port"]                          unless params["Port"].nil?
		attributes[:engine_version] =                           params["EngineVersion"]                 unless params["EngineVersion"].nil?
		attributes[:flavor_id] =                                params["DBInstanceClass"]               unless params["DBInstanceClass"].nil?
		attributes[:license_model] =                            params["LicenseModel"]                  unless params["LicenseModel"].nil?		
		attributes[:multi_az] =                                 params["MultiAZ"]                       unless params["MultiAZ"] == false
		attributes[:parameter_group_name] =                     params["DBParameterGroupName"]          unless params["DBParameterGroupName"] == "default"
		attributes[:preferred_backup_window] =                  params["PreferredBackupWindow"]         unless params["PreferredBackupWindow"].nil?
		attributes[:preferred_maintenance_window] =             params["PreferredMaintenanceWindow"]    unless params["PreferredMaintenanceWindow"].nil?
		attributes[:security_group_names] =                     params["DBSecurityGroups"]              unless params["DBSecurityGroups"] == []
        
		db_instance = @resource_interface.servers.create(attributes)
		params = attributes
        
        # Setup audit log info
        @physical_resource_id = params['DBInstanceIdentifier']
		audit_log
		render :json => db_instance.attributes
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params['DBInstanceIdentifier']
        audit_log
		render :json => @response.to_json, :status => @status_code 
	end
    
    def create_read_replica
        @rds = getResourceInterface(params)
        options = {}
        options[:db_instance_class] = params["DBInstanceClass"]
        options[:port] = params["Port"]
        options[:auto_minor_version_upgrade] = params["AutoMinorVersionUpgrade"] unless params["AutoMinorVersionUpgrade"].right_blank?
        db_instance = @rds.servers.get(params[:source_identifier])
        db_instance.create_read_replica(params[:replica_id], options)
        
        # Setup audit log info
        @physical_resource_id = params[:source_identifier]
        audit_log
        render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:source_identifier]
        audit_log
		render :json => @response.to_json, :status => @status_code
    end
	
	def describe_db_parameters
		@rds = getResourceInterface(params)
		parameters = []
		@rds.parameter_groups.get(params[:resource_id]).parameters.each {|p| parameters << p.attributes}
		render :json => parameters
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code        
	end

	def delete_db_instance
		@resource_interface = getResourceInterface(params)
		database = @resource_interface.servers.get(params[:physical_id])
		db = database.destroy(params[:snapshot_id])
        
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
		audit_log
		render :json => database.attributes
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code 
	end
	
	def delete_db_parameter_group
		@rds = getResourceInterface(params)
		@rds.delete_db_parameter_group(params[:physical_id])
        
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code        
	end

	def restore_db_instance_from_db_snapshot
		@resource_interface = getResourceInterface(params)		
		restored_db = @resource_interface.restore_db_instance_from_db_snapshot(params[:db_snapshot_identifier], params[:db_instance_identifier], params[:options])
        
        # Setup audit log info
        @physical_resource_id = params[:db_snapshot_identifier]
		audit_log
		render :json => restored_db.to_json
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:db_snapshot_identifier]
        audit_log
		render :json => @response.to_json, :status => @status_code
	end

	def create_db_snapshot
		@resource_interface = getResourceInterface(params)		
		@resource_interface.create_db_snapshot(params[:db_instance_identifier], params[:db_snapshot_identifier])
        
        # Setup audit log info
        @physical_resource_id = params[:db_instance_identifier]
		audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:db_instance_identifier]
        audit_log
		render :json => @response.to_json, :status => @status_code 
	end

	def create_db_parameter_group
		@rds = getResourceInterface(params)	
		parameter_group = @rds.create_db_parameter_group(params[:name], params[:family], params[:description])
        
        # Setup audit log info
        @physical_resource_id = params[:name]
		audit_log
		render :json => parameter_group
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
		render :json => @response.to_json, :status => @status_code
	end

	def create_db_security_group
		@resource_interface = getResourceInterface(params)		
		security_group = @resource_interface.create_db_security_group(params[:name], params[:description])
        # Setup audit log info
        @physical_resource_id = params[:name]
		audit_log
		render :json => security_group
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
		render :json => @response.to_json, :status => @status_code 
	end
    
    def delete_db_security_group
        @resource_interface = getResourceInterface(params)
        @resource_interface.security_groups.get(params[:physical_id]).destroy
        
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
		audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code        
    end

	def describe_events
		db_id = params[:db_instance_identifier]
		@account = $client.cloud_account_details(params[:cloud_account_id])
		options = {}
		CloudTargetOverride.get_cloud_url_params(@account, params[:service], options )
		unless options.empty?
			options[:server] = options[:host]
			options.delete(:host)
			options[:protocol] = "http"
			options[:service] = options[:path]
			options.delete(:path)
		end
		@resource_interface = RightAws::RdsInterface.new(@account.access_key, @account.secret_key, options)
		options = {}
		options[:aws_id] = db_id
		options[:source_type] = "db-instance"
		events = @resource_interface.describe_events(options)
		render :json => events.to_json
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code        
	end

	def describe_db_snapshots
		@resource_interface = getResourceInterface(params)
		snapshots = []
        begin
            @resource_interface.snapshots.all(:identifier => params[:db_instance_identifier]).each {|snap| snapshots << snap.attributes}
        rescue Excon::Errors::NotFound => @error
            # Topstack throws error if no snapshots found
        end
        
		render :json => snapshots
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code
	end

	def delete_db_snapshot
		@resource_interface = getResourceInterface(params)		
		snapshot = @resource_interface.snapshots.get(params[:db_snapshot_identifier])
		snapshot.destroy
        
        # Setup audit log info
        @physical_resource_id = params[:db_snapshot_identifier]
		audit_log
		render :json => snapshot.attributes
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:db_snapshot_identifier]
        audit_log
		render :json => @response.to_json, :status => @status_code 
	end


	def describe_db_security_groups
		@resource_interface = getResourceInterface(params)
        if params[:physical_id].nil?
            security_groups = []
            @resource_interface.security_groups.each {|group| security_groups << group.attributes}
            render :json => security_groups
        else
            security_group = @resource_interface.security_groups.get(params[:physical_id])
            render :json => security_group.attributes
        end
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code 
	end

	def describe_db_parameter_groups
		@resource_interface = getResourceInterface(params)
		parameter_groups = []
		@resource_interface.parameter_groups.each {|group| parameter_groups << group.attributes}
		render :json => parameter_groups
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code       
	end

	def describe_db_engine_versions
		@rds = getResourceInterface(params)
		engine_versions = @rds.describe_db_engine_versions.body['DescribeDBEngineVersionsResult']['DBEngineVersions'].as_json
		engine_versions.each do |v|
			v.each_pair do |name, value|
				v[name] = value.strip
			end
		end
		render :json => engine_versions
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code 
	end

	def get_rds_resources
		@resource_interface = getResourceInterface(params)
		security_groups = []
        @resource_interface.security_groups.each {|group| security_groups << group.attributes}
		parameter_groups = []
		@resource_interface.parameter_groups.each {|group| parameter_groups << group.attributes}
		engine_versions = @resource_interface.describe_db_engine_versions.body['DescribeDBEngineVersionsResult']['DBEngineVersions'].as_json
		engine_versions.each do |v|
			v.each_pair do |name, value|
				v[name] = value.strip
			end
		end
		cloud_id = $client.cloud_account_details(params[:cloud_account_id]).cloud_id
		rds_prices = get_prices("rds", cloud_id)
		ebs_prices = get_prices("ebs", cloud_id)
		prices = rds_prices + ebs_prices
		resources = {:security_groups => security_groups, :parameter_groups => parameter_groups, :engine_versions => engine_versions, :prices => prices}
		render :json => resources.to_json
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code
	end
    
    def modify_db_parameter_group
        @resource_interface = getResourceInterface(params)
        @resource_interface.modify_db_parameter_group(params[:group_name], params[:group_parameters])
        
        # Setup audit log info
        @physical_resource_id = params[:group_name]
        audit_log
        render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:group_name]
        audit_log
		render :json => @response.to_json, :status => @status_code 
	end
    
    def reboot_db_instance
        @resource_interface = getResourceInterface(params)
        @resource_interface.reboot_db_instance(params[:db_instance_identifier])
        
        # Setup audit log info
        @physical_resource_id = params[:db_instance_identifier]
        audit_log
        render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:db_instance_identifier]
        audit_log
		render :json => @response.to_json, :status => @status_code       
    end
    
    def authorize_db_security_group_ingress
        @resource_interface = getResourceInterface(params)
        security_group = @resource_interface.security_groups.get(params[:name])
        security_group.authorize_ingress(params[:options])
        
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
        render :json => security_group.attributes
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
		render :json => @response.to_json, :status => @status_code  
    end
    
    def revoke_db_security_group_ingress
        @resource_interface = getResourceInterface(params)
        security_group = @resource_interface.security_groups.get(params[:name])
        security_group.revoke_ingress(params[:options])
        
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
        render :json => security_group.attributes
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
		render :json => @response.to_json, :status => @status_code  
    end
    

	##################
	#   S3 Actions
	##################
	
	def describe_storage
		set_storage(params)
        if $storage.is_a?Openstack::Swift::Client
            directories = $storage.list_containers
		elsif $storage.is_a?RightAws::S3Interface
			directories = $storage.list_all_my_buckets
			@attributes[:provider] = CloudConstants::Type::EUCA
        else
            directories = $storage.directories
        end
		parser = MultiCloudParser::Storage.new
		formatted_directories = parser.describe_storage_parser(@attributes[:provider], directories)
		render :json => formatted_directories
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code    
	end
	
	def get_s3_price
		cloud_id = $client.cloud_account_details(params[:cloud_account_id]).cloud_id
		prices = get_prices("s3", cloud_id)
		render :json => prices
	end
	
	def delete_object
		set_storage(params)
		if $storage.is_a?RightAws::S3Interface
			$storage.delete(params[:physical_id], params[:key])
		else
			$storage.directories.get(params[:physical_id]).files.get(params[:key]).destroy
		end
        
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
		audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code        
	end
	
	def upload_file_to_bucket
		set_storage(params)
		if $storage.is_a?RightAws::S3Interface
			$storage.put(params[:physical_id], params[:Filename], params[:Filedata])
		else
			$storage.directories.get(params[:physical_id]).files.create({:key => params[:Filename], :body => params[:Filedata]})
		end
        
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
		audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code       
	end
	
	def get_object
		set_storage(params)
		if $storage.is_a?RightAws::S3Interface
            object = $storage.get_object(params[:physical_id], params[:key])
		else
			object = $storage.directories.get(params[:physical_id]).files.get(params[:key]).body
		end
        
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
        render :json => object
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code       
	end
	
	def force_delete_bucket
		set_storage(params)
		if $storage.is_a?RightAws::S3Interface
			$storage.force_delete_bucket(params[:physical_id])
		else
			directory = $storage.directories.get(params[:physical_id])
			directory.files.each do |t|
				t.destroy
			end
			directory.destroy
		end
        
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
		audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code            
	end

	def list_all_my_buckets
		@resource_interface = getResourceInterface(params)
       	render :json => @resource_interface.list_all_my_buckets.to_json
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code             
	end

	def create_storage_container
		set_storage(params)
		if $storage.is_a?RightAws::S3Interface
			$storage.create_bucket(params[:name])
		else
			$storage.directories.create(:key => params[:name])
		end
        
        # Setup audit log info
        @physical_resource_id = params[:name]
		audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
		render :json => @response.to_json, :status => @status_code             
	end

	def list_bucket
		set_storage(params)
        if $storage.is_a?Openstack::Swift::Client
            files = $storage.get_objects(params[:physical_id])
		elsif $storage.is_a?RightAws::S3Interface
			files = $storage.list_bucket(params[:physical_id])
			@attributes[:provider] = CloudConstants::Type::EUCA
        else
            directories = $storage.directories
            files = $storage.directories.get(params[:physical_id]).files
        end
		parser = MultiCloudParser::Storage.new
		formatted_files = parser.describe_files_parser(@attributes[:provider], files)
		render :json => formatted_files
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code             
	end
	
	def create_and_upload_embedded_projects
		@resource_interface = getResourceInterface(params)
		projectsArray = JSON.parse(params[:projects_array])
		projectsArray.each do |t|
			new_bucket = @resource_interface.create_bucket(t["bucket_name"])
			key_name = t["project_name"] + ".template"
			@resource_interface.put(t["bucket_name"], key_name, t["project_template"])
		end
		
		render :json => projectsArray.to_json
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code             
	end
	
	def delete_studio_embedded_stack_bucket
		@resource_interface = getResourceInterface(params)
		render :json => @resource_interface.force_delete_bucket(params[:bucket_name])
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code     
	end

	##################
	#   SDB Actions
	##################
	
	def describe_simple_db_instances
		@sdb = getResourceInterface(params)
		domains = []
		sdb_list = @sdb.list_domains.body["Domains"]
		sdb_list.each do |t|
			domain = @sdb.domain_metadata(t).body
			domain = domain.merge({"DomainName" => t})
			domains << domain
		end
		render :json => domains
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code             
	end

	def create_domain
		@sdb = getResourceInterface(params)
		@sdb.create_domain(params[:physical_id])
        
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code             
	end

	def list_sdb_content
		@sdb = getResourceInterface(params)
		formatted_contents = []
		select_statement = "SELECT * FROM " + params[:physical_id]
		contents = @sdb.select(select_statement).body["Items"]
		contents.each do |t|
			item = {}
			item["Name"] = t[0]
			item["Attributes"] = []
			t[1].each do |s|
				att = {}
				att["Name"] = s[0]
				att["Value"] = s[1]
				item["Attributes"] << att
			end
			formatted_contents << item
		end
		render :json => formatted_contents
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code             
	end

	def delete_domain
		@sdb = getResourceInterface(params)
		@sdb.delete_domain(params[:physical_id])
        
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code             
	end

	##################
	#   SNS Actions
	##################

	def describe_topics
		@sns = getResourceInterface(params)
		topics = []
		topic_list = @sns.list_topics.body["Topics"]
		topic_list.each do |t|
			topic = @sns.get_topic_attributes(t).body["Attributes"]
			topic_arn_split = t.split(':')
			if(topic_arn_split.length > 0)
				name = topic_arn_split[topic_arn_split.length - 1]
			else
				name = ""
			end
			subscriptions = @sns.list_subscriptions_by_topic(t).body["Subscriptions"]
			topic = topic.merge({"TopicName" => name, "Subscriptions" => subscriptions, "TopicArn" => t})
			topics << topic
		end
		render :json => topics
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code             
	end

	def list_topics
		@account = $client.cloud_account_details(params[:cloud_account_id])
        @resource_interface = AWS::SNS.new(:access_key_id => @account.access_key, :secret_access_key => @account.secret_key)
		topics = []
		@resource_interface.topics.each do |t|
			topic = t.to_h
			topic.delete(:policy)
			subscriptions = []
			t.subscriptions.each do |subscription|
				subscriptions << {:endpoint => subscription.endpoint, :protocol => subscription.protocol.to_s, :subscription_arn => subscription.arn}
	        	end
			topic.merge(:subscriptions => subscriptions)
			topics << topic
		end
		render :json => topics.to_json
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code             
	end

	def topic_details
		@resource_interface = getResourceInterface(params)
		topic = @resource_interface.topics[params[:physical_id]].to_h
		topic.delete(:policy)
		render :json => topic.to_json
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code             
	end

	def create_topic
        @sns = getResourceInterface(params)
		if params[:subscriptions] == "null"
			subscriptions = []
		else
			subscriptions = JSON.parse(params[:subscriptions])
		end
		topic_arn = @sns.create_topic(params[:name]).body["TopicArn"]
		subscriptions.each do |t|
			@sns.subscribe(topic_arn, t["Endpoint"], t["Protocol"])
		end
        
        # Setup audit log info
        @physical_resource_id = topic_arn
        @logical_resource_id = params[:name]
        audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @logical_resource_id = params[:name]
        audit_log
		render :json => @response.to_json, :status => @status_code             
	end
    
	def subscribe
        @resource_interface = getResourceInterface(params)
		subscriptions = Array(JSON.parse(params[:subscriptions]))
		subscriptions.each do |subscription|
	            topic.subscribe()
		end		
        audit_log
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        audit_log
		render :json => @response.to_json, :status => @status_code             
	end

	def get_subscriptions
		@resource_interface = getResourceInterface(params)
		topic = @resource_interface.topics[params[:topic_arn]]
		subscriptions = []
		topic.subscriptions.each do |subscription|
			subscriptions << {:endpoint => subscription.endpoint, :protocol => subscription.protocol.to_s, :subscription_arn => subscription.arn}
	        end
		render :json => subscriptions.to_json
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code             
	end
	
	def delete_topic
		@sns = getResourceInterface(params)
		@sns.delete_topic(params[:physical_id])
        
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code             
	end

=begin
	def unsubscribe
		@resource_interface = getResourceInterface(params)

	     sns = topic.getSnsInterface
	     subscriptions = sns.topics[topic.topic_arn].subscriptions
	     subscriptions.each do |sub|
	        if sub.endpoint == endpoint && sub.arn == subscription_arn
	           sub.unsubscribe
	           return true
	        end
	      end
	      return false
	end
=end
	
	##################
	#   SQS Actions
	##################
	
	def describe_message_queues
        queues = []
		queue_list = @resource_interface.list_queues.body["QueueUrls"]
		queue_list.each do |q|
            queue_url_split = q.split('/')
            if(queue_url_split.length > 0)
                # Queue name is last item in url path.
                name = queue_url_split[queue_url_split.length - 1]
            else
                name = ""
            end
            
            queue = {"QueueUrl" => q, "QueueName" => name}
            
            # Even though a user can list all queues, they may not have access to get_queue_attributes
            begin
                attrs = @resource_interface.get_queue_attributes(q, "All").body["Attributes"]
                queue.merge!(attrs)
                
                # Format time stamps to UTC
                queue["CreatedTimestamp"] = queue["CreatedTimestamp"].utc,
                queue["LastModifiedTimestamp"] = queue["LastModifiedTimestamp"].utc
            rescue Excon::Errors::Forbidden
                # Forbidden access on queue, do nothing
            rescue Excon::Errors::BadRequest
                # Deleted queues stay in list for about 20 seconds
            end
            
            queues << queue
		end
        
		render :json => queues
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code             
	end

	def create_queue
        queue_url = @resource_interface.create_queue(params[:name]).body["QueueUrl"]
		queue_url_split = queue_url.split('/')
        if(queue_url_split.length > 0)
            name = queue_url_split[queue_url_split.length - 1]
        else
            name = ""
        end
        
        attributes = params[:attributes]
        attributes.keys.each do |key|
            @resource_interface.set_queue_attributes(queue_url, key, attributes[key])
        end
        
        # Setup audit log info
        @physical_resource_id = params[:name]
		audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:name]
        audit_log
		render :json => @response.to_json, :status => @status_code             
	end
	
	def delete_queue
		@resource_interface.delete_queue(params[:physical_id])
        
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code             
	end

	def list_queues
        render :json => @resource_interface.list_queues.to_json
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code             
	end

	def set_queue_attributes
        attributes = params[:queue_attributes]
        
        attributes.keys.each do |key|
            @resource_interface.set_queue_attributes(params[:queue_url], key, attributes[key])
        end
        
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :nothing => true
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
        # Setup audit log info
        @physical_resource_id = params[:physical_id]
        audit_log
		render :json => @response.to_json, :status => @status_code           
	end

	def get_queue_attributes
		render :json => @resource_interface.get_queue_attributes(params[:physical_id]).to_json
	rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code             
	end
    
    def send_message
        response = @resource_interface.send_message(params[:queue_url], params[:message])
        render :json => response.body
    rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code
    end
    
    def receive_message
        response = @resource_interface.receive_message(params[:queue_url])
        render :json => response.body["Message"][0]
    rescue => error
        @response = Error.new(error)
		@status_code = @response.code
		render :json => @response.to_json, :status => @status_code
    end        
	
	######################
	#   General Actions
	######################
	
    def get_cloud_prices
		prices = $client.cloud_details(params[:cloud_id]).prices
		render :json => prices
	end
    
    private
    
	def get_cloud_type
		cloud_account = $client.cloud_account_details(params[:cloud_account_id])
		
		if !cloud_account.nil?
			return cloud_account.cloud_name
		else
			return nil
		end		
	end
	
	def build_cloud_auth_attributes(cloud_account_id)
		@account = $client.cloud_account_details(cloud_account_id)
		@cloud = $client.cloud_details(@account.cloud_id)
		attributes = @account.cloud_attributes
        
        if @cloud.cloud_provider == CloudConstants::Type::EUCA
            attributes[:provider] = "AWS"
            options = {}
            
            # Block storage services use EC2/compute APIs
			if params[:service] == "EBS"
				params[:service] = ServiceTypes::EC2
			end
            CloudTargetOverride.get_cloud_url_params(@account, params[:service], options)
	
            aws_options = {}
            aws_options[:connection_options] = {:connection_timeout => 20, :read_timeout => 20, :retry_limit => 2, :write_timeout => 20}
            aws_options[:aws_access_key_id] = @account.access_key
            aws_options[:aws_secret_access_key] = @account.secret_key			
            unless options.empty?
                aws_options = aws_options.merge(:host => options[:host], :port => options[:port], :path => options[:path], :scheme => "http")
                attributes = attributes.merge(aws_options)
            end
        else
            attributes[:provider] = @cloud.cloud_provider
        end        
		attributes.symbolize_keys!
		if @cloud.cloud_provider == CloudConstants::Type::OPENSTACK
			if !@cloud.url.right_blank?
				key = "#{@cloud.cloud_provider.downcase}_auth_url"
				attributes.merge!({key.to_sym=>@cloud.url})
			end
		elsif @cloud.cloud_provider == CloudConstants::Type::CLOUDSTACK
			@auth_attributes = {:username=>attributes[:cloudstack_api_key], :password=>attributes[:cloudstack_secret_access_key], :domain => attributes[:domain]}
			host_key = "#{@cloud.cloud_provider.downcase}_host"
			port_key = "#{@cloud.cloud_provider.downcase}_port"
			scheme_key = "#{@cloud.cloud_provider.downcase}_scheme"
			attributes = {:provider=>@cloud.cloud_provider, host_key=>@cloud.host, port_key=>@cloud.port, scheme_key=>@cloud.protocol}
            attributes.symbolize_keys!
		end
		return attributes
	end
	
	def set_compute(params)
        # Mock is used for dev/test purposes
        #Fog.mock!
		@attributes = build_cloud_auth_attributes(params[:cloud_account_id])
		if @cloud.cloud_provider == CloudConstants::Type::AWS && !params[:region].nil?
			@attributes[:region] = params[:region]
		elsif @cloud.cloud_provider == CloudConstants::Type::EUCA
			@attributes[:version] = "2010-08-31"
		end
		$compute = Fog::Compute.new(@attributes)
		if $compute.is_a?Fog::Compute::Cloudstack::Real
			$compute.login(@auth_attributes[:username], @auth_attributes[:password], @auth_attributes[:domain])
		end
	end
	
	def set_storage(params)	
        @attributes = build_cloud_auth_attributes(params[:cloud_account_id])
        if @cloud.cloud_provider == CloudConstants::Type::OPENSTACK
            params[:service] = "S3"
            $storage = getResourceInterface(params)
		elsif is_euca
			$storage = RightAws::S3Interface.new(@attributes[:aws_access_key_id], @attributes[:aws_secret_access_key], {	:server=>@attributes[:host],
																															:service=>@attributes[:path],
																															:port=>@attributes[:port],
																															:protocol=>@attributes[:scheme]})
        else
            @attributes[:connection_options] = {:retry_limit => 1}
            if @cloud.cloud_provider == CloudConstants::Type::AWS && !params[:region].nil?
                @attributes[:region] = params[:region]
            end
            $storage = Fog::Storage.new(@attributes)
		end
	end
	
	def set_compute_price
		cloud_details = $client.cloud_details(params[:cloud_account_id])
		found = false
		price = {}
		cloud_details.prices.each do |t|
			if t.name == params[:price_name]
				found = true
				price = t
			end
		end
		if found
			render :json => price
		else
			render :text => "N/A"
		end
	end
	
	def get_prices(type, cloud_id)
		prices = []
		cloud_details = $client.cloud_details(cloud_id)
		cloud_details.prices.each do |t|
			if t.type == type
				prices << t
			end
		end
		return prices
	end
	
	def is_amazon
		if @attributes[:provider] == CloudConstants::Type::AWS && @attributes[:host].nil? #host confirms it is not eucalyptus
			return true
		else
			return false
		end
	end
	
	def is_euca
		if @attributes[:provider] == CloudConstants::Type::AWS && !@attributes[:host].nil? #host confirms it is eucalyptus
			return true
		else
			return false
		end
	end
  
    # Override render function
    def render(options = nil, deprecated_status = nil, &block)
        # add custom response header for message support
        unless @response.nil?
            response.headers["ErrorMessage"] = @response.message
            response.headers["ErrorTitle"]   = @response.title
        end

        # call the ActionController::Base render to show the page
        super
    end

    # Setup interface for working with cloud items
    def setup_interface
        # Mock is used for dev/test purposes
        #Fog.mock!
        if !params[:service].nil? && params[:service] != "null"
            @resource_interface = getResourceInterface(params)
            
            # Add extra support for SQS
            if params[:service] == "SQS"
                require "#{Rails.root}/lib/fog/sqs_mixin.rb"
                @resource_interface.extend(SqsMixin)
            end
        end
    end
  
end
