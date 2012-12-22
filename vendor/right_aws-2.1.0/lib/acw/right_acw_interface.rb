#
# Copyright (c) 2007-2009 RightScale Inc
#
# Permission is hereby granted, free of charge, to any person obtaining
# a copy of this software and associated documentation files (the
# "Software"), to deal in the Software without restriction, including
# without limitation the rights to use, copy, modify, merge, publish,
# distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so, subject to
# the following conditions:
#
# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
# NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
# LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
# WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
#

module RightAws

  # = RightAWS::AcwInterface -- RightScale Amazon Cloud Watch interface
  # The RightAws::AcwInterface class provides a complete interface to Amazon Cloud Watch service.
  #
  # For explanations of the semantics of each call, please refer to Amazon's documentation at
  # http://docs.amazonwebservices.com/AmazonCloudWatch/latest/DeveloperGuide/
  #
  class AcwInterface < RightAwsBase
    include RightAwsBaseInterface

    # Amazon ACW API version being used
    API_VERSION       = "2010-08-01" #"2009-05-15"
    DEFAULT_HOST      = "monitoring.amazonaws.com"
    DEFAULT_PATH      = '/'
    DEFAULT_PROTOCOL  = 'http' #''https'
    DEFAULT_PORT      = 80 #443

    #PROXY_HOST = "http://ipv4.fiddler"
    #PROXY_PORT = 8888

    @@valid_history_item_types	= ["ConfigurationUpdate","StateUpdate","Action"]
    @@valid_actions				= ["EnableAlarmActions","DisableAlarmActions"]

   # See the cloud_services table in ToughUI or the Service table in ToughCore
   # Copied from cloud_target_override.rb
   @@service_values = ["AWSEB","ACW","ELB","EC2","SQS", "RDS", "S3", "AWSCFN", "AS"]

   # These match com.msi.tough.model.monitor.enums.ServiceHealthStatus in ToughCore
   @@service_health_status = ["Unknown","Issues","Disrupted","Information","Healthy"]

    @@bench = AwsBenchmarkingBlock.new
    def self.bench_xml
      @@bench.xml
    end
    def self.bench_service
      @@bench.service
    end

    # Create a new handle to an ACW account. All handles share the same per process or per thread
    # HTTP connection to Amazon ACW. Each handle is for a specific account. The params have the
    # following options:
    # * <tt>:endpoint_url</tt> a fully qualified url to Amazon API endpoint (this overwrites: :server, :port, :service, :protocol). Example: 'https://monitoring.amazonaws.com/'
    # * <tt>:server</tt>: ACW service host, default: DEFAULT_HOST
    # * <tt>:port</tt>: ACW service port, default: DEFAULT_PORT
    # * <tt>:protocol</tt>: 'http' or 'https', default: DEFAULT_PROTOCOL
    # * <tt>:logger</tt>: for log messages, default: RAILS_DEFAULT_LOGGER else STDOUT
    # * <tt>:signature_version</tt>:  The signature version : '0','1' or '2'(default)
    # * <tt>:cache</tt>: true/false(default): list_metrics
    #
    def initialize(aws_access_key_id=nil, aws_secret_access_key=nil, params={})
=begin    
	  # Hack to get Heath's monitoring working
	  if aws_access_key_id == "AZlRtSTZTuTZJ5A4o5tNcHu1jtKiMjpr0zL00g"
		params[:default_host] = "172.17.1.105" 
		params[:server] = "172.17.1.105"
		#params[:default_service] = "/MonitorQuery"
		#params[:service] = "/MonitorQuery"
		aws_access_key_id = "DwIctxUqVDJ7w7KAFuv5KaFZqglFzpA49XL7pg"
      end
