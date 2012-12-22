class CloudTargetOverride

  # See the cloud_services table in ToughUI or the Service table in ToughCore
  @@service_values = ["AWSEB","ACW","ELB","EC2","SQS", "RDS", "S3", "AWSCFN", "AS", "GIM", "ELC", "DNS", "SNS", "IAM", "SDB", "CDN"]

  # Get any overrides needed for the selected Cloud Provider
  # Usually called as:  CloudTargetOverride.get_cloud_url_params( ec2_account, params )
  def self.get_cloud_url_params( ec2_account, service, params )
	@cloud_service = nil
	  unless @@service_values.include?( service )
		  raise ArgumentError, "Only #{@@service_values} allowed in #{__method__} service"
	  end

	  @cloud = $client.cloud_details(ec2_account.cloud_id)
      
    @cloud.cloud_services.each do |serv|
        if serv.service_type == service
            @cloud_service = serv
            break
        end
    end

    if @cloud_service.nil?
        @cloud_service = StackPlace::CloudService.new
    end
    
    # Lookup Cloud URL overrides
    if @cloud_service.protocol.nil?
      params[:scheme] = @cloud.protocol
    else
      params[:scheme] = @cloud_service.protocol
    end

    if @cloud_service.host.nil?
      params[:host] = @cloud.host
    else
      params[:host] = @cloud_service.host
    end

    if @cloud_service.port.nil?
      params[:port] = @cloud.port
    else
      params[:port] = @cloud_service.port
    end

    params[:path] = @cloud_service.path unless @cloud_service.path.nil?

  end

end
