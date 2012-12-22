namespace :api do
	desc "Update clouds; make any necessary changes before running."
	task :update_clouds => [:environment] do
		@client = StackPlace::HttpClient.new
		query = @client.cloud_query
		clouds = query.clouds
		clouds.each do |cloud|
			case cloud.name
				when "Amazon Web Services"
					cloud.cloud_provider = "AWS"
					cloud.url = nil
					cloud.host = nil
					cloud.protocol = nil
					cloud.port = nil
				when "Eucalyptus"
					cloud.cloud_provider = "Eucalyptus"
					cloud.url = nil
					cloud.host = nil
					cloud.protocol = nil
					cloud.port = nil
				when "OpenStack"
					cloud.name = "OpenStack Essex"
					cloud.cloud_provider = "OpenStack"
					cloud.url = "http://172.31.254.13:35357/v2.0/tokens"
					cloud.host = nil
					cloud.protocol = nil
					cloud.port = nil
				when "OpenStack Essex"
					cloud.cloud_provider = "OpenStack"
					cloud.url = "http://172.31.254.13:35357/v2.0/tokens"
					cloud.host = nil
					cloud.protocol = nil
					cloud.port = nil
				when "OpenStack Diablo"
					cloud.cloud_provider = "OpenStack"
					cloud.url = nil
					cloud.host = nil
					cloud.protocol = nil
					cloud.port = nil
			end
			@client.cloud_update(cloud)
		end
	end
	
	desc "add openstack diablo as a cloud"
	task :add_openstack_diablo => [:environment] do
		@client = StackPlace::HttpClient.new
		query = @client.cloud_query
		clouds = query.clouds
		found = false
		clouds.each do |cloud|
			if cloud.name == "OpenStack Diablo"
				found = true
			end
		end
		
		if !found
			api_cloud = StackPlace::Cloud.new
		    api_cloud.name = "OpenStack Diablo"
		    api_cloud.cloud_provider = "OpenStack"
		    api_cloud.permalink = "openstack"
		    api_cloud.url = nil
		    api_cloud.protocol = nil
		    api_cloud.host = nil
		    api_cloud.port = nil
		    api_cloud = @client.cloud_create(api_cloud)
		end
	end
	
	desc "add windows azure as a cloud"
	task :add_windows_azure => [:environment] do
		@client = StackPlace::HttpClient.new
		query = @client.cloud_query
		clouds = query.clouds
		found = false
		clouds.each do |cloud|
			if cloud.name == "Windows Azure"
				found = true
			end
		end
		
		if !found
			api_cloud = StackPlace::Cloud.new
		    api_cloud.name = "Windows Azure"
		    api_cloud.cloud_provider = "Azure"
		    api_cloud.permalink = "azure"
		    api_cloud.url = nil
		    api_cloud.protocol = nil
		    api_cloud.host = nil
		    api_cloud.port = nil
		    api_cloud = @client.cloud_create(api_cloud)
		end
	end

	desc "add hp cloud"
	task :add_hp => [:environment] do
		@client = StackPlace::HttpClient.new
		query  = @client.cloud_query
		clouds = query.clouds
		found = false
		clouds.each do |cloud|
			if cloud.name == "HP"
				found = true
			end
		end

		if !found
			api_cloud = StackPlace::Cloud.new
		    api_cloud.name = "HP"
		    api_cloud.cloud_provider = "HP"
		    api_cloud.permalink = "hp"
		    api_cloud.url = nil
		    api_cloud.protocol = nil
		    api_cloud.host = nil
		    api_cloud.port = nil
		    api_cloud = @client.cloud_create(api_cloud)
		end
	end

	desc "add CloudStack cloud"
	task :add_cloudstack => [:environment] do
		@client = StackPlace::HttpClient.new
		query  = @client.cloud_query
		clouds = query.clouds
		found = false
		clouds.each do |cloud|
			if cloud.name == "CloudStack"
				found = true
			end
		end

		if !found
			api_cloud = StackPlace::Cloud.new
		    api_cloud.name = "CloudStack"
		    api_cloud.cloud_provider = "CloudStack"
		    api_cloud.permalink = "cloudstack"
		    api_cloud.url = nil
		    api_cloud.protocol = "http"
		    api_cloud.host = "172.31.254.17"
		    api_cloud.port = "8080"
		    api_cloud = @client.cloud_create(api_cloud)
		end
	end
		
	desc "add rackspace as a cloud"
	task :add_rackspace => [:environment] do
		@client = StackPlace::HttpClient.new
		query = @client.cloud_query
		clouds = query.clouds
		found = false
		clouds.each do |cloud|
			if cloud.name == "Rackspace"
				found = true
			end
		end
		
		if !found
			api_cloud = StackPlace::Cloud.new
		    api_cloud.name = "Rackspace"
		    api_cloud.cloud_provider = "Rackspace"
		    api_cloud.permalink = "rackspace"
		    api_cloud.url = nil
		    api_cloud.protocol = nil
		    api_cloud.host = nil
		    api_cloud.port = nil
		    api_cloud = @client.cloud_create(api_cloud)
		end
	end
	
	desc "add piston as a cloud"
	task :add_piston => [:environment] do
		@client = StackPlace::HttpClient.new
		query = @client.cloud_query
		clouds = query.clouds
		found = false
		clouds.each do |cloud|
			if cloud.name == "Piston"
				found = true
			end
		end
		
		if !found
			api_cloud = StackPlace::Cloud.new
		    api_cloud.name = "Piston"
		    api_cloud.cloud_provider = "Piston"
		    api_cloud.permalink = "piston"
		    api_cloud.url = nil
		    api_cloud.protocol = nil
		    api_cloud.host = nil
		    api_cloud.port = nil
		    api_cloud = @client.cloud_create(api_cloud)
		end
	end
	
	desc "add joyent as a cloud"
	task :add_joyent => [:environment] do
		@client = StackPlace::HttpClient.new
		query = @client.cloud_query
		clouds = query.clouds
		found = false
		clouds.each do |cloud|
			if cloud.name == "Joyent"
				found = true
			end
		end
		
		if !found
			api_cloud = StackPlace::Cloud.new
		    api_cloud.name = "Joyent"
		    api_cloud.cloud_provider = "Joyent"
		    api_cloud.permalink = "joyent"
		    api_cloud.url = nil
		    api_cloud.protocol = nil
		    api_cloud.host = nil
		    api_cloud.port = nil
		    api_cloud = @client.cloud_create(api_cloud)
		end
	end


	desc "Add default image mappings to cloud accounts - will delete all previous entries before running to ensure there are no duplicates"
	task :add_image_mappings => [:environment] do
		@client = StackPlace::HttpClient.new
		query = @client.cloud_query
		clouds = query.clouds
		clouds.each do |cloud|
			cloud.cloud_mappings.each do |map|
				@client.remove_cloud_mapping(cloud.id, map.id)
			end
			mappings = []
			case cloud.name
				when "Amazon Web Services"
					mappings = get_aws_mappings
				when "Eucalyptus"
					mappings = get_euca_mappings
				when "OpenStack"
					mappings = get_openstack_mappings
			end
			if mappings.count > 0
				mappings.each do |m|
					@client.add_cloud_mapping(cloud.id, m)
				end
			end
		end
	end

	desc "Add IAM to OS/Euca"
	task :add_iam => [:environment] do
		@client = StackPlace::HttpClient.new
		query = @client.cloud_query
		clouds = query.clouds
		clouds.each do |cloud|
			case cloud.name
			when "Eucalyptus"
				service = StackPlace::CloudService.new
				# Dev
				#service.host = "172.16.5.4"
				# Test
				service.host = "expedite.momentumsoftware.com"
				service.path = "/services/Euare"
				service.port = "8773"
				service.service_type = "IAM"
				@client.add_cloud_service(cloud.id, service)
			when "OpenStack"
				service = StackPlace::CloudService.new
				# Dev
				#service.host = "172.31.254.13"
				# Test
				service.host = "msi.dyndns-ip.com"
				service.path = "/v2.0/users"
				service.port = "35357"
				service.service_type = "IAM"
				@client.add_cloud_service(cloud.id, service)
			end
		end
	end

	desc "Add ELC and IAM to OS/Euca"
	task :add_elc_iam => [:environment] do
		@client = StackPlace::HttpClient.new
		query = @client.cloud_query
		clouds = query.clouds

		service = StackPlace::CloudService.new
		service.host = CloudConstants::Url::TOPSTACK
		service.path = "/ElasticacheQuery"
		# Dev port
		#service.port = "8080
		# Deployed port
		service.port = "8770"
		service.service_type = "ELC"

		clouds.each do |cloud|
			case cloud.name
			when CloudConstants::Type::EUCA
				# Add ELC Service
				@client.add_cloud_service(cloud.id, service)

				# Add IAM Service
				iam_service = StackPlace::CloudService.new
				# Dev
				#iam_service.host = "172.16.5.4"
				# Test
				iam_service.host = "expedite.momentumsoftware.com"
				iam_service.path = "/services/Euare"
				iam_service.port = "8773"
				iam_service.service_type = "IAM"
				@client.add_cloud_service(cloud.id, iam_service)
			when CloudConstants::Type::OPENSTACK
				# Add ELC Service
				@client.add_cloud_service(cloud.id, service)

				iam_service = StackPlace::CloudService.new
				# Dev
				#iam_service.host = "172.31.254.13"
				# Test
				iam_service.host = "msi.dyndns-ip.com"
				iam_service.path = "/v2.0/users"
				# Dev
				# iam_service.port = "35357"
				iam_service.port = "8771"
				iam_service.service_type = "IAM"
				@client.add_cloud_service(cloud.id, iam_service)
			end
		end
	end

	desc "Update current cloud service endpoints - Must edit in migration.rake first"
	task :update_endpoints => [:environment] do
		@client = StackPlace::HttpClient.new
		query = @client.cloud_query
		clouds = query.clouds
		clouds.each do |cloud|
			puts cloud.name
			case cloud.name
			when "Eucalyptus"
				cloud.cloud_services.each do |service|
					puts service.service_type
					topstack_host = CloudConstants::Url::TOPSTACK
					#Dev
					#topstack_port = "8080"
					#Deployed
					topstack_port = "8770"

					new_service = service.dup
					new_service.host = topstack_host
					new_service.port = topstack_port
					
					case service.service_type
					when "EC2"
						# Dev
						#new_service.host = "172.16.5.4"
						# Test
						new_service.host = "expedite.momentumsoftware.com"
						new_service.path = "/services/Eucalyptus"
						new_service.port = '8773'
					when "S3"
						new_service.host = "expedite.momentumsoftware.com"
						new_service.path = "/services/Walrus"
						new_service.port = '8773'

					when "IAM"
						# Dev
						#new_service.host = "172.16.5.4"
						# Test
						new_service.host = "expedite.momentumsoftware.com"
						new_service.path = "/services/Euare"
						new_service.port = "8773"
					when "ACW"
						new_service.path = "/MonitorQuery"
					when "ELB"
						new_service.path = "/LoadBalancerQuery"
					when "RDS"
						new_service.path = "/RDSQuery/rdsquery"
					when "ELC"
						new_service.path = "/ElasticacheQuery"
					end
					
					@client.remove_cloud_service(cloud.id, service.id)
					@client.add_cloud_service(cloud.id, new_service)
				end
			when "OpenStack"
				cloud.cloud_services.each do |service|
					puts service.service_type
					topstack_host = CloudConstants::Url::TOPSTACK 
					topstack_port = "8770"
					
					new_service = service.dup
					new_service.host = topstack_host
					new_service.port = topstack_port
					
					case service.service_type
					when "EC2"
						#Essex
						#new_service.host = "172.31.254.13"
						# Test essex
						new_service.host = "msi.dyndns-ip.com"
						#Diablo
						#new_service.host = "172.16.5.215"
						new_service.path = "/services/Cloud"
						new_service.port = "8773"
					when "IAM"
						# Dev
						#iam_service.host = "172.31.254.13"
						# Test
						iam_service.host = "msi.dyndns-ip.com"
						iam_service.path = "/v2.0/users"
						# Dev
						# iam_service.port = "35357"
						iam_service.port = "8771"
					when "ACW"
						new_service.path = "/MonitorQuery"
					when "ELB"
						new_service.path = "/LoadBalancerQuery"
					when "RDS"
						new_service.path = "/RDSQuery/rdsquery"
					when "ELC"
						new_service.path = "/ElasticacheQuery"
					end
					@client.remove_cloud_service(cloud.id, service.id)
					@client.add_cloud_service(cloud.id, new_service)
				end
			end
		end
	end
	
	desc "Adds org for each user without one, and adds admin permission if they do not have any permissions. WARNING: USER WITH CAUTION! ONLY USED TO CATCHUP PERVIOUS EXISTING ACCOUNTS TO DATA MODEL CHANGE!"
	task :add_user_org_and_admin_perm => [:environment] do
		@client = StackPlace::HttpClient.new
		accounts = @client.report_accounts.results
		accounts.each do |a|
			account_id = @client.account_details(a["login"]).id
			account = @client.identity_details(account_id)
			if account.org_id.nil?
				if account.company.nil?
					account.company = "MyOrganization"
				end
				org = StackPlace::Org.new.extend(StackPlace::UpdateOrgRepresenter)
				org.name = account.company
				created_org = @client.org_create(org)
				account.org_id = created_org.id
				@client.identity_update(account)
			end
			
			if account.permissions.nil? || account.permissions.length == 0
				p = StackPlace::Permission.new
				p.name = "admin"
				p.environment = "transcend"
				@client.add_account_permission(account_id, p)
			end
		end
	end

    desc "Migrate cloud tables to api - Clouds will be duplicated if not truncated first"    
    task :migrate_clouds => [:environment] do        
        @client = StackPlace::HttpClient.new
        puts Cloud.all.to_json

	## Remove all current user API cloud accounts
	User.all.each do |user|
	   begin
		api_account = @client.identity_details(user.stackplace_user_id)
		api_account.cloud_accounts.each do |del|
			@client.delete_cloud_account(api_account.id, del.id)
		end
           rescue
        	       #  puts "API user \"#{ec2_account.user.stackplace_user_id || ec2_account.user.login}\" does not exist (User ID= #{ec2_account.user.id})"
           end 
	end

        Cloud.all.each do |cloud|
            ## Create new stackplace cloud for each cloud in mysql DB
            api_cloud = StackPlace::Cloud.new
            api_cloud.name = cloud.cloud_name
            api_cloud.public = cloud.cloud_is_public
            api_cloud.url = cloud.cloud_url
            api_cloud.protocol = cloud.cloud_protocol
            api_cloud.host = cloud.cloud_server
            api_cloud.port = cloud.cloud_port

            api_cloud = @client.cloud_create(api_cloud)
	    puts "New Cloud #{api_cloud.name}"
            cloud.cloud_services.each do |service|
		## Migrate each cloud service into API db
                new_service = StackPlace::CloudService.new
                new_service.service_type = service.service_type
                new_service.path = service.service_path
                new_service.protocol = service.service_protocol
                new_service.host = service.service_host
                new_service.port = service.service_port

                @client.add_cloud_service(api_cloud.id, new_service)
            end        

           cloud.ec2_accounts.each do |ec2_account|
		   ## Migrate each ec2 account into new stackplace cloud account
                   cloud_account = StackPlace::CloudAccount.new
                   cloud_account.name = ec2_account.account_name
                   cloud_account.access_key = ec2_account.access_key_id
                   cloud_account.secret_key = ec2_account.secret_access_key
   		begin
       		   api_account = @client.identity_details(ec2_account.user.stackplace_user_id)
                   api_account = @client.create_cloud_account(api_account.id, api_cloud.id, cloud_account)
                   puts "New Cloud Account #{cloud_account.name}"
                   ec2_account.projects.each do |project|
                                  api_project = StackPlace::Project.new
                                  api_project.name = project.project_title
                                  api_project.description = project.description
                                  api_project.project_type = "standard"
				  api_account.cloud_accounts.each do |ca|
					  if ca.access_key == project.ec2_account.access_key_id
						  api_project.cloud_account = ca
					  end
				  end
                                  api_project.owner = api_account
                                  new_project = @client.project_create(api_project)
				  puts "Project \"#{new_project.name}\""
                                  create_elements(new_project, project)
                   end
                rescue
        	         puts "API user \"#{ec2_account.user.stackplace_user_id || ec2_account.user.login}\" does not exist (User ID= #{ec2_account.user.id})"
                end 
          end
        end	
    end