=end
      init({ :name                => 'ACW',
             :default_host        => ENV['ACW_URL'] ? URI.parse(ENV['ACW_URL']).host   : DEFAULT_HOST,
             :default_port        => ENV['ACW_URL'] ? URI.parse(ENV['ACW_URL']).port   : DEFAULT_PORT,
             :default_service     => ENV['ACW_URL'] ? URI.parse(ENV['ACW_URL']).path   : DEFAULT_PATH,
             :default_protocol    => ENV['ACW_URL'] ? URI.parse(ENV['ACW_URL']).scheme : DEFAULT_PROTOCOL,
             #:proxy_host => PROXY_HOST,
             #:proxy_port => 8888,
             :default_api_version => ENV['ACW_API_VERSION'] || API_VERSION },
           aws_access_key_id    || ENV['AWS_ACCESS_KEY_ID'] ,
           aws_secret_access_key|| ENV['AWS_SECRET_ACCESS_KEY'],
           params)
           
    end

    def generate_request(action, params={}) #:nodoc:
      generate_request_impl(:get, action, params )
    end

      # Sends request to Amazon and parses the response
      # Raises AwsError if any banana happened
    def request_info(request, parser)  #:nodoc:
      request_info_impl(:ams_connection, @@bench, request, parser)
    end

    #-----------------------------------------------------------------
    #      MetricStatistics
    #-----------------------------------------------------------------

    # Get time-series data for one or more statistics of given a Metric
    # Returns a hash of stat data.
    #
    # NOTE: 2010-08-01 schema has changed MeasureName to MetricName
    #
    #  Options are:
    #
    #    :period       - x*60 seconds interval (where x > 0)
    #    :statistics   - Average, Minimum. Maximum, Sum, Samples
    #    :start_time   - The timestamp of the first datapoint to return, inclusive.
    #    :end_time     - The timestamp to use for determining the last datapoint to return. This is the last datapoint to fetch, exclusive.
    #    :namespace    - The namespace corresponding to the service of interest. For example, AWS/EC2 represents Amazon EC2.
    #    :unit         - Seconds, Percent, Bytes, Bits, Count, Bytes/Second, Bits/Second, Count/Second, and None
    #    :custom_unit  - The user-defined CustomUnit applied to a Measure. Please see the key term Unit.
    #    
    #    :dimentions
    #      Dimensions for EC2 Metrics:
    #      * ImageId              - shows the requested metric for all instances running this EC2 Amazon Machine Image(AMI)
    #      * AvailabilityZone     - shows the requested metric for all instances running in that EC2 Availability Zone
    #      * CapacityGroupName    - shows the requested metric for all instances in the specified capacity group - this dimension is
    #                               only available for EC2 metrics when the instances are in an Amazon Automatic Scaling Service
    #                               Capacity Group
    #      * InstanceId           - shows the requested metric for only the identified instance
    #      * InstanceType         - shows the requested metric for all instances running with that instance type
    #      * Service (required)   - the name of the service that reported the monitoring data - for EC2 metrics, use "EC2"
    #      * Namespace (required) - in private beta, the available metrics are all reported by AWS services, so set this to "AWS"
    #      Dimensions for Load Balancing Metrics:
    #      * AccessPointName      - shows the requested metric for the specified AccessPoint name
    #      * AvailabilityZone     - shows the requested metric for all instances running in that EC2 Availability Zone
    #      * Service (required)   - the name of the service that reported the monitoring data - for LoadBalancing metrics, use "LBS"
    #      * Namespace (required) - in private beta, the available metrics are all reported by AWS services, so set this to "AWS"
    #
    #    :measure_name
    #      EC2 Metrics:
    #      * CPUUtilization  the percentage of allocated EC2 Compute Units that are currently in use on the instance. Units are Percent.
    #      * NetworkIn      - the number of bytes received on all network interfaces by the instance. Units are Bytes.
    #      * NetworkOut     - the number of bytes sent out on all network interfaces by the instance. Units are Bytes.
    #      * DiskReadOps    - completed read operations from all disks available to the instance in one minute. Units are Count/Second.
    #      * DiskWriteOps   - completed writes operations to all disks available to the instance in one minute. Units are Count/Second.
    #      * DiskReadBytes  - bytes read from all disks available to the instance in one minute. Units are Bytes/Second.
    #      * DiskWriteBytes - bytes written to all disks available to the instance in one minute. Units are Bytes/Second.
    #      Load Balancing Metrics:
    #      * Latency            - time taken between a request and the corresponding response as seen by the load balancer. Units are in
    #                             seconds, and the available statistics include minimum, maximum, average and count.
    #      * RequestCount       - number of requests processed by the AccessPoint over the valid period. Units are count per second, and
    #                             the available statistics include minimum, maximum and sum. A valid period can be anything equal to or
    #                             multiple of sixty (60) seconds.
    #      * HealthyHostCount   - number of healthy EndPoints for the valid Period. A valid period can be anything equal to or a multiple
    #                             of sixty (60) seconds. Units are the count of EndPoints. The meaningful statistic for HealthyHostCount
    #                             is the average for an AccessPoint within an Availability Zone. Both Load Balancing dimensions,
    #                             AccessPointName and AvailabilityZone, should be specified when retreiving HealthyHostCount.
    #      * UnHealthyHostCount - number of unhealthy EndPoints for the valid Period. A valid period can be anything equal to or a multiple
    #                             of sixty (60) seconds. Units are the count of EndPoints. The meaningful statistic for UnHealthyHostCount
    #                             is the average for an AccessPoint within Availability Amazon Monitoring Service Developer Guide Load
    #                             Balancing Metrics Version PRIVATE BETA 2009-01-22 19 Zone. Both Load Balancing dimensions, AccessPointName
    #                             and AvailabilityZone, should be specified when retreiving UnHealthyHostCount.
    #
    def get_metric_statistics(options={})
      # Period (60 sec by default)
      period = (options[:period] && options[:period].to_i) || 60
      # Statistics ('Average' by default)
      statistics = Array(options[:statistics]).flatten
      statistics = statistics.right_blank? ? ['Average'] : statistics.map{|statistic| statistic.to_s.capitalize }
      # Times (5.min.ago up to now by default)
      start_time = options[:start_time] || (Time.now.utc - 5*60)
      start_time = start_time.utc.strftime("%Y-%m-%dT%H:%M:%S+00:00") if start_time.is_a?(Time)
      end_time = options[:end_time] || Time.now.utc
      end_time = end_time.utc.strftime("%Y-%m-%dT%H:%M:%S+00:00") if end_time.is_a?(Time)
      # Measure name
      measure_name = options[:measure_name] || 'CPUUtilization'
      # Dimentions (a hash, empty by default)
      dimentions = options[:dimentions] || {}
      #
      request_hash = { 'Period'      => period,
                       'StartTime'   => start_time,
                       'EndTime'     => end_time,
                       'MetricName'  => measure_name 
                      }
                       # 2010 change 'MeasureName' => measure_name }
                       
      request_hash['Unit']       = options[:unit]        if options[:unit]
      request_hash['CustomUnit'] = options[:custom_unit] if options[:custom_unit]
      request_hash['Namespace']  = options[:namespace]   if options[:namespace]
      request_hash.merge!(amazonize_list('Statistics.member', statistics))
      # dimentions
      dim = []
      dimentions.each do |key, values|
        Array(values).each { |value|  dim << [key, value] }
      end
      request_hash.merge!(amazonize_list(['Dimensions.member.?.Name', 'Dimensions.member.?.Value'], dim))
      #
      link = generate_request("GetMetricStatistics", request_hash)
      request_info(link, GetMetricStatisticsParser.new(:logger => @logger))
    end

    # This call returns a list of the valid metrics for which there is recorded data available to a you.
    #
    #  acw.list_metrics #=>
    #      [ { :namespace    => "AWS/ELB",
    #          :measure_name => "HealthyHostCount",
    #          :dimentions   => { "LoadBalancerName"=>"test-kd1" } },
    #        { :namespace    => "AWS/ELB",
    #          :measure_name => "UnHealthyHostCount",
    #          :dimentions   => { "LoadBalancerName"=>"test-kd1" } } ]
    def list_metrics
      link = generate_request("ListMetrics")
      request_cache_or_info :list_metrics, link,  ListMetricsParser, @@bench, true
    end

    #-----------------------------------------------------------------
    #      GetServiceHealthEvents (MSI Contrived)
    #-----------------------------------------------------------------

    def put_service_health ( service_abbreviation, status, description, options={} )

      unless @@service_values.include?( service_abbreviation )
        raise ArgumentError, "Only #{@@service_values} allowed in #{__method__} service"
      end

      unless @@service_health_status.include?( status )
        raise ArgumentError, "Only #{@@service_health_status} allowed in #{__method__} service"
      end

      region = options[:region] || ""
      availability_zone = options[:availability_zone] || ""

      request_hash =
      {
          'Service' => service_abbreviation,
          'Region' => region,
          'AvailabilityZone' => availability_zone,
          'Status' => status,
          'HealthEventDescription' => description
      }

      req = generate_request("PutServiceHealthEvent", request_hash)

      request_info( req, GenericRequestIdParser.new(:logger => @logger))

    end

    # If no :start_time or :end_time passed, will default to today
    # If no :latest_per_day bool defaults to only the greatest event time per day (per service)
    # Caution:  If you specify a range and there are no events for a service, you will receive
    # only one default entry per service for the entire range
    def get_service_health ( options={} )

      # Times (5.min.ago up to now by default)
      start_time = options[:start_time] || (Time.now.utc.beginning_of_day) # at_midnight
      start_time = start_time.utc.strftime("%Y-%m-%dT%H:%M:%S+00:00") if start_time.is_a?(Time)
      end_time = options[:end_time] || (Time.now.utc.end_of_day)
      end_time = end_time.utc.strftime("%Y-%m-%dT%H:%M:%S+00:00") if end_time.is_a?(Time)

      latest_per_day = options.fetch(:latest_per_day, true)

      request_hash =
      {
          'StartTime' => start_time,
          'EndTime'   => end_time,
          'LatestPerDay' => latest_per_day
      }

      req = generate_request("GetServiceHealthEvents",request_hash)

      request_info( req, GetServiceHealthEventsParser.new(:logger => @logger))

    end


    #-----------------------------------------------------------------
    #      PutMetricAlarm
    #-----------------------------------------------------------------

    # This call creates an Alarm with up to 5 Actions.
    #
    # Parameters are:
    #   alarm_name
    #   metric_name (CPUUtilization)
    #   namespace (AWS/EC2, AWS/ELB... )
    #   statistic (Average, Sum...)
    #   period (Sample Period, 1min, 5min, 15min, 60 min, minimum 1 min) in seconds
    #   comparison_operator (GreaterThanOrEqualToThreshold, GreaterThanThreshold, ...)
    #   threshold (Floating point)
    #   evaluation_periods (duration / period, MUST be a integer)
    #   dimensions
    #   actions_enabled (boolean)
    #
    # Options are:
    #   :actions_enabled default false
    #   :description
    #   :AlarmActions
    #   :OKActions
    #   :InsufficientDataActions
    #
    # All required fields as formal parms., all optional fields are options
    #
    def put_metric_alarm( alarm_name, metric_name, namespace, statistic, period, comparison_operator, threshold, evaluation_periods, dimensions, actions_enabled, options={} )

