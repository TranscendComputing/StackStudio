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

  # The abbreviation for this module, awseb, was taken from Amazon's documentation,
  # as in awseb-api.pdf

  # = RightAWS::AwsEbInterface -- RightScale Amazon Elastic Beanstalk interface
  # The RightAws::EbInterface class provides a partial interface to Amazon Elastic Beanstalk service.
  #
  # Supported Actions:
  #     CreateApplication
  #     DeleteApplication
  #
  # For explanations of the semantics of each call, please refer to Amazon's documentation at
  # http://docs.amazonwebservices.com/elasticbeanstalk/latest/api/
  #
  class ElcInterface < RightAwsBase
    include RightAwsBaseInterface

    # Amazon ELC API version being used
    API_VERSION       = "2012-03-09"
    DEFAULT_HOST      = "elasticache.us-east-1.amazonaws.com"
    DEFAULT_PATH      = '/'
    DEFAULT_PROTOCOL  = 'https' #''https'
    DEFAULT_PORT      = 443 #80 #443

    PROXY_HOST = "http://ipv4.fiddler"
    PROXY_PORT = 8888

    @@bench = AwsBenchmarkingBlock.new
    def self.bench_xml
      @@bench.xml
    end
    def self.bench_service
      @@bench.service
    end

    # Create a new handle to an ELC account. All handles share the same per process or per thread
    # HTTP connection to Amazon ELC. Each handle is for a specific account. The params have the
    # following options:
    # * <tt>:endpoint_url</tt> a fully qualified url to Amazon API endpoint (this overwrites: :server, :port, :service, :protocol). Example: 'https://monitoring.amazonaws.com/'
    # * <tt>:server</tt>: ELC service host, default: DEFAULT_HOST
    # * <tt>:port</tt>: ELC service port, default: DEFAULT_PORT
    # * <tt>:protocol</tt>: 'http' or 'https', default: DEFAULT_PROTOCOL
    # * <tt>:logger</tt>: for log messages, default: RAILS_DEFAULT_LOGGER else STDOUT
    # * <tt>:signature_version</tt>:  The signature version : '0','1' or '2'(default)
    # * <tt>:cache</tt>: true/false(default): list_metrics
    #
    def initialize(aws_access_key_id=nil, aws_secret_access_key=nil, params={})
      init({ :name                => 'ELC',
             :default_host        => ENV['ELC_URL'] ? URI.parse(ENV['ELC_URL']).host   : DEFAULT_HOST,
             :default_port        => ENV['ELC_URL'] ? URI.parse(ENV['ELC_URL']).port   : DEFAULT_PORT,
             :default_service     => ENV['ELC_URL'] ? URI.parse(ENV['ELC_URL']).path   : DEFAULT_PATH,
             :default_protocol    => ENV['ELC_URL'] ? URI.parse(ENV['ELC_URL']).scheme : DEFAULT_PROTOCOL,
             #:proxy_host => PROXY_HOST,
             #:proxy_port => 8888,
             :default_api_version => ENV['ELC_API_VERSION'] || API_VERSION },
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
    #      Describe Cache Clusters
    #-----------------------------------------------------------------


    #
    # Parameters are:
    #   cluster_id Type:String
    #
    # Options are:
    #   :marker
    #   :max_records
    #   :show_cache_node_info
    #
    # All required fields as formal parms., all optional fields are options
    
    def describe_cache_clusters(cluster_id=nil, options={} )
      request_hash = {}
      request_hash['CacheClusterId'] = cluster_id unless cluster_id.nil?
      request_hash['ShowCacheNodeInfo'] = true unless options[:show_node_info] == false
      req = generate_request("DescribeCacheClusters", request_hash )
      request_info( req, DescribeCacheClustersParser.new(:logger => @logger))
    end

    # Parameters are:
    #   cluster_id string 1..20

    def create_cache_cluster(cluster_id, params={})
      request_hash = {}
      # Mandatory
      request_hash['CacheClusterId'] = cluster_id
      request_hash['CacheNodeType'] = params[:node_type] unless params[:node_type].right_blank?
      request_hash['NumCacheNodes'] = params[:num_nodes] unless params[:num_nodes].right_blank?
      request_hash['Engine']        = params[:engine] unless params[:engine].right_blank?
      request_hash.merge!(amazonize_list('CacheSecurityGroupNames.member',  params[:cache_security_group_names]))

      # Optional
	request_hash['EngineVersion'] = params[:engine_version] unless params[:engine_version].right_blank?
  	request_hash['Port']	      = params[:port] unless params[:port].right_blank?
	request_hash['PreferredAvailabilityZone'] = params[:preferred_availability_zone] unless params[:preferred_availability_zone].right_blank?
 	request_hash['AutoMinorVersionUpgrade']   = params[:auto_minor_version_upgrade] unless params[:auto_minor_version_upgrade].nil?
  	request_hash['CacheParameterGroupName']   = params[:cache_parameter_group_name] unless params[:cache_parameter_group_name].right_blank?
  	request_hash['PreferredMaintenanceWindow'] = params[:preferred_maintenance_window] unless params[:preferred_maintenance_window].right_blank?
  	request_hash['NotificationTopicArn']       =  params[:notification_topic_arn] unless params[:notification_topic_arn].right_blank?

      link = generate_request('CreateCacheCluster', request_hash)
      request_info(link, DescribeCacheClustersParser.new(:logger => @logger))
    end

    def describe_cache_security_groups(group_id=nil, options={})
      request_hash = {}
      request_hash['CacheSecurityGroupName'] = group_id unless group_id.nil?
      req = generate_request("DescribeCacheSecurityGroups", request_hash )
      request_info( req, DescribeCacheSecurityGroupsParser.new(:logger => @logger))
    end

    def describe_cache_parameter_groups(parameter_group_name=nil, options={})
	    request_hash = {}
	    request_hash['CacheParameterGroupName'] = parameter_group_name unless parameter_group_name.nil?
	    req = generate_request("DescribeCacheParameterGroups", request_hash)
	    request_info( req, DescribeCacheParameterGroupsParser.new(:logger => @logger))
    end

    def describe_events(params={})
    	    request_hash = {}
	    request_hash['SourceIdentifier']	= params[:source_identifier]	unless params[:source_identifier].right_blank?
	    request_hash['SourceType']		= params[:source_type]		unless params[:source_type].right_blank?
	    request_hash['Duration']		= params[:duration]		unless params[:duration].right_blank?
      	    request_hash['StartTime']		= params[:start_time]		unless params[:start_time].right_blank?
	    request_hash['EndTime']		= params[:end_time]		unless params[:end_time].right_blank?
      	    request_hash['MaxRecords']		= params[:max_records]		unless params[:max_records].right_blank?
      	    link = generate_request('DescribeEvents', request_hash)
      	    request_info(link, DescribeEventsParser.new(:logger => @logger))
    end

    def delete_cache_cluster(cluster_id)
	    request_hash = {}
	    request_hash['CacheClusterId']	= cluster_id
	    link = generate_request('DeleteCacheCluster', request_hash)
	    request_info(link, DescribeCacheClustersParser.new(:logger => @logger))
    end

    def create_cache_security_group(group_name, description)
	    request_hash = {}
	    request_hash['CacheSecurityGroupName']	= group_name
	    request_hash['Description']			= description
      	    req = generate_request("CreateCacheSecurityGroup", request_hash )
      	    request_info( req, DescribeCacheSecurityGroupsParser.new(:logger => @logger))
    end

    def create_cache_parameter_group(group_name, description, family)
	    request_hash = {}
	    request_hash["CacheParameterGroupFamily"]	= family
	    request_hash['CacheParameterGroupName']	= group_name
	    request_hash['Description']			= description
	    req = generate_request("CreateCacheParameterGroup", request_hash)
	    request_info( req, DescribeCacheParameterGroupsParser.new(:logger => @logger))
    end
	    


    def describe_applications(*application_names)

      #flatten turns array elements that are also array into a single array
      #compact removes null
      application_names = application_names.flatten.compact.uniq
      request_hash = amazonize_list('ApplicationNames.member', application_names)
      link = generate_request("DescribeApplications", request_hash)
      request_cache_or_info(:describe_elastic_beanstalk_applications, link,  DescribeApplicationsParser, @@bench, application_names.right_blank?)
    end


    def create_configuration_template(app_name, template_name, params={})
      request_hash = {}
      # Mandatory
      request_hash['ApplicationName'] = app_name
      request_hash['TemplateName']    = template_name
      # Optional
      request_hash['Description']         = params[:description]                      unless params[:description].right_blank?
      request_hash['EnvironmentId']       = params[:environment_id]                   unless params[:environment_id].right_blank?
      request_hash['SolutionStackName']   = params[:solution_stack_name]              unless params[:solution_stack_name].right_blank?
      link = generate_request('CreateConfigurationTemplate', request_hash)
      request_info(link, CreateConfigurationTemplateParser.new(:logger => @logger))
    end

    def create_application_version(app_name, version_label, params={})
      request_hash = {}
      # Mandatory
      request_hash['ApplicationName'] = app_name
      request_hash['VersionLabel']    = version_label
      # Optional
      request_hash['AutoCreateApplication']  = params[:auto_create_application]  unless params[:auto_create_application].right_blank?
      request_hash['Description']            = params[:description]              unless params[:description].right_blank?
      request_hash['SourceBundle.S3Bucket']  = params[:s3_bucket]                unless params[:s3_bucket].right_blank?
      request_hash['SourceBundle.S3Key']     = params[:s3_key]                   unless params[:s3_key].right_blank?
      link = generate_request('CreateApplicationVersion', request_hash)
      request_info(link, DescribeApplicationVersionsParser.new(:logger => @logger))
    end

    def describe_application_versions(app_name)
      request_hash = {}
      # Mandatory
      request_hash['ApplicationName'] = app_name
      link = generate_request('DescribeApplicationVersions', request_hash)
      request_info(link, DescribeApplicationVersionsParser.new(:logger => @logger))
    end


    def describe_app_environments(application_name)
      request_hash = {}
      request_hash['ApplicationName'] = application_name
      link = generate_request('DescribeEnvironments', request_hash)
      request_info(link, DescribeEnvironmentsParser.new(:logger => @logger))
    end

    def describe_environments(*environment_names)
      environment_names = environment_names.flatten.compact
      request_hash = amazonize_list("EnvironmentNames.member", environment_names)
      link = generate_request("DescribeEnvironments", request_hash)
      request_cache_or_info(:describe_environments, link,  DescribeEnvironmentsParser, @@bench, environment_names.right_blank?)
    end

    def describe_environments_by_id(*environment_ids)
      environment_ids = environment_ids.flatten.compact
      request_hash = amazonize_list("EnvironmentIds.member", environment_ids)
      link = generate_request("DescribeEnvironments", request_hash)
      request_cache_or_info(:describe_environments, link,  DescribeEnvironmentsParser, @@bench, environment_ids.right_blank?)
    end



    def describe_environment_resources(params={})
      request_hash = {}
      # One of the following is mandatory
      request_hash['EnvironmentId']   = params[:environment_id]    unless params[:environment_id].right_blank?
      request_hash['EnvironmentName'] = params[:environment_name]  unless params[:environment_name].right_blank?
      link = generate_request('DescribeEnvironmentResources', request_hash)
      request_info(link, DescribeEnvironmentResourcesParser.new(:liogger => @logger))
    end 

    def describe_configuration_options(params={})
      request_hash = {}
      request_hash['ApplicationName'] = params[:application_name] unless params[:application_name].right_blank?
      request_hash['EnvironmentName'] = params[:environment_name] unless params[:environment_name].right_blank?
      request_hash['SolutionStackName'] = params[:solution_stack_name] unless params[:solution_stack_name].right_blank?
      request_hash['TemplateName'] = params[:template_name] unless params[:template_name].right_blank?
      link = generate_request('DescribeConfigurationOptions', request_hash)
      request_info(link, DescribeConfigurationOptionsParser.new(:logger => @logger))
    end

    def list_available_solution_stacks
      link = generate_request('ListAvailableSolutionStacks')
      request_info(link, ListAvailableSolutionStacksParser.new(:logger => @logger))
    end




 




    #-----------------------------------------------------------------
    #      PARSERS: Describe Cache Clusters
    #-----------------------------------------------------------------


    class DescribeCacheClustersParser < RightAWSParser #:nodoc:

      def tagstart(name, attributes)
#debugger
        case full_tag_name
        when 'DescribeCacheClustersResponse/DescribeCacheClustersResult/CacheClusters/CacheCluster'       then @item = {"CacheParameterGroup" => {}, "CacheSecurityGroups" => [], "NotificationConfiguration" => {}, "PendingModifiedValues" => [], "CacheNodes" => []}
        when 'DescribeCacheClustersResponse/DescribeCacheClustersResult/CacheClusters/CacheCluster/CacheSecurityGroups/CacheSecurityGroup'  then @security_group = {}
        when 'DescribeEnvironmentsResponse/DescribeEnvironmentsResult/Environments/member/Resources/LoadBalancer/Listeners/member' then @listener = {}
        when 'CreateEnvironmentResponse/CreateEnvironmentResult'                                                        then @item = {:load_balancer => {}}
        when 'CreateEnvironmentResponse/CreateEnvironmentResult/Resources/LoadBalancer'                                 then @item[:load_balancer] = {:listeners => []}
        when 'CreateEnvironmentResponse/CreateEnvironmentResult/Resources/LoadBalancer/Listeners/member'                then @listener = {}
        when 'TerminateEnvironmentResponse/TerminateEnvironmentResult'                                                  then @item = {:load_balancer => {}}
        when 'TerminateEnvironmentResponse/TerminateEnvironmentResult/Resources/LoadBalancer'                            then @item[:load_balancer] = {:listeners => []}
        when 'TerminateEnvironmentResponse/TerminateEnvironmentResult/Resources/LoadBalancer/Listeners/member'           then @listener = {}
        end
        case name
        when 'CacheCluster' then @item = {"CacheParameterGroup" => {}, "CacheSecurityGroups" => [], "NotificationConfiguration" => {}, "PendingModifiedValues" => [], "CacheNodes" => []}
	when 'CacheSecurityGroup'	then @security_group = {}
	when 'CacheNode'		then @node = {"Endpoint" => {}}	
        end
      end
      def tagend(name)
        case name
        when 'ParameterApplyStatus'     then @item["CacheParameterGroup"][name] = @text
        when 'CacheParameterGroupName'  then @item["CacheParameterGroup"][name] = @text
	when 'TopicStatus'		then @item["NotificationConfiguration"][name] = @text
	when 'TopicArn'			then @item["NotificationConfiguration"][name] = @text
	when 'CacheSecurityGroupName'	then @security_group[name] = @text
	when 'Status'			then @security_group[name] = @text
	when 'ParameterGroupStatus'	then @node[name] = @text
	when 'CacheNodeStatus'		then @node[name] = @text
	when 'CacheNodeCreateTime'	then @node[name] = @text
	when 'CacheNodeId'		then @node[name] = @text
	when 'Port'			then @node["Endpoint"][name] = @text
	when 'Address'			then @node["Endpoint"][name] = @text
        when 'CacheClusterId'           then @item[name] = @text 
	when 'CacheClusterStatus'       then @item[name] = @text
	when 'CacheNodeType'		then @item[name] = @text
	when 'Engine'			then @item[name] = @text
	when 'PreferredAvailabilityZone'then @item[name] = @text
	when 'CacheClusterCreateTime'	then @item[name] = @text
	when 'EngineVersion'		then @item[name] = @text
	when 'AutoMinorVersionUpgrade'	then @item[name] = @text
	when 'PreferredMaintenanceWindow' then @item[name] = @text
	when 'NumCacheNodes'		then @item[name] = @text.to_i
	when 'CacheSecurityGroup'	then @item["CacheSecurityGroups"] << @security_group
	when 'CacheNode'		then @item["CacheNodes"] << @node
        when 'CacheCluster'		then @result << @item
        end
      end
      def reset
          @result = []
      end
    end




    #-----------------------------------------------------------------
    #      PARSERS: Describe Security Groups
    #-----------------------------------------------------------------


    class DescribeCacheSecurityGroupsParser < RightAWSParser #:nodoc:

      def tagstart(name, attributes)
        case name
        when 'CacheSecurityGroup' then @item = { "EC2SecurityGroups" => []}
	when 'EC2SecurityGroup'	  then @ec2_group = {}
        end
      end
      def tagend(name)
        case name
        when 'CacheSecurityGroupName'	then @item[name] = @text
	when 'OwnerId'			then @item[name] = @text
	when 'Description'		then @item[name] = @text
	when 'EC2SecurityGroupName'	then @ec2_group[name] = @text
	when 'EC2SecurityGroupOwnerId'	then @ec2_group[name] = @text
	when 'Status'			then @ec2_group[name] = @text
	when 'EC2SecurityGroup'		then @item["EC2SecurityGroups"] << @ec2_group
        when 'CacheSecurityGroup'	then @result << @item
        end
      end
      def reset
          @result = []
      end
    end


    #-----------------------------------------------------------------
    #      PARSERS: Describe Cache Parameter Groups
    #-----------------------------------------------------------------

    class DescribeCacheParameterGroupsParser < RightAWSParser #:nodoc:

      def tagstart(name, attributes)
        case name
        when 'CacheParameterGroup' then @item = {}
        end
      end
      def tagend(name)
        case name
        when 'CacheParameterGroupName'		then @item[name] = @text
	when 'CacheParameterGroupFamily'	then @item[name] = @text
	when 'Description'			then @item[name] = @text
        when 'CacheParameterGroup'		then @result << @item
        end
      end
      def reset
          @result = []
      end
    end




    #-----------------------------------------------------------------
    #      PARSERS: Describe Events
    #-----------------------------------------------------------------

    class DescribeEventsParser < RightAWSParser #:nodoc:

      def tagstart(name, attributes)
        case name
        when 'Event' then @item = {}
        end
      end
      def tagend(name)
        case name
        when 'Date'		then @item[name] = @text
	when 'Message'		then @item[name] = @text
	when 'SourceIdentifier'	then @item[name] = @text
        when 'SourceType'	then @item[name] = @text
        when 'Event'	then @result << @item
        end
      end
      def reset
          @result = []
      end
    end



    #-----------------------------------------------------------------
    #      PARSERS: Describe Application(s)
    #-----------------------------------------------------------------

    class DescribeApplicationsParser < RightAWSParser #:nodoc:
      def tagstart(name, attributes)
        case name
        when 'Application'  then @item = { :versions => [], :configuration_templates => [] }
        end
        case full_tag_name
        when 'DescribeApplicationsResponse/DescribeApplicationsResult/Applications/member'  then @item = { :versions => [], :configuration_templates => [] }
        end
      end
      def tagend(name)
        case name
        when 'ApplicationName'         then @item[:application_name]          = @text
        when 'Description'             then @item[:description]               = @text
        when 'DateCreated'             then @item[:date_created]              = @text
        when 'DateUpdated'             then @item[:date_updated]              = @text
        when 'Application'             then @result << @item
        end
        case full_tag_name
        when 'DescribeApplicationsResponse/DescribeApplicationsResult/Applications/member/Versions/member' then @item[:versions] << @text
        when 'DescribeApplicationsResponse/DescribeApplicationsResult/Applications/member/ConfigurationTemplates/member' then @item[:configuration_templates] << @text
        when 'DescribeApplicationsResponse/DescribeApplicationsResult/Applications/member' then @result << @item
        when 'CreateApplicationResponse/CreateApplicationResult/Application/Versions/member' then @item[:versions] << @text
        when 'CreateApplicationResponse/CreateApplicationResult/Application/ConfigurationTemplates/member' then @item[:configuration_templates] << @text
        end
      end
      def reset
        @result = []
      end
    end

  end
end