end


def create_elements(api_project, project)
	elements = []
	nodes = []
	template = project.cfn_stacks[0].template
	if template.nil?
		return nil
	end
	template = JSON.parse(template)
	resources = template["Resources"]
	nodeCoordinates = {:loadBalancerY => 20, :loadBalancerX => 650, :serverY => 120, :serverX => 550, :storageY => 220, :storageX => 550, :defaultY => 20, :defaultX => 100}
	resources.each do |r|
		element = StackPlace::Element.new
		element.name = r[0]
		element.element_type = r[1]["Type"]
		element.properties = r[1].to_json
		element.group_name = "Resources"
		element = @client.add_element(api_project.id, element)
		puts "\t #{element.name}"
		elements << element
		if ResourceType::SUPPORTED_NODES.include? r[1]["Type"]
			node = StackPlace::Node.new
			node.name = element.name
			node.properties = element.properties
			node.element_id = element.id
			if element.element_type == ResourceType::WAIT_CONDITION
				node.view = "deploy"
			else
				node.view = "design"
			end
			if element.element_type == ResourceType::LOAD_BALANCER
				node.x = nodeCoordinates[:loadBalancerX]
				node.y = nodeCoordinates[:loadBalancerY]
				nodeCoordinates[:loadBalancerX] = nodeCoordinates[:loadBalancerX] + 100
			elsif element.element_type == ResourceType::DB_INSTANCE || element.element_type == ResourceType::EBS_VOLUME
				node.x = nodeCoordinates[:storageX]
			        node.y = nodeCoordinates[:storageY]
				nodeCoordinates[:storageX] = nodeCoordinates[:storageX] + 100
			elsif element.element_type == ResourceType::EC2_INSTANCE || element.element_type == ResourceType::AS_GROUP
				node.x = nodeCoordinates[:serverX]
			        node.y = nodeCoordinates[:serverY]
				nodeCoordinates[:serverX] = nodeCoordinates[:serverX] + 100
			else
				node.x = nodeCoordinates[:defaultX]
			        node.y = nodeCoordinates[:defaultY]
				nodeCoordinates[:defaultY] = nodeCoordinates[:defaultY] + 100
				if nodeCoordinates[:defaultY] > 300
					nodeCoordinates[:defaultX] = nodeCoordinates[:defaultX] + 100
					nodeCoordinates[:defaultY] = 20
				end
			end
			node = @client.add_node(api_project.id, node)
			puts "\t\t #{node.name} properties string: #{node.properties.is_a?String}"
			puts "\t\t #{node.name} elementID: #{element.id}"
			nodes << node
		end
	end
	return {:elements => elements, :nodes => nodes}
