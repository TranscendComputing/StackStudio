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
  class AwsEbInterface < RightAwsBase
    include RightAwsBaseInterface

    # Amazon ACW API version being used
    API_VERSION       = "2010-12-01"
    DEFAULT_HOST      = "elasticbeanstalk.us-east-1.amazonaws.com"
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
    #      CreateApplication
    #-----------------------------------------------------------------


    #
    # Parameters are:
    #   application_name string 1..100
    #
    # Options are:
    #   :description string 0..200
    #
    # All required fields as formal parms., all optional fields are options
    #
    def create_application( application_name, options={} )
      request_hash = {'ApplicationName' => application_name }
      request_hash['Description'] = options[:description] if options[:description]
      req = generate_request("CreateApplication", request_hash )
      request_info( req, DescribeApplicationsParser.new(:logger => @logger))
    end

    # Parameters are:
    #   application_name string 1..100
    def delete_application( application_name )
      request_hash = {'ApplicationName' => application_name}
      req = generate_request("DeleteApplication", request_hash )
      request_info( req, DeleteApplicationParser.new(:logger => @logger))
    end

    def describe_applications(*application_names)

      #flatten turns array elements that are also array into a single array
      #compact removes null
      application_names = application_names.flatten.compact.uniq
      request_hash = amazonize_list('ApplicationNames.member', application_names)
      link = generate_request("DescribeApplications", request_hash)
      request_cache_or_info(:describe_elastic_beanstalk_applications, link,  DescribeApplicationsParser, @@bench, application_names.right_blank?)
    end


    def create_environment(app_name, env_name, params={})
      request_hash = {}
      # Mandatory
      request_hash['ApplicationName'] = app_name
      request_hash['EnvironmentName'] = env_name
      # Mandatory to provide one, and only one, of the following
      request_hash['SolutionStackName']          = params[:solution_stack_name]             unless params[:solution_stack_name].right_blank?
      request_hash['TemplateName']               = params[:template_name]                   unless params[:template_name].right_blank?
      # Optional
      request_hash['CNAMEPrefix']                = params[:cname_prefix]                    unless params[:cname_prefix].right_blank?
      request_hash['Description']                = params[:description]                     unless params[:description].right_blank?
      #request_hash['OptionSettings.member.N']   = params[:availability_zone]               unless params[:availability_zone].right_blank?
      #request_hash['OptionsToRemove.member.N']  = params[:multi_az].to_s                   unless params[:multi_az].nil?
      request_hash['VersionLabel']               = params[:version_label]                   unless params[:version_label].right_blank?
      link = generate_request('CreateEnvironment', request_hash)
      request_info(link, DescribeEnvironmentsParser.new(:logger => @logger))
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

=begin
    def describe_load_balancers(*load_balancers)
      load_balancers = load_balancers.flatten.compact
      request_hash = amazonize_list("LoadBalancerNames.member", load_balancers)
      link = generate_request("DescribeLoadBalancers", request_hash)
      request_cache_or_info(:describe_load_balancers, link,  DescribeLoadBalancersParser, @@bench, load_balancers.right_blank?)
    end
