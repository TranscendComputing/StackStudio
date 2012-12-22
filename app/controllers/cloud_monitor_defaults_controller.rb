class CloudMonitorDefaultsController < ApplicationController
    include ServiceInterfaceMethods
  # GET /cloud_monitor_defaults
  # GET /cloud_monitor_defaults.xml
  def index
    @cloud_monitor_defaults = CloudMonitorDefault.all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @cloud_monitor_defaults }
    end
  end

  # GET /cloud_monitor_defaults/1
  # GET /cloud_monitor_defaults/1.xml
  def show
    @cloud_monitor_default = CloudMonitorDefault.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @cloud_monitor_default }
    end
  end

  # GET /cloud_monitor_defaults/new
  # GET /cloud_monitor_defaults/new.xml
  def new
    @cloud_monitor_default = CloudMonitorDefault.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @cloud_monitor_default }
    end
  end

  # GET /cloud_monitor_defaults/1/edit
  def edit
    @cloud_monitor_default = CloudMonitorDefault.find(params[:id])
  end

  # POST /cloud_monitor_defaults
  # POST /cloud_monitor_defaults.xml
  def create
    @cloud_monitor_default = CloudMonitorDefault.new(params[:cloud_monitor_default])

    respond_to do |format|
      if @cloud_monitor_default.save
        format.html { redirect_to(@cloud_monitor_default, :notice => 'Cloud monitor default was successfully created.') }
        format.xml  { render :xml => @cloud_monitor_default, :status => :created, :location => @cloud_monitor_default }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @cloud_monitor_default.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /cloud_monitor_defaults/1
  # PUT /cloud_monitor_defaults/1.xml
  def update
    @cloud_monitor_default = CloudMonitorDefault.find(params[:id])

    respond_to do |format|
      if @cloud_monitor_default.update_attributes(params[:cloud_monitor_default])
        format.html { redirect_to(@cloud_monitor_default, :notice => 'Cloud monitor default was successfully updated.') }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @cloud_monitor_default.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /cloud_monitor_defaults/1
  # DELETE /cloud_monitor_defaults/1.xml
  def destroy
    @cloud_monitor_default = CloudMonitorDefault.find(params[:id])
    @cloud_monitor_default.destroy

    respond_to do |format|
      format.html { redirect_to(cloud_monitor_defaults_url) }
      format.xml  { head :ok }
    end
  end

  
  def get_monitor_stats
	stats = get_stats(params)
	render :xml => stats
  end
  
  
  protected
  
  def get_stats(params)
#	begin
		params[:service] = "ACW"
		acw = getResourceInterface(params)
        if(params[:monitor_description] == 'elc' || params[:monitor_description] == 'elc_node' || params[:monitor_description] == 'elc_node_stats')
              #passing cluster id and instance id in monitor_resource_name to be used in get_dimensions
              @monitor_resource_name = params[:cluster_id] + "," + params[:instance_id]
        else
              @monitor_resource_name = params[:instance_id]
        end
		
		time_range = params[:start_time].to_i
		start_time = DateTime.now.utc - time_range.seconds
		period = params[:period].to_i
		
		namespace_name = get_cloud_namespace_set
		  
		# HACK ALERT
		# DIMENSIONS hardcoded
		options = {}
		options["Period"] = period
		options["Statistics"] = [params[:monitor_statistic_name]]
		options["Namespace"] = namespace_name
		options["Unit"] = params[:monitor_unit]
		options["Dimensions"] = get_dimensions(params)
		options["MetricName"] = params[:monitor_metric_name]
		options["StartTime"] = start_time
		options["EndTime"] = DateTime.now.utc
		result = acw.get_metric_statistics(options).body["GetMetricStatisticsResult"]
		result["Datapoints"] = result["Datapoints"].sort_by {|s| s["Timestamp"]}
		
		unit = result["Datapoints"].first["Unit"]

		first_timestamp = result["Datapoints"].first["Timestamp"]
		additional_datapoint_time = start_time.strftime("%Y-%m-%d %H:%M:%S UTC").to_time
		index = 0

		while additional_datapoint_time < first_timestamp
			result["Datapoints"].insert(index, {"Timestamp"=>additional_datapoint_time, "Unit"=>unit, "Average"=>0})
			
			additional_datapoint_time = additional_datapoint_time + period
			index = index + 1
		end
	  
		if(unit == "Bytes")
			max = result["Datapoints"].max_by {|d| d["Average"]}

			if(max["Average"] > 1073741824)
				#convert to gigabytes
				unit = "GB"
				
				result["Datapoints"].each do |t|
					t["Unit"] = unit
					t["Average"] = t["Average"]/1073741824
				end
			elsif(max["Average"] > 1048576)
				#convert to megabytes
				unit = "MB"
				
				result["Datapoints"].each do |t|
					t["Unit"] = unit
					t["Average"] = t["Average"]/1048576
				end
			elsif(max["Average"] > 1024)
				#convert to kilobytes
				unit = "KB"
				
				result["Datapoints"].each do |t|
					t["Unit"] = unit
					t["Average"] = t["Average"]/1024
				end
			end
		end

		
		pretty_metric_name = pretty_monitor_metric_name(result["Label"], unit)
		
		chart =
		{
			"Label" => pretty_metric_name,
			"Unit" => unit || "No Data",
			"Datapoints" =>
				  result["Datapoints"].map{ |datapoint|
					{
						"Datapoints" => datapoint["Sum"] || datapoint["Average"] || datapoint["Minimum"] || datapoint["Maximum"] || datapoint["Samples"],
						"Timestamp" => datapoint["Timestamp"]
					}
				  }
		}
		return chart
		