end

def get_aws_mappings
	map_array = [{	
					:name => "Amazon Linux AMI 2012.03",
					:properties => {
						:description => "The Amazon Linux AMI 2012.03 is an EBS-backed, PV-GRUB image. It includes Linux 3.2, AWS tools, and repository access to multiple versions of MySQL, PostgreSQL, Python, Ruby, and Tomcat.",
						:x86_64 => {
							:ami => "ami-e565ba8c"
						},
						:i386 => {
							:ami => "ami-ed65ba84"
						},
						:operating_system => "linux",
						:icon => "amazon",
						:root_device_type => "ebs",
						:virtualization_type => "paravirtual",
						:hypervisor => "xen"
					}
				},
				{	
					:name => "Red Hat Enterprise Linux 6.2",
					:properties => {
						:description => "Red Hat Enterprise Linux version 6.2, EBS-boot.",
						:x86_64 => {
							:ami => "ami-41d00528"
						},
						:i386 => {
							:ami => "ami-cdd306a4"
						},
						:operating_system => "linux",
						:icon => "redhat",
						:root_device_type => "ebs",
						:virtualization_type => "paravirtual",
						:hypervisor => "xen"
					}
				},
				{	
					:name => "SUSE Linux Enterprise Server 11",
					:properties => {
						:description => "SUSE Linux Enterprise Server 11 Service Pack 2 basic install, EBS boot with Amazon EC2 AMI Tools preinstalled; Apache 2.2, MySQL 5.0, PHP 5.3, and Ruby 1.8.7",
						:x86_64 => {
							:ami => "ami-ca32efa3"
						},
						:i386 => {
							:ami => "ami-0c32ef65"
						},
						:operating_system => "linux",
						:icon => "suse",
						:root_device_type => "ebs",
						:virtualization_type => "paravirtual",
						:hypervisor => "xen"
					}
				},
				{	
					:name => "Ubuntu Server 12.04 LTS",
					:properties => {
						:description => "Ubuntu Server 12.04 LTS with support available from Canonical.",
						:x86_64 => {
							:ami => "ami-a29943cb"
						},
						:i386 => {
							:ami => "ami-ac9943c5"
						},
						:operating_system => "linux",
						:icon => "ubuntu",
						:root_device_type => "ebs",
						:virtualization_type => "paravirtual",
						:hypervisor => "xen"
					}
				},
				{	
					:name => "Ubuntu Server 11.10",
					:properties => {
						:description => "Ubuntu Server version 11.10, with support available from Canonical.",
						:x86_64 => {
							:ami => "ami-baba68d3"
						},
						:i386 => {
							:ami => "ami-a0ba68c9"
						},
						:operating_system => "linux",
						:icon => "ubuntu",
						:root_device_type => "ebs",
						:virtualization_type => "paravirtual",
						:hypervisor => "xen"
					}
				},
				{	
					:name => "Microsoft Windows Server 2008 Base",
					:properties => {
						:description => "Microsoft Windows 2008 R1 SP2 Datacenter edition.",
						:x86_64 => {
							:ami => "ami-92cc6ffb"
						},
						:i386 => {
							:ami => "ami-10cc6f79"
						},
						:operating_system => "windows",
						:icon => "windows",
						:root_device_type => "ebs",
						:virtualization_type => "hvm",
						:hypervisor => "xen"
					}
				},
				{	
					:name => "Microsoft Windows Server 2008 R2 Base",
					:properties => {
						:description => "Microsoft Windows 2008 R2 SP1 Datacenter edition and 64-bit architecture.",
						:x86_64 => {
							:ami => "ami-2ccd6e45"
						},
						:operating_system => "windows",
						:icon => "windows",
						:root_device_type => "ebs",
						:virtualization_type => "hvm",
						:hypervisor => "xen"

					}
				},
				{	
					:name => "Microsoft Windows Server 2008 R2 with SQL Server Express and IIS",
					:properties => {
						:description => "Microsoft Windows Server 2008 R2 SP1 Datacenter edition, 64-bit architecture, Microsoft SQLServer 2008 Express, Internet Information Services 7, ASP.NET 3.5.",
						:x86_64 => {
							:ami => "ami-06cd6e6f"
						},
						:operating_system => "windows",
						:icon => "windows",
						:root_device_type => "ebs",
						:virtualization_type => "hvm",
						:hypervisor => "xen"
					}
				},
				{	
					:name => "Microsoft Windows Server 2008 R2 with SQL Server Web",
					:properties => {
						:description => "Microsoft Windows Server 2008 R2 SP1 Datacenter, 64-bit architecture, Microsoft SQL Server 2008 R2 Web Edition.",
						:x86_64 => {
							:ami => "ami-d4cd6ebd"
						},
						:operating_system => "windows",
						:icon => "windows",
						:root_device_type => "ebs",
						:virtualization_type => "hvm",
						:hypervisor => "xen"
					}
				},
				{	
					:name => "Cluster GPU Amazon Linux AMI 2012.03",
					:properties => {
						:description => "The Cluster GPU Amazon Linux AMI 2012.03 is an EBS-backed, HVM image. It includes Linux 3.2, AWS tools, and repository access to multiple versions of MySQL, PostgreSQL, Python, Ruby, and Tomcat. GPU support is handled via the Nvidia GPU driver, GPU SDK 4.1, and CUDA toolkit 4.1.",
						:x86_64 => {
							:ami => "ami-fd65ba94"
						},
						:operating_system => "linux",
						:icon => "amazon",
						:root_device_type => "ebs",
						:virtualization_type => "hvm",
						:hypervisor => "xen"
					}
				},
				{	
					:name => "Cluster Instances HVM SUSE Linux Enterprise 11",
					:properties => {
						:description => "SUSE Linux Enterprise Server 11 Service Pack 2, 64-bit architecture, and HVM based virtualization for use with Amazon EC2 Cluster Compute and Cluster GPU instances. Nvidia driver installs automatically during startup.",
						:x86_64 => {
							:ami => "ami-c02df0a9"
						},
						:operating_system => "linux",
						:icon => "suse",
						:root_device_type => "ebs",
						:virtualization_type => "hvm",
						:hypervisor => "xen"
					}
				},
				{	
					:name => "Microsoft Windows Server 2008 R2 with SQL Server Standard",
					:properties => {
						:description => "Microsoft Windows Server 2008 R2 SP1 Datacenter edition, 64-bit architecture, Microsoft SQL Server 2008 R2.",
						:x86_64 => {
							:ami => "ami-d6cd6ebf"
						},
						:operating_system => "windows",
						:icon => "windows",
						:root_device_type => "ebs",
						:virtualization_type => "hvm",
						:hypervisor => "xen"
					}
				},
				{	
					:name => "Cluster Compute Amazon Linux AMI 2012.03",
					:properties => {
						:description => "The Amazon Linux AMI 2012.03 is an EBS-backed, HVM image. It includes Linux 3.2, AWS tools, and repository access to multiple versions of MySQL, PostgreSQL, Python, Ruby, and Tomcat.",
						:x86_64 => {
							:ami => "ami-e965ba80"
						},
						:operating_system => "linux",
						:icon => "amazon",
						:root_device_type => "ebs",
						:virtualization_type => "hvm",
						:hypervisor => "xen"
					}
				},
				{	
					:name => "Microsoft Windows 2008 R2 64-bit for Cluster Instances",
					:properties => {
						:description => "Microsoft Windows 2008 R2 SP1, 64 bit architecture, for use with Cluster Instances. Includes Nvidia GPU driver.",
						:x86_64 => {
							:ami => "ami-38cd6e51"
						},
						:operating_system => "windows",
						:icon => "windows",
						:root_device_type => "ebs",
						:virtualization_type => "hvm",
						:hypervisor => "xen"
					}
				},
				{	
					:name => "Microsoft Windows 2008 R2 SQL Server 64-bit for Cluster Instances",
					:properties => {
						:description => "Microsoft Windows 2008 R2 SP1, 64 bit architecture, with SQL Server, for use with Cluster Instances. Includes Nvidia GPU driver.",
						:x86_64 => {
							:ami => "ami-eace6d83"
						},
						:operating_system => "windows",
						:icon => "windows",
						:root_device_type => "ebs",
						:virtualization_type => "hvm",
						:hypervisor => "xen"
					}
				},
				{	
					:name => "Ubuntu Server 12.04 LTS for Cluster Instances",
					:properties => {
						:description => "Ubuntu Server 12.04 LTS, with support available from Canonical. For use with Cluster Instances.",
						:x86_64 => {
							:ami => "ami-a69943cf"
						},
						:operating_system => "linux",
						:icon => "ubuntu",
						:root_device_type => "ebs",
						:virtualization_type => "hvm",
						:hypervisor => "xen"
					}
				}]
	
	aws_map_array = []
	map_array.each do |t|
		new_map = StackPlace::CloudMapping.new
		new_map.name = t[:name]
		new_map.mapping_type = "image"
		new_map.properties = t[:properties]
		
		aws_map_array << new_map
	end
	
	return aws_map_array
end

def get_euca_mappings
	map_array = []
	
	euca_map_array = []
	map_array.each do |t|
		new_map = StackPlace::CloudMapping.new
		new_map.name = t[:name]
		new_map.mapping_type = "image"
		new_map.properties = t[:properties]
		
		euca_map_array << new_map
	end
	
	return euca_map_array
end

def get_openstack_mappings
	map_array = []
	
	os_map_array = []
	map_array.each do |t|
		new_map = StackPlace::CloudMapping.new
		new_map.name = t[:name]
		new_map.mapping_type = "image"
		new_map.properties = t[:properties]
		
		os_map_array << new_map
	end
	
	return os_map_array
end