=end

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

    def terminate_environment(params={})
      request_hash = {}
      # One of the following is mandatory
      request_hash['EnvironmentId']       = params[:environment_id]      unless params[:environment_id].right_blank?
      request_hash['EnvironmentName']     = params[:environment_name]    unless params[:environment_name].right_blank?
      # Defaults as true
      request_hash['TerminateResources']  = params[:terminate_resources] unless params[:terminate_resources].right_blank? 
      link = generate_request('TerminateEnvironment', request_hash)
      request_info(link, DescribeEnvironmentsParser.new(:logger => @logger))
    end 

    def describe_events(params={})
      request_hash = {}
      request_hash['ApplicationName']  = params[:application_name] unless params[:application_name].right_blank?
      request_hash['EndTime']          = params[:end_time]         unless params[:end_time].right_blank?
      request_hash['EnvironmentId']    = params[:environment_id]   unless params[:environment_id].right_blank?
      request_hash['EnvironmentName']  = params[:environment_name] unless params[:environment_name].right_blank?
      request_hash['NextToken']        = params[:next_token]       unless params[:next_token].right_blank?
      request_hash['RequestId']        = params[:request_id]       unless params[:request_id].right_blank?
      request_hash['Severity']         = params[:severity]         unless params[:severity].right_blank?
      request_hash['StartTime']        = params[:start_time]       unless params[:start_time].right_blank?
      request_hash['TemplateName']     = params[:template_name]    unless params[:template_name].right_blank?
      request_hash['VersionLabel']     = params[:version_label]    unless params[:version_label].right_blank?
      link = generate_request('DescribeEvents', request_hash)
      request_info(link, DescribeEventsParser.new(:logger => @logger))
    end

 
    #-----------------------------------------------------------------
    #      PARSERS: DeleteApplication
    #-----------------------------------------------------------------
    class DeleteApplicationParser < RightAWSParser #:nodoc:
      def tagstart(name, attributes)
        puts "start name"
        puts ap name
        puts "attributes"
        puts ap attributes
      end

      def tagend(name)
        puts "end name"
        puts ap name
        puts ap @text
        @result = @text if name == 'DNSName'
      end
    end

    #-----------------------------------------------------------------
    #      PARSERS: Create Configuration Template
    #-----------------------------------------------------------------


    class CreateConfigurationTemplateParser < RightAWSParser #:nodoc:
      def tagstart(name, attributes)
        case name
        when 'CreateConfigurationTemplateResult' then @item = { :option_settings => []}
        when 'member'                            then @option_setting = {}
        end
      end
      def tagend(name)
        case name
        when 'SolutionStackName'                  then @item[:solution_stack_name]      = @text
        when 'OptionName'                         then @option_setting[:option_name]    = @text
        when 'Value'                              then @option_setting[:value]          = @text
        when 'Namespace'                          then @option_setting[:namespace]      = @text
        when 'Description'                        then @item[:description]              = @text
        when 'ApplicationName'                    then @item[:application_name]         = @text
        when 'DateCreated'                        then @item[:date_created]             = @text
        when 'TemplateName'                       then @item[:template_name]            = @text
        when 'DateUpdated'                        then @item[:date_updated]             = @text
        when 'member'                             then @item[:option_settings]  << @option_setting
        when 'CreateConfigurationTemplateResult'  then @result                  << @item
        end
      end
      def reset
          @result = []
      end
    end


    #-----------------------------------------------------------------
    #      PARSERS: Create Application Version
    #-----------------------------------------------------------------


    class DescribeApplicationVersionsParser < RightAWSParser #:nodoc:
      def tagstart(name, attributes)
        case name
        when 'ApplicationVersion' then @item = {:source_bundle => {}}
        end
        case full_tag_name
        when 'DescribeApplicationVersionsResponse/DescribeApplicationVersionsResult/ApplicationVersions/member' then @item = {:source_bundle => {}}
        when 'DescribeApplicationVersionsResponse/DescribeApplicationVersionsResult/Applications/member' then @item = {:source_bundle => {}}
        end
      end
      def tagend(name)
        case name
        when 'S3Bucket'                  then @item[:source_bundle][:s3_bucket]      = @text
        when 'S3Key'                     then @item[:source_bundle][:s3_key]         = @text
        when 'VersionLabel'              then @item[:version_label]                  = @text
        when 'Description'               then @item[:description]                    = @text
        when 'ApplicationName'           then @item[:application_name]               = @text
        when 'DateCreated'               then @item[:date_created]                   = @text
        when 'DateUpdated'               then @item[:date_updated]                   = @text
        when 'ApplicationVersion'        then @result << @item
        end
        case full_tag_name
        when 'DescribeApplicationVersionsResponse/DescribeApplicationVersionsResult/ApplicationVersions/member' then @result << @item
        when 'DescribeApplicationVersionsResponse/DescribeApplicationVersionsResult/Applications/member' then @result << @item
        end
      end
      def reset
          @result = []
      end
    end



    #-----------------------------------------------------------------
    #      PARSERS: Create Environment
    #-----------------------------------------------------------------


    class DescribeConfigurationOptionsParser < RightAWSParser #:nodoc:
	    def tagstart(name, attributes)
		    case full_tag_name
		    when 'DescribeConfigurationOptionsResponse/DescribeConfigurationOptionsResult' then @item = {:options => []}
		    when 'DescribeConfigurationOptionsResponse/DescribeConfigurationOptionsResult/Options/member' then @option = {:regex => {}, :value_options => []}
		    when 'DescribeConfigurationOptionsResponse/DescribeConfigurationOptionsResult/Options/member/ValueOptions' then @value_options = []
		    end
		    case name
		    when 'Options' then @options = []
		    when 'Regex' then @regex = {}
		    end
	    end
	    def tagend(name)
		    case name
		    when 'Options' then @item[:options] << @options
		    when 'UserDefined'  then @option[:user_defined] = @text
		    when 'ChangeSeverity' then @option[:change_severity] = @text
		    when 'DefaultValue' then @option[:default_value] = @text
		    when 'MaxLength' then @option[:max_length] = @text
		    when 'MaxValue' then @option[:max_value] = @text
		    when 'MinValue' then @option[:min_value] = @text
		    when 'Name'     then @option[:name] = @text
		    when 'Namespace' then @option[:namespace] = @text
		    when 'Label' then @regex[:label] = @text
		    when 'Pattern' then @regex[:pattern] = @text
		    when 'Regex' then @option[:regex] = @regex
		    when 'ValueOptions' then @option[:value_options] = @value_options
		    when 'ValueType' then @option[:value_type] = @text
		    when 'SolutionStackName' then @item[:solution_stack_name] = @text
		    end
		    case full_tag_name
		    when 'DescribeConfigurationOptionsResponse/DescribeConfigurationOptionsResult' then @result << @item
		    when 'DescribeConfigurationOptionsResponse/DescribeConfigurationOptionsResult/Options/member' then @options << @option
		    when 'DescribeConfigurationOptionsResponse/DescribeConfigurationOptionsResult/Options/member/ValueOptions/member' then @value_options << @text
		    end
	    end
	    def reset
		    @result = []
	    end
    end




    #-----------------------------------------------------------------
    #      PARSERS: Describe Environments
    #-----------------------------------------------------------------


    class DescribeEnvironmentsParser < RightAWSParser #:nodoc:

      def tagstart(name, attributes)