#	rescue
		#Instance not found error, return no data available
#		pretty_metric_name = pretty_monitor_metric_name(params[:monitor_metric_name])
#		no_data_label = pretty_metric_name + " : Data Not Available"
#		return chart = {"Label" => no_data_label}
#	end
  end
  
  def get_dimensions(params)
    		dimensions = {}
    		type = params[:monitor_description]
    		case type
      			when 'ec2Default'
      				dimensions = [{"Name" => "InstanceId", "Value" => @monitor_resource_name}]
      			when 'lbDefault'
      				dimensions = [{"Name" => "LoadBalancerName", "Value" => @monitor_resource_name}]
      			when 'rdsDefault'
      				dimensions = [{"Name" => "DBInstanceIdentifier", "Value" => @monitor_resource_name.downcase}]
      			when 'sqsDefault'
      				dimensions = [{"Name" => "QueueName", "Value" => @monitor_resource_name}]
      			when 'ebsDefault'
      				dimensions = [{"Name" => "VolumeId", "Value" => @monitor_resource_name}]
      			when 'elcDefault', 'elcNodeDefault', 'elcNodeStatsDefault'
      				dimensions = [{"Name" => "CacheClusterId", "Value" => params[:cluster_id]},{"Name" => "CacheNodeId", "Value" => params[:instance_id]}]
      			when 'snsDefault'
      				dimensions = [{"Name" => "TopicName", "Value" => @monitor_resource_name}]
				when 'asDefault'
					dimensions = [{"Name" => "AutoScalingGroupName", "Value" => @monitor_resource_name}]
      			else raise NotImplementedError, "Dimension #{type} not implemented yet"
    		end

    		return dimensions
  	end
  
  	def get_cloud_namespace_set
		namespace_name = ""
		case params[:monitor_description]
		  	when 'ec2Default'
			      		namespace_name = "AWS/EC2"
			when 'lbDefault'
			      		namespace_name = "AWS/ELB"
			when 'rdsDefault'
			      		namespace_name = "AWS/RDS"
			when 'sqsDefault'
			      		namespace_name = "AWS/SQS"
			when 'ebsDefault'
			      		namespace_name = "AWS/EBS"
			when 'elcDefault', 'elcNodeDefault', 'elcNodeStatsDefault'
			      		namespace_name = "AWS/ElastiCache"
			when 'snsDefault'
			      		namespace_name = "AWS/SNS"
			when 'asDefault'
					namespace_name = "AWS/EC2"
		end
		return namespace_name
  	end

  
  	def pretty_monitor_metric_name(metric_name, unit=nil)
		split_array = metric_name.underscore.humanize.split(" ")
		split_array.each {|w| w.capitalize!}
		pretty_metric_name = split_array.join(" ")
  		
  		if(!unit.nil?)
  			pretty_metric_name = pretty_metric_name + " (" + unit + ")"
  		end
  		return pretty_metric_name
  	end

end
