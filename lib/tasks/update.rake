namespace :update do
	desc "Set all current services to enabled."
	task :enable_services => [:environment] do
		@client = StackPlace::HttpClient.new
		query = @client.cloud_query
		clouds = query.clouds
		clouds.each do |cloud|
			cloud.cloud_services.each do |s|
                service = s
                @client.remove_cloud_service(cloud.id, s.id)
                service.enabled = true
                @client.add_cloud_service(cloud.id, service)
            end
		end
	end

end