#debugger
        case full_tag_name
        when 'DescribeEnvironmentsResponse/DescribeEnvironmentsResult/Environments/member'                                         then @item = {:load_balancer => {}}
        when 'DescribeEnvironmentsResponse/DescribeEnvironmentsResult/Environments/member/Resources/LoadBalancer'                  then @item[:load_balancer] = {:listeners => []}
        when 'DescribeEnvironmentsResponse/DescribeEnvironmentsResult/Environments/member/Resources/LoadBalancer/Listeners/member' then @listener = {}
        when 'CreateEnvironmentResponse/CreateEnvironmentResult'                                                        then @item = {:load_balancer => {}}
        when 'CreateEnvironmentResponse/CreateEnvironmentResult/Resources/LoadBalancer'                                 then @item[:load_balancer] = {:listeners => []}
        when 'CreateEnvironmentResponse/CreateEnvironmentResult/Resources/LoadBalancer/Listeners/member'                then @listener = {}
        when 'TerminateEnvironmentResponse/TerminateEnvironmentResult'                                                  then @item = {:load_balancer => {}}
        when 'TerminateEnvironmentResponse/TerminateEnvironmentResult/Resources/LoadBalancer'                            then @item[:load_balancer] = {:listeners => []}
        when 'TerminateEnvironmentResponse/TerminateEnvironmentResult/Resources/LoadBalancer/Listeners/member'           then @listener = {}
        end
        case name
        when 'Environments' then @item = {}
        end
      end
      def tagend(name)
        case name
        when 'LoadBalancerName'    then @item[:load_balancer][:load_balancer_name]   = @text
        when 'Domain'              then @item[:load_balancer][:domain]               = @text 
        when 'Port'                then @listener[:port]      = @text.to_i
        when 'Protocol'            then @listener[:protocol]  = @text       
        when 'VersionLabel'        then @item[:version_label]         = @text
        when 'Status'              then @item[:status]                = @text
        when 'DateCreated'         then @item[:date_created]          = @text
        when 'ApplicationName'     then @item[:application_name]      = @text
        when 'EndpointURL'         then @item[:endpoint_url]          = @text
        when 'CNAME'               then @item[:cname]                 = @text
        when 'Health'              then @item[:health]                = @text
        when 'EnvironmentId'       then @item[:environment_id]        = @text
        when 'DateUpdated'         then @item[:date_updated]          = @text
        when 'SolutionStackName'   then @item[:solution_stack_name]   = @text
        when 'Description'         then @item[:description]           = @text
        when 'EnvironmentName'     then @item[:environment_name]      = @text
        when 'TemplateName'        then @item[:template_name]         = @text
        #when 'Environments'        then @result << @item
        end
        case full_tag_name
        when 'DescribeEnvironmentsResponse/DescribeEnvironmentsResult/Environments/member/Resources/LoadBalancer/Listeners/member' then @item[:load_balancer][:listeners] << @listener
        when 'DescribeEnvironmentsResponse/DescribeEnvironmentsResult/Environments/member'               then @result << @item
        when 'CreateEnvironmentResponse/CreateEnvironmentResult/Resources/LoadBalancer/Listeners/member'                           then @item[:load_balancer][:listeners] << @listener
        when 'CreateEnvironmentResponse/CreateEnvironmentResult'                                         then @result << @item
        when 'TerminateEnvironmentResponse/TerminateEnvironmentResult/Resources/LoadBalancer/Listeners/member'                     then @item[:load_balancer][:listeners] << @listener
        when 'TerminateEnvironmentResponse/TerminateEnvironmentResult'                                   then @result << @item
        end
      end
      def reset
          @result = []
      end
    end




    #-----------------------------------------------------------------
    #      PARSERS: List Available Solution Stacks
    #-----------------------------------------------------------------


    class ListAvailableSolutionStacksParser < RightAWSParser #:nodoc:
      def tagend(name)
        case full_tag_name
        when 'ListAvailableSolutionStacksResponse/ListAvailableSolutionStacksResult/SolutionStacks/member' then @result << @text
        when 'ListAvailableSolutionStacksResponse/ListAvailableSolutionStacksResult/ListAvailableSolutionStacks/member' then @result << @text
        end 
      end
      def reset
          @result = []
      end
    end




    #-----------------------------------------------------------------
    #      PARSERS: Describe Environment Resources
    #-----------------------------------------------------------------


    class DescribeEnvironmentResourcesParser < RightAWSParser #:nodoc:

      def tagstart(name, attributes)
        case name
        when 'EnvironmentResources' then @item = { :auto_scaling_groups => [], :instances => [], :launch_configurations => [], :load_balancers => [], :triggers => []}
        end
      end
      def tagend(name)
        case name
        when 'EnvironmentName'                     then @item[:environment_name]      = @text
        when 'EnvironmentResources'                then @result << @item
        end
        case full_tag_name
        when %r{LoadBalancers/member/Name}         then @item[:load_balancers]        << @text
        when %r{AutoScalingGroups/member/Name}     then @item[:auto_scaling_groups]   << @text
        when %r{Instances/member/Id}               then @item[:instances]             << @text
        when %r{LaunchConfigurations/member/Name}  then @item[:launch_configurations] << @text
        when %r{Triggers/member/Name}              then @item[:triggers]              << @text
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
        when 'member'  then @item = {}
        end
      end
      def tagend(name)
        case name
        when 'ApplicationName'         then @item[:application_name]          = @text  unless @item.nil?
        when 'EnvironmentName'         then @item[:environment_name]          = @text  unless @item.nil?
        when 'Message'                 then @item[:message]                   = @text  unless @item.nil?
        when 'EventDate'               then @item[:event_date]                = @text  unless @item.nil?
        when 'VersionLabel'            then @item[:version_label]             = @text  unless @item.nil?
        when 'RequestId'               then @item[:request_id]                = @text  unless @item.nil?
        when 'Severity'                then @item[:severity]                  = @text  unless @item.nil?
        when 'member'                  then @result << @item  unless @item.nil?
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