=begin
      <xs:element name="PutMetricAlarm">
            <xs:element name="AlarmName" type="tns:AlarmName"/>
            <xs:element name="AlarmDescription" type="tns:AlarmDescription" minOccurs="0"/>
            <xs:element name="ActionsEnabled" type="xs:boolean" minOccurs="0"/>
            <xs:element name="OKActions" type="tns:ResourceList" minOccurs="0"/>
            <xs:element name="AlarmActions" type="tns:ResourceList" minOccurs="0"/>
            <xs:element name="InsufficientDataActions" type="tns:ResourceList" minOccurs="0"/>
            <xs:element name="MetricName" type="tns:MetricName"/>
            <xs:element name="Namespace" type="tns:Namespace"/>
            <xs:element name="Statistic" type="tns:Statistic"/>
            <xs:element name="Dimensions" type="tns:Dimensions" minOccurs="0"/>
            <xs:element name="Period" type="tns:Period"/>
            <xs:element name="Unit" type="tns:StandardUnit" minOccurs="0"/>
            <xs:element name="EvaluationPeriods" type="tns:EvaluationPeriods"/>
            <xs:element name="Threshold" type="xs:double"/>
            <xs:element name="ComparisonOperator" type="tns:ComparisonOperator"/>
      </xs:element>
