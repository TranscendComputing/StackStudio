require 'fog'

module MultiCloudApi
	class Compute
		def create_instance
			@compute = Fog::Compute.new(@params)
			@server = @compute.servers.create(@attributes)

			#Example server create for OpenStack
			#@server = @compute.servers.create(:flavor_ref => 4, :image_ref => "168420c1-a66e-40c1-a6b8-278d8aae9cc1", :name => 'curtisFogTest', :key_name => 'cstewartsx', :availability_zone => 'nova')
			#
			#
			#Example server create for AWS
			#NOTE: AWS requires :image_id and :flavor_id (different from Openstack :flavor_ref, :image_ref)
			#@server = @compute.servers.create(:image_id => "ami-7f418316", :flavor_id => "m1.small", :key_name => "Metallect")
			#
			#HP requires :flavor_id and :image_id
			#CloudStack requires :flavor_id and :image_id
			#Rackspace requires :flavor_id and :image_id


			@result = @interface.servers
			if @result.is_a?Fog::Compute::AWS::Servers
				return @result
			else @result.is_a?Fog::Compute::OpenStack::Servers
				return os_parser
			end
		end



		private

		def os_parser
			@result.each do |server|
				aws_server 
				aws_server.dns_name = server.public_dns_name
			end
		end
	end
end




				
