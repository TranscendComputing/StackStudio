module MultiCloudParser
	class Compute
		def describe_instance_parser(provider, server, cloud, account=nil)
			formatted_server = server.attributes

			#AWS
			#id=nil,
			#ami_launch_index=nil,
			#availability_zone=nil,
			#block_device_mapping=nil,
			#network_interfaces=nil,
			#client_token=nil,
			#dns_name=nil,
			#groups=["default"],
			#flavor_id="t1.micro",
			#iam_instance_profile=nil,
			#image_id="ami-3202f25b",
			#kernel_id=nil,
			#key_name=nil,
			#created_at=nil,
			#monitoring=nil,
			#placement_group=nil,
			#platform=nil,
			#product_codes=nil,
			#private_dns_name=nil,
			#private_ip_address=nil,
			#public_ip_address=nil,
			#ramdisk_id=nil,
			#reason=nil,
			#root_device_name=nil,
			#root_device_type=nil,
			#security_group_ids=nil,
			#state=nil,
			#state_reason=nil,
			#subnet_id=nil,
			#tenancy=nil,
			#tags=nil,
			#user_data=nil,
			#vpc_id=nil
			
			#CloudStack
			# id="5b1cc7b7-96be-438a-8e22-1ebc31746354",
			# name="TomsToy",
			# account_name="admin",
			# domain_name="ROOT",
			# created="2012-07-13T17:22:00-0500",
			# state="Running",
			# haenable=false,
			# memory=512,
			# display_name="TomsToy",
			# domain_id="2fd12254-0300-4848-b10b-a5614c19932d",
			# host_id="c6e7f73e-5f9a-4198-b521-8112a54780b1",
			# host_name="msicloud10",
			# project_id=nil,
			# zone_id="23422ded-60d4-41c0-a816-7f94c56e4437",
			# zone_name="zone1",
			# image_id="1022ee27-2056-4a64-bcd4-3c3808025f56",
			# image_name="Ubuntu 12.04",
			# templated_display_text="Ubuntu 12.04 (amd_64 no gui)",
			# password_enabled=false,
			# flavor_id="ca808095-5f61-4974-a46d-3dee010c44f8",
			# flavor_name="Small Instance",
			# cpu_number=1,
			# cpu_speed=500,
			# cpu_used="0.02%",
			# network_kbs_read=152927,
			# network_kbs_write=200,
			# guest_os_id="398f0dad-6997-4e25-aea5-05d49781d0e7",
			# root_device_id=0,
			# root_device_type="NetworkFilesystem",
			# security_group_list=[{"id"=>"b86dd173-3bf7-4d6c-8d38-5eefa061771d", "name"=>"default", "description"=>"Default Security Group"}],
			# nics=[{"id"=>"2e0f2d81-da23-481e-908c-9a292d93107d", "networkid"=>"dbf42e7a-2cd4-4cea-a2f5-16a1893f6753", "netmask"=>"255.255.254.0", "gateway"=>"172.31.254.1", "ipaddress"=>"172.31.254.237", "isolationuri"=>"ec2://untagged", "broadcasturi"=>"vlan://untagged", "traffictype"=>"Guest", "type"=>"Shared", "isdefault"=>true, "macaddress"=>"06:66:2e:00:00:0e"}]

    		
    		if(provider == CloudConstants::Type::OPENSTACK || provider == CloudConstants::Type::HP)
				formatted_server[:flavor_id] = $compute.flavors.get(server.flavor["id"]).name
                image = $compute.images.get(server.image["id"])
				formatted_server[:image_name] = image.name unless image.nil?
				formatted_server[:tenant_id] = server.tenant_id
				formatted_server[:user_id] = server.user_id
				formatted_server[:host_id] = server.host_id
				unless server.addresses["private"].nil?
        			formatted_server[:public_ip_address] = server.addresses["private"][1]["addr"] unless server.addresses["private"][1].nil?
        			formatted_server[:private_ip_address] = server.addresses["private"][0]["addr"] unless server.addresses["private"][0].nil?
				end
    		end
    		
    		case provider
    			when CloudConstants::Type::AWS
                    name = server.tags["Name"]
                    unless account.nil?
                        if name.nil?
                            account.cloud_resources.each do |r|
                                if r.physical_id == server.id
                                    name = r.properties["name"]
                                    formatted_server[:description] = r.properties["description"]
                                end
                            end
                        end
                    end
    				formatted_server[:name] = name
    				formatted_server[:stack_resource_name] = server.tags["aws:cloudformation:logical-id"]
					formatted_server[:stack_name] = server.tags["aws:cloudformation:stack-name"]
    			when CloudConstants::Type::CLOUDSTACK
					formatted_server[:availability_zone] = server.zone_name
					formatted_server[:flavor_id] = server.flavor_name
					formatted_server[:public_ip_address] = server.nics.first["ipaddress"]
					formatted_server[:name] = server.display_name
					formatted_server[:created] = Time.zone.parse(server.created).utc
					security_groups = []
					server.security_group_list.each do |t|
						security_groups << t["name"]
					end
					formatted_server[:groups] = security_groups
    			when CloudConstants::Type::HP
    			when CloudConstants::Type::JOYENT
    				formatted_server[:flavor_id] = "Memory:" + server.memory.to_s + "; Disk:" + server.disk.to_s
    				formatted_server[:image_id] = server.dataset
    				if server.ips.length > 0
    					formatted_server[:private_ip_address] = server.ips[0]
    					if server.ips.length > 1
    						formatted_server[:public_ip_address] = server.ips[1]
    					end
    				end
    				formatted_server[:created_at] = server.created
    			when CloudConstants::Type::OPENSTACK
					formatted_server[:image_id] = server.image["id"]
					formatted_server[:state] = server.os_ext_sts_vm_state
					if cloud.topstack_enabled
						formatted_server[:availability_zone] = cloud.topstack_id
					end
				when CloudConstants::Type::RACKSPACE
					formatted_server[:public_ip_address] = server.addresses["public"][0] unless server.addresses["public"].nil?
					formatted_server[:private_ip_address] = server.addresses["private"][0] unless server.addresses["private"].nil?
					formatted_server[:image_name] = $compute.images.get(server.image_id).name
					formatted_server[:flavor_id] = $compute.flavors.get(server.flavor_id).name
    		end
    		
    		return formatted_server
		end
	
		def describe_instances_parser(provider, servers, cloud, account=nil)
			formatted_servers = []
        	servers.each do |t|
				formatted_server = describe_instance_parser(provider, t, cloud, account)
        		
        		formatted_servers << formatted_server
        	end
        	
        	return formatted_servers
		end
		
		def describe_volume_parser(provider, volume, account=nil)
			formatted_volume = volume.attributes
			
			#AWS
			#id="vol-5e923f3f",
			#attached_at=2012-07-13 18:16:56 UTC,
			#availability_zone="us-east-1a",
			#created_at=2012-07-13 18:16:30 UTC,
			#delete_on_termination=true,
			#device="/dev/sda1",
			#server_id="i-00fa6278",
			#size=8,
			#snapshot_id="snap-59f01b3b",
			#state="in-use",
			#tags={}
			
			#OpenStack
			#id=54,
			#name=nil,
			#description=nil,
			#status="available",
			#size=5,
			#type=nil,
			#snapshot_id=nil,
			#availability_zone="nova",
			#created_at="2012-07-19 15:11:52",
			#attachments=[{}]
			
			#CloudStack
			# id="c4cdd8d4-562f-4e98-a82f-fdbd89aa1744",
            # name="ROOT-4",
            # zone_id="23422ded-60d4-41c0-a816-7f94c56e4437",
            # zone_name="zone1",
            # type="ROOT",
            # size=139264,
            # created="2012-07-13T17:22:00-0500",
            # state="Ready",
            # account="admin",
            # domain_id="2fd12254-0300-4848-b10b-a5614c19932d",
            # domain="ROOT",
            # storage_type="shared",
            # hypervisor="KVM",
            # disk_offering_id=nil,
            # disk_offering_name=nil,
            # disk_offering_display_text=nil,
            # storage="NFSPrimary",
            # destroyed=false,
            # is_extractable=true,
            # server_id="5b1cc7b7-96be-438a-8e22-1ebc31746354",
            # server_name="TomsToy",
            # server_display_name="TomsToy"

			
			case provider
    			when CloudConstants::Type::AWS
                    name = volume.tags["Name"]
                    unless account.nil?
                        if name.nil?
                            account.cloud_resources.each do |r|
                                if r.physical_id == volume.id
                                    name = r.properties["name"]
                                    formatted_volume[:description] = r.properties["description"]
                                end
                            end
                        end
                    end
					formatted_volume[:name] = name
					formatted_volume[:stack_name] = volume.tags["aws:cloudformation:stack-name"]
					formatted_volume[:stack_resource_name] = volume.tags["aws:cloudformation:logical-id"]
    			when CloudConstants::Type::CLOUDSTACK
					formatted_volume[:availability_zone] = volume.zone_name
					formatted_volume[:created_at] = Time.zone.parse(volume.created).utc
					if(volume.size > 1073741824)
						#convert to gigabytes
						formatted_volume[:size] = (volume.size/1073741824).to_s + " GB"
					elsif(volume.size > 1048576)
						#convert to megabytes
						formatted_volume[:size] = (volume.size/1048576).to_s + " MB"
					elsif(volume.size > 1024)
						#convert to kilobyte
						formatted_volume[:size] = (volume.size/1024).to_s + " KB"
					else
						#leave as bytes
						formatted_volume[:size] = volume.size.to_s + "Bytes"
					end
    			when CloudConstants::Type::OPENSTACK
                    formatted_volume[:name] = volume.name
                    formatted_volume[:description] = volume.description
					formatted_volume[:state] = volume.status
					formatted_volume[:created_at] = Time.zone.parse(volume.created_at).utc
					if volume.attachments.length > 0
						formatted_volume[:server_id] = volume.attachments[0]["serverId"]
						formatted_volume[:device] = volume.attachments[0]["device"]
					end
    		end
			
			if provider != CloudConstants::Type::CLOUDSTACK
				formatted_volume[:size] = formatted_volume[:size].to_s + " GB"
			end
    		
    		return formatted_volume
		end
		
		def describe_volumes_parser(provider, volumes, account=nil)
			formatted_volumes = []
			volumes.each do |t|
				formatted_volume = describe_volume_parser(provider, t, account)
				
				formatted_volumes << formatted_volume
			end
			
			return formatted_volumes
		end
		
		def describe_snapshots_parser(provider, snapshots)
			formatted_snapshots = []
			snapshots.each do |t|
				if provider == CloudConstants::Type::CLOUDSTACK
					formatted_snapshot = t
				else
					formatted_snapshot = t.attributes
				end
				
				#AWS
				#id="snap-8b96c5f5",
				#description="Name says it all.",
				#progress="100%",
				#created_at=2012-07-01 21:11:57 UTC,
				#owner_id="983391187112",
				#state="completed",
				#tags={"Name"=>"ProductionMongoDB 07-01-2012"},
				#volume_id="vol-30ea055f",
				#volume_size=2
				
				#OpenStack
				#id=1,
				#name="TestSnapshot",
				#description="",
				#volume_id=54,
				#status="available",
				#size=5,
				#created_at="2012-07-20 14:39:02"

				case provider
					when CloudConstants::Type::AWS
						formatted_snapshot[:name] = t.tags["Name"]
					when CloudConstants::Type::CLOUDSTACK
						formatted_snapshot = formatted_snapshot.symbolize_keys
						formatted_snapshot[:volume_id] = formatted_snapshot[:volumeid]
						formatted_snapshot[:created_at] = Time.zone.parse(formatted_snapshot[:created]).utc
					when CloudConstants::Type::OPENSTACK
						formatted_snapshot[:volume_size] = t.size
				end
				formatted_snapshots << formatted_snapshot
    		end
    		
    		return formatted_snapshots
		end
		
		def describe_zones_parser(provider, zones)
			formatted_zones = []
			zones.each do |t|
				formatted_zone = t.attributes
				
				case provider
					when CloudConstants::Type::AWS
					when CloudConstants::Type::CLOUDSTACK
						formatted_zone = formatted_zone.stringify_keys
						formatted_zone["zoneName"] = formatted_zone["name"]
				end
				formatted_zones << formatted_zone
			end
			
			return formatted_zones
		end
	end
end
