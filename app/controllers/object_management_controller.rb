class ObjectManagementController < ApplicationController
	include ServiceInterfaceMethods

	def launch_resource
		account_info = {:cloud_account_id => params[:cloud_account_id]}
		case params[:object_type]
			when "beanstalk"
				account_info[:service] = "AWSEB"
		        @eb = getResourceInterface(account_info)
				account_info[:service] = "S3"
				@s3 = getResourceInterface(account_info)
				launch_beanstalk(params)
			when "ebs"
				account_info[:service] = "EC2"
				@ebs = getResourceInterface(account_info)
				launch_ebs(params)
			when "elc"
				account_info[:service] = "ELC"
				@elc = getResourceInterface(account_info)
				launch_elc(params)
			when "sns"
				account_info[:service] = "SNS"
				@sns = getResourceInterface(account_info)
				launch_sns(params)
			when "s3"
				account_info[:service] = "S3"
				@s3 = getResourceInterface(account_info)
				launch_s3(params)
			when "ec2"
				account_info[:service] = "EC2"
				@ec2 = getResourceInterface(account_info)
				launch_ec2(params)
			when "autoscale"
				account_info[:service] = "ACW"
       			@acw = getResourceInterface(account_info)
				account_info[:service] = "AS"
    			@as = getResourceInterface(account_info)
				launch_autoscale(params)
			when "iamGroup"
				account_info[:service] = "IAM"
				@iam = getResourceInterface(account_info)
				launch_iam_group(params)
			when "iamUser"
				account_info[:service] = "IAM"
				@iam = getResourceInterface(account_info)
				keys = launch_iam_user(params)
			when "alarm"
				account_info[:service] = "ACW"
				@acw = getResourceInterface(account_info)
				launch_alarm(params)
			when "sdb"
				account_info[:service] = "SDB"
				@sdb = getResourceInterface(account_info)
				launch_sdb(params)
		end

		if params[:object_type] == "iamUser" && params[:generate_keys] == "true"
			render :json => keys.to_json
		else
			render :nothing => true
		end
	end

	def launch_beanstalk(params)
		beanstalk_object = JSON.parse(params[:beanstalk_object])
		#create beanstalk app
		options = {}
		options[:description] = beanstalk_object["elastic_beanstalk_app"]["description"]

		@eb.create_application(beanstalk_object["elastic_beanstalk_app"]["name"], options)

		#create beanstalk app versions_snippets
		options = {}
       	options[:description]             = beanstalk_object["elastic_beanstalk_app_version"]["description"] unless beanstalk_object["elastic_beanstalk_app_version"]["description"].nil?
       	options[:auto_create_application] = beanstalk_object["elastic_beanstalk_app_version"]["auto_create"] unless beanstalk_object["elastic_beanstalk_app_version"]["auto_create"].nil?
       	options[:s3_bucket]               = beanstalk_object["elastic_beanstalk_app_version"]["s3_bucket"] unless beanstalk_object["elastic_beanstalk_app_version"]["s3_bucket"].nil?
       	options[:s3_key]                  = beanstalk_object["elastic_beanstalk_app_version"]["s3_key"] unless beanstalk_object["elastic_beanstalk_app_version"]["s3_key"].nil?
	
		if get_cloud_type == CloudConstants::Type::AWS && options[:s3_bucket] != "elasticbeanstalk-samples-us-east-1"
			bucket = options[:s3_bucket] + "/"
			@s3.create_bucket(bucket)
		end

		@eb.create_application_version(beanstalk_object["elastic_beanstalk_app"]["name"], beanstalk_object["elastic_beanstalk_app_version"]["version_label"], options)

		#create beanstalk environment
		if !beanstalk_object["elastic_beanstalk_env"].nil?
       		options = {}
       		#options[:template_name]       = beanstalk_object["elastic_beanstalk_env"]["template_name"] unless beanstalk_object["elastic_beanstalk_env"]["template_name"].nil?
       		options[:description]         = beanstalk_object["elastic_beanstalk_env"]["description"] unless beanstalk_object["elastic_beanstalk_env"]["description"].nil?
       		options[:cname]               = beanstalk_object["elastic_beanstalk_env"]["cname"] unless beanstalk_object["elastic_beanstalk_env"]["cname"].nil?
       		options[:version_label]       = beanstalk_object["elastic_beanstalk_env"]["version_label"] unless beanstalk_object["elastic_beanstalk_env"]["version_label"].nil?
       		options[:solution_stack_name] = beanstalk_object["elastic_beanstalk_env"]["solution_stack_name"] unless beanstalk_object["elastic_beanstalk_env"]["solution_stack_name"].nil?
       		
       		if get_cloud_type == CloudConstants::Type::AWS
	       		@eb.create_environment(beanstalk_object["elastic_beanstalk_app"]["name"], beanstalk_object["elastic_beanstalk_env"]["name"], options)
			end
       	end
	end

	def launch_ebs(params)
		if(params[:snapshot_id] == nil)
			size = Integer(params[:size])
		else
			size = nil
		end
	     	volume = @ebs.create_volume(params[:snapshot_id], size, params[:availability_zone])
	     	@ebs.create_tags(volume[:aws_id], {"Name" => params[:name]})
	end

	def launch_elc(params)
		options = {}
  		options[:node_type] = params[:node_type] unless params[:node_type].nil?
  		options[:num_nodes] = params[:node_number] unless params[:node_number].nil?
  		options[:engine] = params[:engine] unless params[:engine].nil?
  		options[:engine_version] = params[:engine_version] unless params[:engine_version].nil?
  		options[:port] = params[:cache_port] unless params[:cache_port].nil?
  		options[:preferred_availability_zone] = params[:availability_zone] unless params[:availability_zone].nil?
 	 	options[:auto_minor_version_upgrade] = params[:auto_minor_version_upgrade] unless params[:auto_minor_version_upgrade].nil?
  		options[:cache_security_group_names] = params[:security_group] unless params[:security_group].nil?
  		options[:cache_parameter_group_name] = params[:parameter_group] unless params[:parameter_group].nil?
  		options[:preferred_maintenance_window] = params[:maintenance_window] unless params[:maintenance_window].nil?
  		options[:notification_topic_arn] = params[:sns_notifications] unless params[:sns_notifications].nil?

  		@elc.create_cache_cluster(params[:name], options)
	end


	
	def launch_sns(params)
		subArray = Array(JSON.parse(params[:subscriptions]))
    		
       	topic = @sns.topics.create(params[:name])
       	subArray.each do |t|
       		topic.subscribe(t["Endpoint"])
		end
	end
	
	def launch_s3(params)
		if get_cloud_type == CloudConstants::Type::OPENSTACK
			bucket_name = params[:name] + "/"
		else
			bucket_name = params[:name]
		end
    	@s3.create_bucket(bucket_name)
	end
	

	
	def launch_ec2(params)
		security_groups = Array(JSON.parse(params[:security_groups]))
		
		options = {}
		options[:key_name] = params[:key_name] unless params[:key_name].nil?
		options[:security_groups] = security_groups unless security_groups.nil?
		options[:instance_type] = params[:instance_type] unless params[:instance_type].nil?
		options[:availability_zone] = params[:availability_zone] unless params[:availability_zone].nil?
		options[:monitoring_enabled] = params[:monitoring_enabled] unless params[:monitoring_enabled].nil?
		options[:disable_api_termination] = params[:disable_api_termination] unless params[:disable_api_termination].nil?
		options[:instance_initiated_shutdown_behavior] = params[:instance_initiated_shutdown_behavior] unless params[:instance_initiated_shutdown_behavior].nil?
		
  		instance = @ec2.launch_instances(params[:image_id], options)[0]
  		@ec2.create_tags(instance[:aws_instance_id], {"Name" => params[:name]})
	end
	
	def launch_autoscale(params)
    	security_groups = Array(JSON.parse(params[:security_groups]))
    	
		#create launch configuration
  		options = {}
  		options[:key_name] = params[:key_name] unless params[:key_name].nil?
  		options[:security_groups] = security_groups
  		if(!params[:monitoring_enabled])
			options[:instance_monitoring] = { 'Enabled' => false }
		end

        name = params[:name]
        launch_config_name = name + "-lc"
     	@as.create_launch_configuration(launch_config_name, params[:image_id], params[:instance_type], options)

		#create autoscale
   		options = {}
   		options[:desired_capacity] = params[:min_size] unless params[:min_size].nil?
   		options[:min_size] = params[:min_size] unless params[:min_size].nil?
   		options[:max_size] = params[:max_size] unless params[:max_size].nil?
   		@as.create_auto_scaling_group(name, launch_config_name, params[:availability_zone], options)
       		
       	#TODO: Needs to be updated, right_aws does not have put_scaling_policy action
   		if(params[:trigger])
			#create scale up policy and metric alarm
			scaleUpName = name + "ScaleUpPolicy"
			upPolicy = @as.put_scaling_policy("ChangeInCapacity", name, scaleUpName, params[:scale_increment])
			upOptions = {}
			upOptions['AlarmName'] = name + params[:trigger_measurement] + "UpAlarm"
			upOptions['AlarmActions'] = [upPolicy]
			upOptions['Dimensions'] = [{'Name' => "AutoScalingGroupName", 'Value' => name}]
			upOptions['ComparisonOperator'] = "GreaterThanThreshold"
			upOptions['Namespace'] = "AWS/EC2"
			upOptions['EvaluationPeriods'] = 1
			upOptions['MetricName'] = params[:trigger_measurement]
			upOptions['Period'] = params[:measure_period]
			upOptions['Statistic'] = params[:trigger_statistic]
			upOptions['Threshold'] = params[:upper_threshold]
			upOptions['Unit'] = params[:trigger_unit]
			@acw.put_metric_alarm(upOptions)
   			
   			#create scale down policy and metric alarm
   			scaleDownName = name + "ScaleDownPolicy"
   			downPolicy = @as.put_scaling_policy("ChangeInCapacity", name, scaleDownName, params[:scale_decrement])
   			downOptions = {}
   			downOptions['AlarmName'] = name + params[:trigger_measurement] + "DownAlarm"
   			downOptions['AlarmActions'] = [downPolicy]
   			downOptions['Dimensions'] = [{'Name' => "AutoScalingGroupName", 'Value' => name}]
   			downOptions['ComparisonOperator'] = "LessThanThreshold"
   			downOptions['Namespace'] = "AWS/EC2"
   			downOptions['EvaluationPeriods'] = 1
   			downOptions['MetricName'] = params[:trigger_measurement]
   			downOptions['Period'] = params[:measure_period]
   			downOptions['Statistic'] = params[:trigger_statistic]
   			downOptions['Threshold'] = params[:lower_threshold]
   			downOptions['Unit'] = params[:trigger_unit]
   			@acw.put_metric_alarm(downOptions)
   		end
	end
	
	def launch_iam_group(params)
		@iam.create_group(params[:name])

		@iam.put_group_policy(params[:name], params[:policy_name], params[:policy_document])
		
		userArray = JSON.parse(params[:users])
		if params[:user_type] == "true"
			userArray.each do |name|
				@iam.create_user(name)
				@iam.add_user_to_group(params[:name], name)
			end
		else
			userArray.each do |name|
				@iam.add_user_to_group(params[:name], name)
			end
		end
	end
	
	def launch_iam_user(params)
		@iam.create_user(params[:name])
		
		if params[:password] != ""
			@iam.create_login_profile(params[:name], params[:password])
		end
		
		if params[:generate_keys] == "true"
			key = @iam.create_access_key(params[:name])
			return key.to_json
		end
	end
	
	def launch_alarm(params)
		alarm_actions = JSON.parse(params[:alarm_actions])
		ok_actions = JSON.parse(params[:ok_actions])
		insufficient_actions = JSON.parse(params[:insufficient_actions])
	
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
		
		@acw.put_metric_alarm(options)
	end
	
	def launch_sdb(params)
		@sdb.create_domain({:domain_name => params[:name]})
	end

	def destroy_resource
		account_info = {:cloud_account_id => params[:cloud_account_id]}
		case params[:object_type]
			when "sns"
				@sns = getResourceInterface(account_info)
				destroy_sns(params)
			when "sqs"
				@sqs = getResourceInterface(account_info)
				destroy_sqs(params)
			when "iamGroup"
				@iam = getResourceInterface(account_info)
				destroy_iam_group(params)
			when "iamUser"
				@iam = getResourceInterface(account_info)
				destroy_iam_user(params)
		end

		render :nothing => true
	end
	
	def destroy_sns(params)
       	topic = @sns.topics[(params[:resource_id])]
       	topic.delete
	end
	
	def destroy_sqs(params)
		@sqs.delete_queue(params[:resource_id])
	end
	
	def destroy_iam_group(params)
		#Remove policies from group
		@iam.list_group_policies({'group_name' => params[:resource_id]}).policy_names.each do |t|
			@iam.delete_group_policy({'group_name' => params[:resource_id], 'policy_name' => t})
		end
		#Remove users from group
		@iam.get_group({'group_name' => params[:resource_id]}).users.each do |x|
			@iam.remove_user_from_group({'group_name' => params[:resource_id], 'user_name' => x.user_name})
		end
		@iam.delete_group({'group_name' => params[:resource_id]})
	end
	
	def destroy_iam_user(params)
		@iam = getIamInterface(params[:cloud_account_id])
		
		#Remove policies from user
		@iam.list_user_policies({'user_name' => params[:resource_id]}).policy_names.each do |t|
			@iam.delete_user_policy({'user_name' => params[:resource_id], 'policy_name' => t})
		end
		#Remove user from groups
		@iam.list_groups_for_user({'user_name' => params[:resource_id]}).groups.each do |g|
			@iam.remove_user_from_group({'group_name' => g.group_name, 'user_name' => params[:resource_id]})
		end
		#Delete User Access Keys
		@iam.list_access_keys({'user_name' => params[:resource_id]}).access_key_metadata.each do |a|
			@iam.delete_access_key({'user_name' => params[:resource_id],'access_key_id' => a.access_key_id})
		end
		#Delete Signing Certs
		@iam.list_signing_certificates({'user_name' => params[:resource_id]}).certificates.each do |s|
			@iam.delete_signing_certificate({'certificate_id' => s.certificate_id})
		end
		
		begin
			@iam.delete_login_profile({'user_name' => params[:resource_id]})
		rescue
			#Rescue because there may not be a login, but user still needs to be deleted
		end
		@iam.delete_user({'user_name' => params[:resource_id]})
	end
	
	def get_private_key
   		dir = Rails.root.to_s << "/awsKeys/"
   		render :text => File.open(dir + params[:key_name] + ".pem", "rb").read
    end
    	
    def get_instances_in_zone
    	instances_in_zone = []
		ec2 = getEc2Interface(params[:cloud_account_id])

    		ec2_list = ec2.describe_instances
    		ec2_list.each do |t|
    			if(params[:zone] == t[:aws_availability_zone])
    				instance = {}
    				instance[:instance] = t[:aws_instance_id]
    				
    				instances_in_zone << instance
    			end
    		end
    		
    		render :xml => instances_in_zone
    end
    	
    def attach_volume
		ebs = getEbsInterface(params[:cloud_account_id])

    	ebs.attach_volume(params[:volume_id], params[:instance_id], params[:device])
    	
    	render :nothing => true
    end

    	
    def remove_instance_from_load_balancer
		elb = getElbInterface(params[:cloud_account_id])

    	elb.deregister_instances_with_load_balancer(params[:load_balancer_name], params[:instance_id])
    		
    	render :nothing => true
    end
    	
    def remove_availability_zone_from_load_balancer
		elb = getElbInterface(params[:cloud_account_id])

    	elb.disable_availability_zones_for_load_balancer(params[:load_balancer_name], params[:availability_zone])
    		
    	render :nothing => true
    end
    	
    def add_instance_to_load_balancer
		elb = getElbInterface(params[:cloud_account_id])

    		lb = elb.describe_load_balancers(params[:load_balancer_name]).first
    		if(!lb[:availability_zones].include?(params[:availability_zone]))
	    		elb.enable_availability_zones_for_load_balancer(params[:load_balancer_name], params[:availability_zone])
	    	end
	    	
	    	elb.register_instances_with_load_balancer(params[:load_balancer_name], params[:instance_id])
    		
    		render :nothing => true
    end
    	
    def add_availability_zone_to_load_balancer
			elb = getElbInterface(params[:cloud_account_id])

    		elb.enable_availability_zones_for_load_balancer(params[:load_balancer_name], params[:availability_zone])
    		
    		render :nothing => true
    end
    
    def remove_listener_from_load_balancer
    	elb = getElbInterface(params[:cloud_account_id])
    	
    	elb.delete_load_balancer_listeners(params[:load_balancer_name], params[:load_balancer_port])
    	
    	render :nothing => true
    end
    
    def add_listener_to_load_balancer
    	elb = getElbInterface(params[:cloud_account_id])
    	listener = [{:protocol => params[:protocol],
    				 :load_balancer_port => params[:load_balancer_port],
    				 :instance_protocol => params[:instance_protocol],
    				 :instance_port => params[:instance_port]}]	 
    				 
    	elb.create_load_balancer_listeners(params[:load_balancer_name], listener)
    	render :nothing => true
      rescue RightAws::AwsError => error
      	
		render :text => error.message, :status => 400
    end
    	
    def refresh_load_balancer    	
	    elb = getElbInterface(params[:cloud_account_id])
	    lb = elb.describe_load_balancers(params[:load_balancer_name]).first
	      	
		provisioned_load_balancer = {}
		provisioned_load_balancer[:name] = lb[:load_balancer_name]
		provisioned_load_balancer[:availability_zones] = lb[:availability_zones]
		provisioned_load_balancer[:health_check] = lb[:health_check]
		provisioned_load_balancer[:listeners] = lb[:listeners]
		provisioned_load_balancer[:security_group] = lb[:source_security_group]
		provisioned_load_balancer[:creation_date] = lb[:created_time].to_s unless lb[:created_time].nil?
		provisioned_load_balancer[:hosted_zone_id] = lb[:canonical_hosted_zone_name_id]
		provisioned_load_balancer[:instance_count] = lb[:instances].length
		provisioned_load_balancer[:instances] = lb[:instances]
		provisioned_load_balancer[:dns_name] = lb[:dns_name]
		provisioned_load_balancer[:state] = ProvisionState::Running
		
		availability_zones_health = []
		lb[:availability_zones].each do |r|
			az_health = {}
			az_health[:load_balancer_name] = lb[:load_balancer_name]
			az_health[:availability_zone] = r
			az_health[:instance_count] = 0
			az_health[:healthy] = false
			availability_zones_health << az_health
		end
		
		ec2 = getEc2Interface(params[:cloud_account_id])
		instance_health = elb.describe_instance_health(lb[:load_balancer_name])
		instance_health.each do |i|
			instance = ec2.describe_instances(i[:instance_id]).first
			i[:availability_zone] = instance[:aws_availability_zone]
			i[:load_balancer_name] = lb[:load_balancer_name]
			availability_zones_health.each do |a|
				if(a[:availability_zone] == i[:availability_zone])
					a[:instance_count] = a[:instance_count] + 1
					if(i[:state] == "InService")
						a[:healthy] = true
					end
				end
			end
		end
		
		provisioned_load_balancer[:availability_zones_health] = availability_zones_health
		provisioned_load_balancer[:instances_health] = instance_health

		render :xml => provisioned_load_balancer
    end
    	
    def get_lb_available_ec2
    		available_instances = []
    		unavailable_instance_ids = []
    	
    		as = getAsRightInterface(params[:cloud_account_id])
    		as_groups = as.describe_auto_scaling_groups
    		as_groups.each do |a|
    			as_instances = a[:instances]
    			as_instances.each do |s|
    				unavailable_instance_ids << s[:instance_id]
    			end
    		end
    		
    		elb = getElbInterface(params[:cloud_account_id])
    		load_balancers = elb.describe_load_balancers
    		load_balancers.each do |l|
    			lb_instances = l[:instances]
    			lb_instances.each do |b|
    				unavailable_instance_ids << b
    			end
    		end
    		
    		ec2 = getEc2Interface(params[:cloud_account_id])
    		ec2_instances = ec2.describe_instances
    		ec2_instances.each do |e|
    			ec2_id = e[:aws_instance_id]
    			if(!unavailable_instance_ids.include?(ec2_id))
    				new_status = e[:aws_state]
		  		case new_status
		    			when "pending"
		      				state = ProvisionState::Launching
		    			when "running"
		      				state = ProvisionState::Running
		    			when "shutting-down"
		      				state = ProvisionState::ShuttingDown
		    			when "terminated"
		      				state = ProvisionState::Terminated
		    			else
		      				state = ProvisionState::FailedLaunch
		  		end

				provisioned_ec2_instance = {}
				provisioned_ec2_instance[:name] = e[:tags]["Name"]
				provisioned_ec2_instance[:stack_resource_name] = e[:tags]["aws:cloudformation:logical-id"]
				provisioned_ec2_instance[:stack_name] = e[:tags]["aws:cloudformation:stack-name"]
				provisioned_ec2_instance[:instance_id] = e[:aws_instance_id]
				provisioned_ec2_instance[:image_id] = e[:aws_image_id]
				provisioned_ec2_instance[:root_device_type] = e[:root_device_type]
				provisioned_ec2_instance[:instance_type] = e[:aws_instance_type]
				provisioned_ec2_instance[:availability_zone] = e[:aws_availability_zone]
				provisioned_ec2_instance[:key_name] = e[:ssh_key_name]
				provisioned_ec2_instance[:public_ip_address] = e[:ip_address]
				provisioned_ec2_instance[:private_ip_address] = e[:private_ip_address]
				provisioned_ec2_instance[:public_dns_name] = e[:dns_name]
				provisioned_ec2_instance[:private_dns_name] = e[:private_dns_name]
				provisioned_ec2_instance[:launch_time] = e[:aws_launch_time]
				provisioned_ec2_instance[:kernel_id] = e[:aws_kernel_id]
				provisioned_ec2_instance[:ramdisk_id] = e[:aws_ramdisk_id]
				provisioned_ec2_instance[:detailed_monitoring] = e[:monitoring_state]
				provisioned_ec2_instance[:architecture] = e[:architecture]
				provisioned_ec2_instance[:virtualization_type] = e[:virtualization_type]
				provisioned_ec2_instance[:security_groups] = e[:aws_groups]
				provisioned_ec2_instance[:state] = state
   				available_instances << provisioned_ec2_instance
    			end
    		end

    		render :json => available_instances
    end

   def get_all_resources
  	items = {}
    	items[:provisioned_ec2_instances] = []
    	items[:provisioned_load_balancers] = []
    	items[:provisioned_rds_db_instances] = []
    	items[:provisioned_elastic_beanstalk_apps] = []
    	items[:provisioned_s3s] = []
    	items[:provisioned_ebs_volumes] = []
    	items[:provisioned_auto_scale_groups] = []
    	items[:provisioned_sqs_messages] = []
    	items[:provisioned_iam_groups] = []
    	items[:provisioned_iam_users] = []
    	items[:provisioned_alarms] = []
    	items[:provisioned_simple_dbs] = []
    	items[:provisioned_cdns] = []

	account_list = [params[:cloud_account_id]]
	
	case(params[:objects])
		when "bean"
    		items[:provisioned_elastic_beanstalk_apps] = get_beanstalk(account_list)
		when "rds"
    		items[:provisioned_rds_db_instances] = get_rds(account_list)
		when "elb"
    		items[:provisioned_load_balancers] = get_elb(account_list)
		when "autoscale"
	    	items[:provisioned_auto_scale_groups] = get_as(account_list)
		when "s3"
			items[:provisioned_s3s] = get_s3(account_list)
		when "ebs"
			items[:provisioned_ebs_volumes] = get_ebs(account_list)
		when "ec2"
			items[:provisioned_ec2_instances] = get_ec2(account_list)
		when "sqs"
			items[:provisioned_sqs_messages] = get_sqs(account_list)
		when "elc"
			items[:provisioned_elastic_caches] = get_elc(account_list)
		when "sns"
			items[:provisioned_sns_topics] = get_sns(account_list)
		when "alarm"
			items[:provisioned_alarms] = get_alarms(account_list)
		when "sdb"
			items[:provisioned_simple_dbs] = get_sdb(account_list)
		when "cdn"
			items[:provisioned_cdns] = get_cdn(account_list)
	end
     if items[:provisioned_ec2_instances].is_a?RightAws::AwsError
	     render :json => items[:provisioned_ec2_instances].errors.to_json, :status => items[:provisioned_ec2_instances].http_code
     else
	     render :xml => items
     end
  end

  def get_beanstalk(account_list)
	items = {}
    	items[:provisioned_elastic_beanstalk_apps] = []

    	account_list.each do |u|
      		bs = getAwsEbInterface(u)
	      	bs_list = bs.describe_applications
      		bs_list.each do |t|
			provisioned_elastic_beanstalk_app = {}
			provisioned_elastic_beanstalk_app[:name] = t[:application_name]
			provisioned_elastic_beanstalk_app[:description] = t[:description]
			provisioned_elastic_beanstalk_app[:versions] = bs.describe_application_versions(t[:application_name])
			provisioned_elastic_beanstalk_app[:environments] = bs.describe_app_environments(t[:application_name])
			provisioned_elastic_beanstalk_app[:events] = bs.describe_events({:application_name => t[:application_name]})
			
			begin
				provisioned_elastic_beanstalk_app[:environments].each do |e|
					e[:auto_scale_group_name] = bs.describe_environment_resources({:environment_name => e[:environment_name]}).first[:auto_scaling_groups].first
				end
			rescue
			
			end

			items[:provisioned_elastic_beanstalk_apps] << provisioned_elastic_beanstalk_app
      		end
	end
	return items[:provisioned_elastic_beanstalk_apps]
  end

  def get_rds(account_list)
	items = {}
    	items[:provisioned_rds_db_instances] = []

    	account_list.each do |u|
	      	rds = getRdsInterface(u)
	      	rds_list = rds.describe_db_instances
	      	rds_list.each do |t|
	  		new_status = t[:status]
	  		case new_status
	    			when "creating"
	      				state = ProvisionState::Launching
	      			when "backing-up"
	      				state = ProvisionState::BackingUp
	    			when "available"
	      				state = ProvisionState::Running
	    			when "deleting"
	      				state = ProvisionState::ShuttingDown
	    			else
	      				state = ProvisionState::Terminated
	  		end

			provisioned_rds_db_instance = {}
			provisioned_rds_db_instance[:name] = t[:aws_id]
			provisioned_rds_db_instance[:security_groups] = t[:db_security_groups]
			provisioned_rds_db_instance[:read_replicas] = t[:read_replica_db_instance_identifiers]
			provisioned_rds_db_instance[:last_restorable_time] = t[:latest_restorable_time]
			provisioned_rds_db_instance[:availability_zone] = t[:availability_zone]
			provisioned_rds_db_instance[:endpoint_address] = t[:endpoint_address]
			provisioned_rds_db_instance[:backup_period] = t[:backup_retention_period]
			provisioned_rds_db_instance[:multi_az] = t[:multi_az]
			provisioned_rds_db_instance[:endpoint_port] = t[:endpoint_port]
			provisioned_rds_db_instance[:parameter_group] = t[:db_parameter_group]
			provisioned_rds_db_instance[:engine_version] = t[:engine_version]
			provisioned_rds_db_instance[:backup_window] = t[:preferred_backup_window]
			provisioned_rds_db_instance[:db_name] = t[:db_name]
			provisioned_rds_db_instance[:auto_minor_version_upgrade] = t[:auto_minor_version_upgrade]
			provisioned_rds_db_instance[:maintenance_window] = t[:preferred_maintenance_window]
			provisioned_rds_db_instance[:creation_date] = t[:create_time]
			provisioned_rds_db_instance[:instance_class] = t[:instance_class]
			provisioned_rds_db_instance[:master_username] = t[:master_username]
			provisioned_rds_db_instance[:rds_engine] = t[:engine]
			provisioned_rds_db_instance[:rds_allocated_storage] = t[:allocated_storage]
			provisioned_rds_db_instance[:state] = state

			items[:provisioned_rds_db_instances] << provisioned_rds_db_instance
	 	end
	end
	return items[:provisioned_rds_db_instances]
  end

  def get_elb(account_list)
	items = {}
    	items[:provisioned_load_balancers] = []

    	account_list.each do |u|
	      	lb = getElbInterface(u)
	      	lb_list = lb.describe_load_balancers
	      	lb_list.each do |t|
			provisioned_load_balancer = {}
		  	provisioned_load_balancer[:name] = t[:load_balancer_name]
			provisioned_load_balancer[:availability_zones] = t[:availability_zones]
			provisioned_load_balancer[:health_check] = t[:health_check]
			provisioned_load_balancer[:listeners] = t[:listeners]
			provisioned_load_balancer[:security_group] = t[:source_security_group]
			provisioned_load_balancer[:creation_date] = t[:created_time].to_s unless t[:created_time].nil?
			provisioned_load_balancer[:hosted_zone_id] = t[:canonical_hosted_zone_name_id]
			provisioned_load_balancer[:instance_count] = t[:instances].length
			provisioned_load_balancer[:instances] = t[:instances]
			provisioned_load_balancer[:dns_name] = t[:dns_name]
			provisioned_load_balancer[:state] = ProvisionState::Running
			
			availability_zones_health = []
			t[:availability_zones].each do |r|
				az_health = {}
				az_health[:load_balancer_name] = t[:load_balancer_name]
				az_health[:availability_zone] = r
				az_health[:instance_count] = 0
				az_health[:healthy] = false
				availability_zones_health << az_health
			end
			
			ec2 = getEc2Interface(u)
			instance_health = lb.describe_instance_health(t[:load_balancer_name])
			instance_health.each do |i|
				instance = ec2.describe_instances(i[:instance_id]).first
				i[:availability_zone] = instance[:aws_availability_zone]
				i[:load_balancer_name] = t[:load_balancer_name]
				availability_zones_health.each do |a|
					if(a[:availability_zone] == i[:availability_zone])
						a[:instance_count] = a[:instance_count] + 1
						if(i[:state] == "InService")
							a[:healthy] = true
						end
					end
				end
			end
			
			provisioned_load_balancer[:availability_zones_health] = availability_zones_health
			provisioned_load_balancer[:instances_health] = instance_health

			items[:provisioned_load_balancers] << provisioned_load_balancer
		end
	end
	return items[:provisioned_load_balancers]
  end

  def get_as(account_list)
	items = {}
    	items[:provisioned_auto_scale_groups] = []

    	account_list.each do |u|
	      	as = getAsInterface(u)
	      	as_list = as.describe_auto_scaling_groups
	      	as_list.each do |t|
			provisioned_auto_scale_group = {}
			provisioned_auto_scale_group[:name] = t[:auto_scaling_group_name]
			provisioned_auto_scale_group[:lc_name] = t[:launch_configuration_name]
			provisioned_auto_scale_group[:min_size] = t[:min_size]
			provisioned_auto_scale_group[:max_size] = t[:max_size]
			provisioned_auto_scale_group[:desired_capacity] = t[:desired_capacity]
			provisioned_auto_scale_group[:availability_zones] = t[:availability_zones]
			provisioned_auto_scale_group[:instances] = t[:instances]
			provisioned_auto_scale_group[:load_balancers] = t[:load_balancer_names]
			provisioned_auto_scale_group[:health_check_type] = t[:health_check_type]
			provisioned_auto_scale_group[:created_time] = t[:created_time]
			provisioned_auto_scale_group[:health_check_grace_period] = t[:health_check_grace_period]
			provisioned_auto_scale_group[:default_cooldown] = t[:default_cooldown]
			provisioned_auto_scale_group[:as_group_arn] = t[:auto_scaling_group_arn]
			provisioned_auto_scale_group[:state] = ProvisionState::Running

			items[:provisioned_auto_scale_groups] << provisioned_auto_scale_group
	      	end
	end
	return items[:provisioned_auto_scale_groups]
  end

  def get_s3(account_list)
	items = {}
    	items[:provisioned_s3s] = []

    	account_list.each do |u|
	  	s3 = getS3Interface(u)
	      	s3_list = s3.list_all_my_buckets
	       	s3_list.each do |t|
			provisioned_s3 = {}
			provisioned_s3[:name] = t[:name]
			provisioned_s3[:creation_date] = t[:creation_date]
			provisioned_s3[:owner] = t[:owner_id]
			provisioned_s3[:owner_name] = t[:owner_display_name]

			items[:provisioned_s3s] << provisioned_s3
	    	end
	end
	return items[:provisioned_s3s]
  end

  def get_ebs(account_list)
	items = {}
    	items[:provisioned_ebs_volumes] = []

    	account_list.each do |u|
	  	ebs = getEbsInterface(u)
	      	ebs_list = ebs.describe_volumes
	      	ebs_list.each do |t|
			provisioned_ebs_volume = {}
			provisioned_ebs_volume[:name] = t[:tags]["Name"]
			provisioned_ebs_volume[:stack_resource_name] = t[:tags]["aws:cloudformation:logical-id"]
			provisioned_ebs_volume[:stack_name] = t[:tags]["aws:cloudformation:stack-name"]
			provisioned_ebs_volume[:volume_id] = t[:aws_id]
			provisioned_ebs_volume[:availability_zone] = t[:zone]
			provisioned_ebs_volume[:snapshot_id] = t[:snapshot_id]
			provisioned_ebs_volume[:created_at] = t[:aws_created_at]
			provisioned_ebs_volume[:instance_id] = t[:aws_instance_id]
			provisioned_ebs_volume[:device] = t[:aws_device]
			provisioned_ebs_volume[:attachment_status] = t[:aws_attachment_status]
			provisioned_ebs_volume[:attached_at] = t[:aws_attached_at]
			provisioned_ebs_volume[:delete_on_termination] = t[:deleted_on_termination]
			provisioned_ebs_volume[:size] = t[:aws_size]
			provisioned_ebs_volume[:state] = t[:aws_status]

			items[:provisioned_ebs_volumes] << provisioned_ebs_volume
	      	end
	end
	return items[:provisioned_ebs_volumes]
  end

  def get_ec2(account_list)
	items = {}
    	items[:provisioned_ec2_instances] = []

    	account_list.each do |u|
	    	ec2 = getEc2Interface(u)
	      	ec2_list = ec2.describe_instances
	      	ec2_list.each do |t|
	  		new_status = t[:aws_state]
	  		case new_status
	    			when "pending"
	      				state = ProvisionState::Launching
	    			when "running"
	      				state = ProvisionState::Running
	    			when "shutting-down"
	      				state = ProvisionState::ShuttingDown
	    			when "terminated"
	      				state = ProvisionState::Terminated
	    			else
	      				state = ProvisionState::FailedLaunch
	  		end

			provisioned_ec2_instance = {}
			provisioned_ec2_instance[:name] = t[:tags]["Name"]
			provisioned_ec2_instance[:stack_resource_name] = t[:tags]["aws:cloudformation:logical-id"]
			provisioned_ec2_instance[:stack_name] = t[:tags]["aws:cloudformation:stack-name"]
			provisioned_ec2_instance[:instance_id] = t[:aws_instance_id]
			provisioned_ec2_instance[:image_id] = t[:aws_image_id]
			provisioned_ec2_instance[:root_device_type] = t[:root_device_type]
			provisioned_ec2_instance[:instance_type] = t[:aws_instance_type]
			provisioned_ec2_instance[:availability_zone] = t[:aws_availability_zone]
			provisioned_ec2_instance[:key_name] = t[:ssh_key_name]
			provisioned_ec2_instance[:public_ip_address] = t[:ip_address]
			provisioned_ec2_instance[:private_ip_address] = t[:private_ip_address]
			provisioned_ec2_instance[:public_dns_name] = t[:dns_name] unless t[:dns_name] == t[:ip_address]
			provisioned_ec2_instance[:private_dns_name] = t[:private_dns_name] unless t[:private_dns_name] == t[:private_ip_address]
			if provisioned_ec2_instance[:private_ip_address] == provisioned_ec2_instance[:public_ip_address]
				provisioned_ec2_instance[:public_ip_address] = nil
			end
			if provisioned_ec2_instance[:private_dns_name] == provisioned_ec2_instance[:public_dns_name]
				provisioned_ec2_instance[:public_dns_name] = nil
			end
			provisioned_ec2_instance[:launch_time] = t[:aws_launch_time]
			provisioned_ec2_instance[:kernel_id] = t[:aws_kernel_id]
			provisioned_ec2_instance[:ramdisk_id] = t[:aws_ramdisk_id]
			provisioned_ec2_instance[:detailed_monitoring] = t[:monitoring_state]
			provisioned_ec2_instance[:architecture] = t[:architecture]
			provisioned_ec2_instance[:virtualization_type] = t[:virtualization_type]
			provisioned_ec2_instance[:security_groups] = t[:groups]
			provisioned_ec2_instance[:state] = state
			
			if(t[:aws_platform].nil?)
				provisioned_ec2_instance[:platform] = "linux"
			else
				provisioned_ec2_instance[:platform] = t[:aws_platform]
			end

			items[:provisioned_ec2_instances] << provisioned_ec2_instance
	      	end
	end
	return items[:provisioned_ec2_instances]
	rescue RightAws::AwsError => error
		::Rails.logger.error("\t #{JSON.pretty_generate(JSON.parse(error.to_json))}")
		return error
		#render :json => error.errors.to_json, :status => error.http_code
  end

  def get_sqs(account_list)
	items = {}
    	items[:provisioned_sqs_messages] = []

    	account_list.each do |u|
	  	sqs = getSqsInterface(u)
	  	sqs_list = sqs.list_queues
	      	sqs_list.each do |t|
	      		begin
				sqs_attributes = sqs.get_queue_attributes(t)

				get_queue_name_array = t.split('/')
				if(get_queue_name_array.length > 0)
			  		name = get_queue_name_array[get_queue_name_array.length - 1]
				else
			  		name = ""
				end

				provisioned_sqs_message = {}
				provisioned_sqs_message[:name] = name
				provisioned_sqs_message[:resource_name] = sqs_attributes["QueueArn"]
				provisioned_sqs_message[:visibility_timeout] = sqs_attributes["VisibilityTimeout"]
				provisioned_sqs_message[:message_number] = sqs_attributes["ApproximateNumberOfMessages"]
				provisioned_sqs_message[:message_number_not_visible] = sqs_attributes["ApproximateNumberOfMessagesNotVisible"]
				provisioned_sqs_message[:creation_date] = Time.at(Integer(sqs_attributes["CreatedTimestamp"])).strftime("%m/%d/%Y %I:%M:%S %p")
				provisioned_sqs_message[:last_modified_date] = Time.at(Integer(sqs_attributes["LastModifiedTimestamp"])).strftime("%m/%d/%Y %I:%M:%S %p")
				provisioned_sqs_message[:max_message_size] = sqs_attributes["MaximumMessageSize"]
				provisioned_sqs_message[:retention_period] = sqs_attributes["MessageRetentionPeriod"]
				provisioned_sqs_message[:queue_url] = t

				items[:provisioned_sqs_messages] << provisioned_sqs_message
			rescue
				#skips if not available yet
			end
	      	end
	end
	return items[:provisioned_sqs_messages]
  end

  def get_elc(account_list)
	items = {}
    	items[:provisioned_elastic_caches] = []

    	account_list.each do |u|
	  	elc = getElcInterface(u)
	  	elc_list = elc.describe_cache_clusters(nil, {:show_node_info => true})
	      	elc_list.each do |t|
			state = ""
	  		new_status = t["CacheClusterStatus"]
			case(new_status)
				when "creating"
					state = ProvisionState::Launching
				when "available"
				  	state = ProvisionState::Running
				when "rebooting cache cluster nodes"
				  	state = ProvisionState::Launching
				when "modifying"
				  	state = ProvisionState::Launching
				when "deleting"
				 	state = ProvisionState::ShuttingDown
			end

			provisioned_elastic_cache = {}
			provisioned_elastic_cache[:cluster_id] = t["CacheClusterId"]
			provisioned_elastic_cache[:security_groups] = t["CacheSecurityGroups"]
			provisioned_elastic_cache[:nodes] = t["CacheNodes"]
			provisioned_elastic_cache[:parameter_group] = t["CacheParameterGroup"]["CacheParameterGroupName"]
			provisioned_elastic_cache[:engine] = t["Engine"]
			provisioned_elastic_cache[:engine_version] = t["EngineVersion"]
			provisioned_elastic_cache[:auto_minor_version_upgrade] = t["AutoMinorVersionUpgrade"]
			provisioned_elastic_cache[:creation_date] = t["CacheClusterCreateTime"]
			provisioned_elastic_cache[:node_type] = t["CacheNodeType"]
			provisioned_elastic_cache[:node_number] = t["NumCacheNodes"]
			provisioned_elastic_cache[:availability_zone] = t["PreferredAvailabilityZone"]
			provisioned_elastic_cache[:maintenance_window] = t["PreferredMaintenanceWindow"]
			provisioned_elastic_cache[:events] = elc.describe_events({:source_identifier=>t["CacheClusterId"], :source_type=>"cache-cluster", :duration=>20160})
			provisioned_elastic_cache[:state] = state

			items[:provisioned_elastic_caches] << provisioned_elastic_cache
		end
	end
	return items[:provisioned_elastic_caches]
  end

  def get_sns(account_list)
		items = {}
    	items[:provisioned_sns_topics] = []

    	account_list.each do |u|
	  	sns = getSnsInterface(u)
		sns_fog = getSnsFogInterface(u)
		sns_list = sns.topics
	      	sns_list.each do |t|
			provisioned_sns_topic = {}
			provisioned_sns_topic[:name] = t.name
			provisioned_sns_topic[:topic_arn] = t.arn
			provisioned_sns_topic[:owner] = t.owner
			provisioned_sns_topic[:num_subscriptions_confirmed] = t.num_subscriptions_confirmed
			provisioned_sns_topic[:num_subscriptions_pending] = t.num_subscriptions_pending
			provisioned_sns_topic[:num_subscriptions_deleted] = t.num_subscriptions_deleted
			provisioned_sns_topic[:subscriptions] = sns_fog.list_subscriptions_by_topic(t.arn).body["Subscriptions"]

			items[:provisioned_sns_topics] << provisioned_sns_topic
		end
	end
	return items[:provisioned_sns_topics]
  end
  
  def get_alarms(account_list)
  	items = {}
  	items[:provisioned_alarms] = []
  	
  	account_list.each do |u|
  		acw = getAcwInterface(u)
  		alarm_list = acw.describe_alarms.body["DescribeAlarmsResult"]["MetricAlarms"]
  		alarm_list.each do |t|
  			case t["ComparisonOperator"]
  				when "GreaterThanOrEqualToThreshold"
					comparison_sign = ">="
				when "LessThanOrEqualToThreshold"
					comparison_sign = "<="
				when "GreaterThanThreshold"
					comparison_sign = ">"
				when "LessThanThreshold"
					comparison_sign = "<"
				else
					comparison_sign = ""
  			end
  			
  			time_length = (t["Period"] * t["EvaluationPeriods"]/60).to_s
  			
  			threshold_view = t["MetricName"] + " " + comparison_sign + " " + t["Threshold"].to_s + " for " + time_length + " minutes."
  		
  			provisioned_alarm = {}
  			provisioned_alarm[:name] = t["AlarmName"]
  			provisioned_alarm[:description] = t["AlarmDescription"]
  			provisioned_alarm[:dimensions] = t["Dimensions"]
  			provisioned_alarm[:state_updated] = t["StateUpdatedTimestamp"]
  			provisioned_alarm[:insufficient_data_actions] = t["InsufficientDataActions"]
  			provisioned_alarm[:arn] = t["AlarmArn"]
  			provisioned_alarm[:configuration_updated] = t["AlarmConfigurationUpdatedTimestamp"]
  			provisioned_alarm[:state] = t["StateValue"]
  			provisioned_alarm[:period] = t["Period"]
  			provisioned_alarm[:ok_actions] = t["OKActions"]
  			provisioned_alarm[:actions_enabled] = t["ActionsEnabled"]
  			provisioned_alarm[:namespace] = t["Namespace"]
  			provisioned_alarm[:threshold] = t["Threshold"]
  			provisioned_alarm[:eval_periods] = t["EvaluationPeriods"]
  			provisioned_alarm[:statistic] = t["Statistic"]
  			provisioned_alarm[:alarm_actions] = t["AlarmActions"]
  			provisioned_alarm[:unit] = t["Unit"]
  			provisioned_alarm[:state_reason] = t["StateReason"]
  			provisioned_alarm[:comparison] = t["ComparisonOperator"]
  			provisioned_alarm[:comparison_sign] = comparison_sign
  			provisioned_alarm[:metric_name] = t["MetricName"]
  			provisioned_alarm[:threshold_view] = threshold_view
  			
  			items[:provisioned_alarms] << provisioned_alarm
  		end
  	end
  	
  	return items[:provisioned_alarms]
  end
  
  def get_sdb(account_list)
  	items = {}
  	items[:provisioned_simple_dbs] = []

  	account_list.each do |u|
  		sdb = getSdbInterface(u)
  		sdb_list = sdb.list_domains[:domain_names]
  		sdb_list.each do |t|
  			domain = sdb.domain_metadata({:domain_name => t})
  			
  			provisioned_simple_db = {}
  			provisioned_simple_db[:name] = t
  			provisioned_simple_db[:item_count] = domain[:item_count]
  			provisioned_simple_db[:item_names_size_bytes] = domain[:item_names_size_bytes]
  			provisioned_simple_db[:attribute_name_count] = domain[:attribute_name_count]
  			provisioned_simple_db[:attribute_names_size_bytes] = domain[:attribute_names_size_bytes]
  			provisioned_simple_db[:attribute_value_count] = domain[:attribute_value_count]
  			provisioned_simple_db[:attribute_values_size_bytes] = domain[:attribute_values_size_bytes]
  			
  			items[:provisioned_simple_dbs] << provisioned_simple_db
  		end
  	end
  	
  	return items[:provisioned_simple_dbs]
  end
  
  def get_cdn(account_list)
  	items = {}
  	items[:provisioned_cdns] = []
  	
  	account_list.each do |u|
  		cdn = getCdnInterface(u)
  		cdn_list = cdn.get_distribution_list.body["DistributionSummary"]
  		cdn_list.each do |t|
  			if t["Enabled"] == true
  				state = "Enabled"
  			else
  				state = "Disabled"
  			end
  			
  			if t["S3Origin"]
  				origin = t["S3Origin"]["DNSName"]
  				origin_details = t["S3Origin"]
  				origin_details["Type"] = "S3"
  			else
  				origin = t["CustomOrigin"]["DNSName"]
  				origin_details = t["CustomOrigin"]
  				origin_details["Type"] = "Custom"
  			end
  		
  			provisioned_cdn = {}
  			provisioned_cdn[:domain_name] = t["DomainName"]
  			provisioned_cdn[:id] = t["Id"]
  			provisioned_cdn[:cnames] = t["CNAME"]
  			provisioned_cdn[:trusted_signers] = t["TrustedSigners"]
  			provisioned_cdn[:origin] = origin
  			provisioned_cdn[:origin_details] = origin_details
  			provisioned_cdn[:last_modified] = t["LastModifiedTime"]
  			provisioned_cdn[:status] = t["Status"]
  			provisioned_cdn[:state] = state
  			
  			items[:provisioned_cdns] << provisioned_cdn
  		end
  	end
  		
  	return items[:provisioned_cdns]
  end

	
	def getGimInterface(u)
    	params = {}
    	account = $client.cloud_account_details(u)
    	CloudTargetOverride.get_cloud_url_params(account, "GIM", params)
    	return RightAws::GimInterface.new(account.access_key, account.secret_key, params)
  	end

  	def getElbInterface(u)
    	params = {}
    	account = $client.cloud_account_details(u)
    	CloudTargetOverride.get_cloud_url_params(account, "ELB", params)
    	return RightAws::ElbInterface.new(account.access_key, account.secret_key, params)
  	end

	def getEc2Interface(u)
    	params = {}
    	account = $client.cloud_account_details(u)
    	CloudTargetOverride.get_cloud_url_params(account, "EC2", params)
	if account.access_key.split("-").length > 1
		params[:server] = CloudConstants::Url::DIABLO
	end
    	return RightAws::Ec2.new(account.access_key, account.secret_key, params)
  	end

  	def getAcwInterface(u)
    	account = $client.cloud_account_details(u)
    	return Fog::AWS::CloudWatch.new(:aws_access_key_id => account.access_key, :aws_secret_access_key => account.secret_key)
  	end

  	def getAwsEbInterface(u)
    	params = {}
    	account = $client.cloud_account_details(u)
    	CloudTargetOverride.get_cloud_url_params(account, "AWSEB", params)
    	return RightAws::AwsEbInterface.new(account.access_key, account.secret_key, params)
  	end

  	def getRdsInterface(u)
    	params = {}
    	account = $client.cloud_account_details(u)
    	CloudTargetOverride.get_cloud_url_params(account, "RDS", params)
    	return RightAws::RdsInterface.new(account.access_key, account.secret_key, params)
  	end

  	def getS3Interface(u)
    	params = {}
    	account = $client.cloud_account_details(u)
    	CloudTargetOverride.get_cloud_url_params(account, "S3", params)
    	return RightAws::S3Interface.new(account.access_key, account.secret_key, params)
  	end
  	
  	def getSdbInterface(u)
  		params = {}
  		account = $client.cloud_account_details(u)
  		CloudTargetOverride.get_cloud_url_params(account, "SDB", params)
  		return AWS::SimpleDB::Client.new(:access_key_id => account.access_key, :secret_access_key => account.secret_key)
  	end

  	def getEbsInterface(u)
    	params = {}
    	account = $client.cloud_account_details(u)
    	CloudTargetOverride.get_cloud_url_params(account, "EC2", params)
    	return RightAws::Ec2.new(account.access_key, account.secret_key, params)
  	end

  	def getAsInterface(u)
    	params = {}
    	account = $client.cloud_account_details(u)
    	CloudTargetOverride.get_cloud_url_params(account, "EC2", params)
    	return RightAws::AsInterface.new(account.access_key, account.secret_key, params)
  	end
  	
  	def getAsRightInterface(u)
  		params = {}
    	account = $client.cloud_account_details(u)
    	CloudTargetOverride.get_cloud_url_params(account, "AS", params)
    	return RightAws::AsInterface.new(account.access_key, account.secret_key, params)
  	end

  	def getSqsInterface(u)
		params = {}
		account = $client.cloud_account_details(u)
		CloudTargetOverride.get_cloud_url_params(account, "SQS", params)
		return RightAws::SqsGen2Interface.new(account.access_key, account.secret_key, params)
  	end

  	def getElcInterface(u)
  		account = $client.cloud_account_details(u)
		CloudTargetOverride.get_cloud_url_params(account, "ELC", params)
		return RightAws::ElcInterface.new(account.access_key, account.secret_key, params)
      		#elc = Fog::AWS::Elasticache.new(:aws_access_key_id => account.access_key, :aws_secret_access_key => account.secret_key)
  	end
  	
  	def getIamInterface(u)
  		account = $client.cloud_account_details(u)
		CloudTargetOverride.get_cloud_url_params(account, "IAM", params)
		return RightAws::IamInterface.new(account.access_key, account.secret_key, params)
  		#return AWS::IAM::Client.new(:access_key_id => account.access_key, :secret_access_key => account.secret_key)
  	end

  	def getSnsInterface(u)
  		account = $client.cloud_account_details(u)
	    return AWS::SNS.new(:access_key_id => account.access_key, :secret_access_key => account.secret_key)
  	end

	def getSnsFogInterface(u)
		account = $client.cloud_account_details(u)
		return Fog::AWS::SNS.new(:aws_access_key_id => account.access_key, :aws_secret_access_key => account.secret_key)
	end
	
	def getCdnInterface(u)
		account = $client.cloud_account_details(u)
		return Fog::CDN::AWS.new(:aws_access_key_id => account.access_key, :aws_secret_access_key => account.secret_key)
	end
	
	def get_cloud_type
		cloud_account = $client.cloud_account_details(params[:cloud_account_id])
		
		if !cloud_account.nil?
			return cloud_account.cloud_name
		else
			return nil
		end		
	end

end