=end

       actions_enabled = options[:actions_enabled] || false

       # should check dimensions limit = 10
       # should check unit in StandardUnit
       # should check ComparisonOperator in set

       request_hash =
        {
            'AlarmName' => alarm_name,
            'ActionsEnabled' => actions_enabled,
            'MetricName' => metric_name,
            'Namespace' => namespace,
            'Statistic' => statistic,
            'Period' => period,
            'Unit' => 'Percent',
            'EvaluationPeriods' => evaluation_periods,
            'Threshold' => threshold,
            'ComparisonOperator' => comparison_operator
        }
        request_hash['AlarmDescription'] = options[:description] if options[:description]

      dim = []
      dimensions.each do |key, values|
        Array(values).each { |value|  dim << [key, value] }
      end
      request_hash.merge!(amazonize_list(['Dimensions.member.?.Name', 'Dimensions.member.?.Value'], dim))

      req = generate_request("PutMetricAlarm", request_hash )

      request_info( req, GenericRequestIdParser.new(:logger => @logger))

    end
    
    # There are no required parameters for describe_alarm_history
    # Options are:
    #   :alarm_name
    #   :history_item_type (ConfigurationUpdate, StateUpdate, Action)
    #   :start_date
    #   :end_date
    #   :max_records
    #   :next_token
    #
    def describe_alarm_history( options={} )
    		
		if options.has_key?(:history_item_type)
			unless @@valid_history_item_types.include?(options[:history_item_type])
				raise ArgumentError, "Only #{@@valid_history_item_types} allowed in #{__method__} history_item_type"
			end
		end
		
		request_hash = {}
        request_hash['AlarmName'] 		= options[:alarm_name] 			if options[:alarm_name]
        request_hash['HistoryItemType']	= options[:history_item_type] 	if options[:history_item_type]
        request_hash['StartDate']		= options[:start_date] 			if options[:start_date]
        request_hash['EndDate']			= options[:end_date] 			if options[:end_date]
        request_hash['MaxRecords']		= options[:max_records] 		if options[:max_records]
        request_hash['NextToken']		= options[:next_token] 			if options[:next_token]
        	
        link = generate_request("DescribeAlarmHistory", request_hash )
		request_cache_or_info(:describe_monitoring_alarm_history, link,  AlarmHistoryParser, @@bench, true )

    end


    def delete_alarms( *alarm_names )
    
      # flatten turns array elements that are also array into a single array
      # compact removes null
      # uniq removes duplicates
      
      alarm_names = alarm_names.flatten.compact.uniq
      validate_alarm_names( alarm_names, "delete_alarms" )
      
      request_hash = amazonize_list('AlarmNames.member', alarm_names)
      link = generate_request("DeleteAlarms", request_hash)
      request_cache_or_info(:delete_monitoring_alarms, link,  GenericRequestIdParser, @@bench, alarm_names.right_blank?)

    end
    
    def enable_alarm_actions( *alarm_names )
    
      enable_disable_alarm_actions( "EnableAlarmActions", alarm_names ) 

    end

    def disable_alarm_actions( *alarm_names )

      enable_disable_alarm_actions( "DisableAlarmActions", alarm_names ) 

    end

    def enable_disable_alarm_actions( action, *alarm_names )

      unless @@valid_actions.include?(action)
        raise ArgumentError, "Only #{@@valid_actions} allowed in #{__method__} action"
      end

      alarm_names = alarm_names.flatten.compact.uniq
      validate_alarm_names( alarm_names, action )

      request_hash = amazonize_list('AlarmNames.member', alarm_names)
      link = generate_request(action, request_hash)
      request_cache_or_info(:enable_monitoring_alarm_actions, link,  GenericRequestIdParser, @@bench, alarm_names.right_blank?)

    end


    # String.underscore is part of Rails 3
    def validate_alarm_names( alarm_names, caller )
    
      if alarm_names.length > 100
        raise ArgumentError, "Only 100 Alarm Names are allowed in #{caller.underscore}"
      end
    
    end


    def describe_alarms( params, *alarm_names )
    
      # flatten turns array elements that are also array into a single array
      # compact removes null
      # uniq removes duplicates
      
      alarm_names = alarm_names.flatten.compact.uniq

	  request_hash = amazonize_list('AlarmNames.member', alarm_names)
      request_hash[:StateValue] = params[:state_value] if params[:state_value]
      request_hash[:AlarmNamePrefix] = params[:alarm_name_prefix] if params[:alarm_name_prefix]
      request_hash[:ActionPrefix] = params[:action_prefix] if params[:action_prefix]

	  link = generate_request("DescribeAlarms", request_hash)
      request_cache_or_info(:describe_monitoring_alarms, link,  DescribeAlarmsParser, @@bench, alarm_names.right_blank?)
	      
    end


    #-----------------------------------------------------------------
    #      PARSERS: MetricStatistics
    #-----------------------------------------------------------------

    class GetMetricStatisticsParser < RightAWSParser #:nodoc:
      def tagstart(name, attributes)
        @item = {} if name == 'member'
      end
      def tagend(name)
        case name
        when 'Timestamp'  then @item[:timestamp]   = @text
        when 'Unit'       then @item[:unit]        = @text
        when 'CustomUnit' then @item[:custom_unit] = @text
        when 'Samples'    then @item[:samples]     = @text.to_f
        when 'Average'    then @item[:average]     = @text.to_f
        when 'Minimum'    then @item[:minimum]     = @text.to_f
        when 'Maximum'    then @item[:maximum]     = @text.to_f
        when 'Sum'        then @item[:sum]         = @text.to_f
        when 'member'     then @result[:datapoints] << @item
        when 'Label'      then @result[:label]     = @text
        end
      end
      def reset
        @result = { :datapoints => [] }
      end
    end

    class ListMetricsParser < RightAWSParser #:nodoc:
      
      def tagstart(name, attributes)
        case name
        when 'member'
          case @xmlpath
            when @p then @item = { :dimentions => {} }
          end
        end
      end
      
      def tagend(name)
        case name
        when 'MeasureName' then @item[:measure_name] = @text
        when 'Namespace'   then @item[:namespace] = @text
        when 'Name'        then @dname  = @text
        when 'Value'       then @dvalue = @text
        when 'member'
          case @xmlpath
          when "#@p/member/Dimensions" then @item[:dimentions][@dname] = @dvalue
          when @p then @result << @item
          end
        end
      end
      def reset
        @p      = 'ListMetricsResponse/ListMetricsResult/Metrics'
        @result = []
      end
    end



    class GenericRequestIdParser < RightAWSParser #:nodoc:
      def tagstart(name, attributes)
      end

      def tagend(name)
        @result = @text if name == 'RequestId'
      end
    end


    class AlarmHistoryParser < RightAWSParser #:nodoc:
      def tagstart(name, attributes)
      
		case name
			when 'member' then @item = { :history_data => {} }			
		end
		
      end

      def tagend(name)
        case name
			when 'Timestamp'		then @item[:timestamp] = @text
			when 'HistoryItemType'	then @item[:history_item_type] = @text
			when 'AlarmName'		then @item[:alarm_name] = @text
			when 'HistoryData'		then @item[:history_data] = @j.decode(@text)
			when 'HistorySummary'	then @item[:history_summary] = @text
			
			when 'member'			then @result << @item
        end
        
      end
      
      def reset
      
        @p = 'DescribeAlarmHistoryResponse/DescribeAlarmHistoryResult/AlarmHistoryItems'
		@j = ActiveSupport::JSON
		@result = []
		
      end
    end



    # In these parsers, @p is a constant
    # @xmlpath is the current parent node    
	class DescribeAlarmsParser < RightAWSParser #:nodoc:
      def tagstart(name, attributes)

        case name
            when 'member'
                case @xmlpath
                    when 'DescribeAlarmsResponse/DescribeAlarmsResult/MetricAlarms' then @item = { :dimensions => {} }
                    else @dimension = {}
                end 
        end

      end

      def tagend(name)

        case name
            when 'StateUpdatedTimestamp'                then @item[:state_updated_timestamp] = @text
            when 'AlarmArn'                             then @item[:alarm_arn] = @text 
            when 'AlarmConfigurationUpdatedTimestamp'   then @item[:alarm_configuration_updated_timestamp] = @text 
            when 'AlarmName'                            then @item[:alarm_name] = @text 
            when 'StateValue'                           then @item[:state_value] = @text 
            when 'Period'                               then @item[:period] = @text 
            when 'ActionsEnabled'                       then @item[:actions_enabled] = @text 
            when 'Namespace'                            then @item[:namespace] = @text 
            when 'EvaluationPeriods'                    then @item[:evaluation_periods] = @text 
            when 'Threshold'                            then @item[:threshold] = @text.to_f 
            when 'Statistic'                            then @item[:statistic] = @text
            when 'Unit'                                 then @item[:unit] = @text
            when 'StateReason'                          then @item[:state_reason] = @text
            when 'ComparisonOperator'                   then @item[:comparison_operator] = @text
            when 'MetricName'                           then @item[:metric_name] = @text
            # Dimensions
            when 'Name'                                 then @dname  = @text
            when 'Value'                                then @dvalue = @text
            when 'member'
                case @xmlpath
                    when "#@p/member/Dimensions" then @item[:dimensions][@dname] = @dvalue
                    when @p then @result << @item
                end
        end
      end

      def reset
        @p      = 'DescribeAlarmsResponse/DescribeAlarmsResult/MetricAlarms'
        @result = []
      end

	end


  class GetServiceHealthEventsParser < RightAWSParser #:nodoc:
      def tagstart(name, attributes)

        case name
          when 'ServiceHealthEvent'
            @item = {}
        end

      end

      def tagend(name)

        case name
            when 'ServiceHealthEventID'                   then @item[:id] = @text
            when 'ServiceHealthEventService'              then @item[:service_name] = @text
            when 'ServiceHealthEventServiceAbbreviation'  then @item[:service_name_abbreviation] = @text
            when 'ServiceHealthEventDescription'          then @item[:description] = @text
            when 'ServiceHealthEventStatus'               then @item[:status] = @text
            when 'ServiceHealthEventRegion'               then @item[:region] = @text
            when 'ServiceHealthEventAvailabilityZone'     then @item[:availability_zone] = @text
            when 'ServiceHealthEventTimestamp'            then @item[:timestamp] = @text
            when 'ServiceHealthEvent'
                    @result << @item
        end
      end

      def reset
        @p      = 'GetServiceHealthEvents/GetServiceHealthEventsResult'
        @result = []
      end

  end

  end

end
