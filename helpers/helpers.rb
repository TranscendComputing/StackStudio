include ServiceInterfaceMethods


	def get_report
		@client = StackPlace::HttpClient.new
		report = @client.report_accounts.results
		num_users = report.count
		total_logins = 0
		total_projects = 0
		total_cloud_accounts = 0
		report.each do |r|
			total_logins = total_logins + r["total_logins"] unless r["total_logins"].nil?
			total_projects = total_projects + r["total_projects_owned"] unless r["total_projects_owned"].nil?
			total_cloud_accounts = total_cloud_accounts + r["total_cloud_accounts"] unless r["total_cloud_accounts"].nil?
			if r["login"] == "admin"
				@admin_projects = r["total_projects_owned"]
				@admin_logins = r["total_logins"]
				@admin_accounts = r["total_cloud_accounts"]
			end
		end

		@logins_report = "Total Non-Admin Logins: #{total_logins - @admin_logins}     (#{@admin_logins} from admin)"
		@cloud_accounts_report = "Total Non-Admin Cloud Accounts: #{total_cloud_accounts - @admin_accounts}    (#{@admin_accounts} from admin)"
		@projects_report = "Total Non-Admin Projects: #{total_projects - @admin_projects}     (#{@admin_projects} from admin)"
		@report = JSON.pretty_generate(JSON.parse(report.to_json))
		@report_doc = "#{@logins_report}\n#{@cloud_accounts_report}\n#{@projects_report}\n\n\n#{@report}"

		File.open('report.txt', 'w') {|f| f.write(@report_doc) }


	end

	def set_keystone_interface
		query = $client.cloud_query
		clouds=query.clouds
		clouds.each_with_index do |cloud, index|
			if cloud.name == CloudType::OPENSTACK
				@num = index
				break
			end
		end
		@iam = get_service("admin", "IAM", @num)
		host = @iam.params[:server]
		port = @iam.params[:port]
		path = @iam.params[:service]
		protocol = @iam.params[:protocol]
		@auth_url = "#{protocol}://#{host}:#{port}/v2.0"
		@keystone_client = Keystone::V2_0::Client.new(:username => 'USERNAME', :password => 'PASSWORD', :tenant_id => "TENANT", :tenant_name => 'TENANT_NAME', :auth_url => @auth_url)
		return @auth_url
	end

def get_service(login=nil,service=nil,num=nil)
	@id = login
	@service = service
	@num = num
	if @id.nil? || @service.nil? || @num.nil?
		raise ArgumentError, "requires login, service, acct_num"
	end

	acct = $client.account_details(@id)
	acct = $client.identity_details(acct.id)
	puts JSON.pretty_generate(JSON.parse(acct.cloud_accounts[@num].to_json))
	return getResourceInterface({:service => @service, :cloud_account_id => acct.cloud_accounts[@num].id})
end

def update_os_ec2(path=nil, host=nil, port=nil)
	query=$client.cloud_query
	clouds=query.clouds
	cloud = StackPlace::Cloud.new
	clouds.each do |c|
		if c.name == "OpenStack"
			cloud = c
			break
		end
	end
	service = StackPlace::CloudService.new
	cloud.cloud_services.each do |s|
		if s.service_type == "EC2"
			service = s
			break
		end
	end
	new_service = service.dup
	new_service.host = host unless host.nil?
	new_service.port = port unless port.nil?
	new_service.path = path unless path.nil?
	$client.remove_cloud_service(cloud.id, service.id)
	$client.add_cloud_service(cloud.id, new_service)
end


def get_instances(name, ec2)
  instances = []
  ec2.describe_instances.each do |instance|
    if instance[:ssh_key_name] == name
       instances << instance
    end
  end
  return instances
end

def set_account_vars(login, cloud_provider, acct_num)
	@user = $client.account_details login
	@user = $client.identity_details @user.id
	clouds = $client.cloud_query.clouds
	clouds.each do |c|
		if c.cloud_provider == cloud_provider
			@cloud = c
		end
	end
	@account = @user.cloud_accounts[acct_num]
end

def account_details(login)
	@account = $client.account_details(login)
	@account = $client.identity_details(@account.id)
	account = StackPlace::HttpClient.new.account_details(login)
	url = StackPlace::Config.host
	url += "/identity/v1/accounts/#{account.id}.json"
	open(url){|f| puts JSON.pretty_generate(JSON.parse(f.read))}
end


def load_properties(properties_filename)
  properties = {}
  File.open(properties_filename, 'r') do |properties_file|
    properties_file.read.each_line do |line|
      line.strip!
      if (line[0] != ?# and line[0] != ?=)
        i = line.index('=')
        if (i)
          properties[line[0..i - 1].strip] = line[i + 1..-1].strip
        else
          properties[line] = ''
        end
      end
    end
  end
  properties
end



