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
  class AwsCfnInterface < RightAwsBase
    include RightAwsBaseInterface

    # Amazon ACW API version being used
    API_VERSION       = "2010-05-15"
    DEFAULT_HOST      = "cloudformation.us-east-1.amazonaws.com"
    DEFAULT_PATH      = '/'
    DEFAULT_PROTOCOL  = 'https'
    DEFAULT_PORT      = 443


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
    #      ValidateTemplate
    #-----------------------------------------------------------------

    def validate_template( param = {} )
      request_hash = {}
      request_hash['TemplateBody'] = param[:template_body] unless param[:template_body].right_blank?
      request_hash['TemplateURL']  = param[:template_url] unless param[:template_url].right_blank?
      req = generate_request("ValidateTemplate", request_hash )
      request_info( req, ValidateTemplateParser.new(:logger => @logger))
    end



    #-----------------------------------------------------------------
    #      CreateStack
    #-----------------------------------------------------------------
    # Create new CF stack
    # Returns a new CF stack id
    #
    # Parameters must be sent as array of hashes: [{:parameter_key => 'myParamName', :parameter_value => 'myParamValue}]
    #
    #  cfn.create_stack( 'testStack', 
    #                     :template_url => 'https://s3.amazonaws.com/cloudformation-templates-us-east-1/SampleTemp.template',
    #                     :parameters => [{:parameter_key => 'WebServerPort', :parameter_value => '8888'},
    #                                     {:parameter_key => 'MySSHKey', :parameter_value => 'default-key'}])
    #                   #=> "arn:aws:cloudformation:us-east-1:925393457112:stack/testStack/9d95ads0-2cbe-11e1-43d5-5121c542b23e"

    def create_stack( stack_name, params={})
      request_hash = {}
      request_hash = amazonize_list('Capabilities.member', params[:capabilities]) unless params[:capabilities].right_blank?
      request_hash = amazonize_list('NotificationARNs.member', params[:notification_arns]) unless params[:notification_arns].right_blank?
      request_hash = merge_parameters_into_request_hash(request_hash, params[:parameters]) unless params[:parameters].right_blank?
      request_hash['StackName'] = stack_name
      request_hash['DisableRollback'] = params[:disable_rollback] unless params[:disable_rollback].right_blank?
      request_hash['TemplateBody'] = params[:template_body] unless params[:template_body].right_blank?
      request_hash['TemplateURL']  = params[:template_url]  unless params[:template_url].right_blank?
      request_hash['TimeoutInMinutes'] = params[:timeout_in_minutes] unless params[:timeout_in_minutes].right_blank?
      req = generate_request("CreateStack", request_hash )
      request_info( req, CreateStackParser.new(:logger => @logger))
    end

    #-----------------------------------------------------------------
    #      UpdateStack
    #-----------------------------------------------------------------

    def update_stack( stack_name, params={})
      request_hash = {}
      request_hash['StackName'] = stack_name
      request_hash['TemplateBody'] = params[:template_body] unless params[:template_body].right_blank?
      request_hash['TemplateURL']  = params[:template_url]  unless params[:template_url].right_blank?
      request_hash = amazonize_list('Capabilities.member', params[:capabilities]) unless params[:capabilities].right_blank?
      request_hash = merge_parameters_into_request_hash(request_hash, params[:parameters]) unless params[:parameters].right_blank?
      req = generate_request("UpdateStack", request_hash )
      request_info( req, CreateStackParser.new(:logger => @logger))
    end



    #-----------------------------------------------------------------
    #      ListStacks
    #-----------------------------------------------------------------

    def list_stacks(next_token=nil, *stack_status_filters)
      request_hash = {}
      stack_status_filters = stack_status_filters.flatten.compact
      request_hash['NextToken'] = next_token
      request_hash['StackStatusFilters.member']  = amazonize_list("StackStatusFilters.member", stack_status_filters)
      req = generate_request("ListStacks", request_hash )
      request_info( req, ListStacksParser.new(:logger => @logger))
    end





    #-----------------------------------------------------------------
    #      GetTemplate
    #-----------------------------------------------------------------

    def get_template(stack_name)
      request_hash = {}
      request_hash['StackName'] = stack_name
      req = generate_request("GetTemplate", request_hash )
      request_info( req, GetTemplateParser.new(:logger => @logger))
    end





    #-----------------------------------------------------------------
    #      DescribeStackEvents
    #-----------------------------------------------------------------

    def describe_stack_events(stack_name, next_token=nil)
      request_hash = {}
      request_hash['StackName'] = stack_name
      request_hash['NextToken'] = next_token  unless next_token.nil?
      req = generate_request("DescribeStackEvents", request_hash )
      request_info( req, DescribeStackEventsParser.new(:logger => @logger))
    end


    #-----------------------------------------------------------------
    #      DescrdibeStackResources
    #-----------------------------------------------------------------
 
    def describe_stack_resources(params={})
      request_hash = {}
      request_hash['StackName'] = params[:stack_name] unless params[:stack_name].right_blank?
      request_hash['PhysicalResourceId'] = params[:physical_resource_id] unless params[:physical_resource_id].right_blank?
      request_hash['LogicalResourceId']  = params[:logical_resource_id]  unless params[:logical_resource_id].right_blank?
      req = generate_request("DescribeStackResources", request_hash)
      request_info( req, DescribeStackResourcesParser.new(:logger => @logger) )
    end

    

    #-----------------------------------------------------------------
    #      DescribeStacks
    #-----------------------------------------------------------------

    def describe_stacks(stack_name=nil)
      request_hash = {}
      request_hash['StackName'] = stack_name unless stack_name.right_blank?
      req = generate_request("DescribeStacks", request_hash)
      request_info( req, DescribeStacksParser.new(:logger => @logger) )
    end



    #-----------------------------------------------------------------
    #      EstimateTemplateCost
    #-----------------------------------------------------------------

    def estimate_template_cost(params={})
      request_hash = {}
      request_hash['TemplateBody'] = params[:template_body] unless params[:template_body].right_blank?
      request_hash['TemplateURL']  = params[:template_url]  unless params[:template_url].right_blank?
      request_hash = merge_parameters_into_request_hash(request_hash, params[:parameters]) unless params[:parameters].right_blank?
      req = generate_request("EstimateTemplateCost", request_hash)
      request_info( req, EstimateTemplateCostParser.new(:logger => @logger) )
    end




    #-----------------------------------------------------------------
    #      DeleteStack
    #-----------------------------------------------------------------

    def delete_stack(stack_name)
      request_hash = {}
      request_hash['StackName'] = stack_name
      req = generate_request("DeleteStack", request_hash)
      request_info( req, DeleteStackParser.new(:logger => @logger) )
    end

    #-----------------------------------------------------------------
    #       Helpers
    #-----------------------------------------------------------------

    def merge_parameters_into_request_hash(request_hash, parameters) # :nodoc:
      parameters = [parameters] unless parameters.is_a?(Array)
      request_hash.merge(amazonize_list( ['Parameters.member.?.ParameterKey',
                                          'Parameters.member.?.ParameterValue'],
                                          parameters.map{ |i|
                                            [ i[:parameter_key],
                                              i[:parameter_value]]
                                          }, 
                                          :default => :skip_nils
                                       )
                        )
    end

    #-----------------------------------------------------------------
    #      PARSERS: Validate Template
    #-----------------------------------------------------------------


    class ValidateTemplateParser < RightAWSParser #:nodoc:
      def tagstart(name, attributes)
        case name
        when 'ValidateTemplateResult' then @item = {:parameters => []}
        end
        case full_tag_name
        when 'ValidateTemplateResponse/ValidateTemplateResult/Parameters/member' then @parameter = {}
        end
      end
      def tagend(name)
        case name
        when 'ParameterKey'                                                                     then @parameter[:parameter_key] = @text
        when 'NoEcho'                                                                           then @parameter[:no_echo]       = @text
        when 'DefaultValue'                                                                     then @parameter[:default_value] = @text
        when 'ValidateTemplateResult'                                                      then @result              << @item
        end
        case full_tag_name
        when 'ValidateTemplateResponse/ValidateTemplateResult/Description'                      then @item[:description]        = @text
        when 'ValidateTemplateResponse/ValidateTemplateResult/Parameters/member/Description'    then @parameter[:description]   = @text
        when 'ValidateTemplateResponse/ValidateTemplateResult/Parameters/member'           then @item[:parameters]   << @parameter
        end
      end
      def reset
          @result = []
      end
    end


    #-----------------------------------------------------------------
    #      PARSERS: Create Stack
    #-----------------------------------------------------------------


    class CreateStackParser < RightAWSParser #:nodoc:
      def tagend(name)
        case name
        when 'StackId'  then @result << @text
        end
      end
      def reset
          @result = []
      end
    end






    #-----------------------------------------------------------------
    #      PARSERS: List Stacks
    #-----------------------------------------------------------------


    class ListStacksParser < RightAWSParser #:nodoc:
      def tagstart(name, attributes)
        case name
        when 'member' then @item = {}
        end
      end
      def tagend(name)
        case name
        when 'TemplateDescription'             then @item[:description]   = @text
        when 'StackId'                         then @item[:stack_id]      = @text
        when 'StackName'                       then @item[:stack_name]    = @text
        when 'StackStatus'                     then @item[:stack_status]  = @text
        when 'CreationTime'                    then @item[:creation_time] = @text
        when 'DeletionTime'                    then @item[:deletion_time] = @text
        when 'member'                          then @result << @item
        end
      end
      def reset
          @result = []
      end
    end



    #-----------------------------------------------------------------
    #      PARSERS: Get Template
    #-----------------------------------------------------------------


    class GetTemplateParser < RightAWSParser #:nodoc:
=begin
      def tagstart(name, attributes)
        case name
        when 'TemplateBody' then @item = {}
        end
      end
=end
      def tagend(name)
        case name
        when 'TemplateBody' then @result << @text
        end
      end
      def reset
          @result = []
      end
    end


    #-----------------------------------------------------------------
    #      PARSERS: DeleteStack
    #-----------------------------------------------------------------


    class DeleteStackParser < RightAWSParser #:nodoc:
      def tagend(name)
        case name
        when 'DeleteStackResult' then @result << true
        end
      end
      def reset
          @result = []
      end
    end



    #-----------------------------------------------------------------
    #      PARSERS: Describe Stack Events
    #-----------------------------------------------------------------


    class DescribeStackEventsParser < RightAWSParser #:nodoc:
      def tagstart(name, attributes)
        case name
        when 'member' then @item = {}
        end
      end
      def tagend(name)
        case name
        when 'EventId'                         then @item[:event_id]                = @text
        when 'StackId'                         then @item[:stack_id]                = @text
        when 'StackName'                       then @item[:stack_name]              = @text
        when 'ResourceStatus'                  then @item[:resource_status]         = @text
        when 'ResourceProperties'              then @item[:resource_properties]     = @text
        when 'Timestamp'                       then @item[:time]                    = @text
        when 'LogicalResourceId'               then @item[:logical_resource_id]     = @text
        when 'PhysicalResourceId'              then @item[:physical_resource_id]    = @text
        when 'ResourceType'                    then @item[:resource_type]           = @text
        when 'ResourceStatusReason'            then @item[:resource_status_reason]  = @text
        when 'member'                          then @result << @item
        end
      end
      def reset
          @result = []
      end
    end



    #-----------------------------------------------------------------
    #      PARSERS: Estimate Template Cost
    #-----------------------------------------------------------------


    class EstimateTemplateCostParser < RightAWSParser #:nodoc:
      def tagend(name)
        case name
        when 'Url' then @result << @text
        end
      end
      def reset
          @result = []
      end

    end





    #-----------------------------------------------------------------
    #      PARSERS: Describe Stack Resources
    #-----------------------------------------------------------------


    class DescribeStackResourcesParser < RightAWSParser #:nodoc:
      def tagstart(name, attributes)
        case name
        when 'member' then @item = {}
        end
      end
      def tagend(name)
        case name
        when 'StackName'                       then @item[:stack_name]              = @text
        when 'StackId'                         then @item[:stack_id]                = @text
        when 'ResourceStatus'                  then @item[:resource_status]         = @text
        when 'LogicalResourceId'               then @item[:logical_resource_id]     = @text
        when 'PhysicalResourceId'              then @item[:physical_resource_id]    = @text
        when 'ResourceType'                    then @item[:resource_type]           = @text
        when 'Timestamp'                       then @item[:timestamp]               = @text
        when 'member'                          then @result << @item
        end
      end
      def reset
          @result = []
      end
    end


    #-----------------------------------------------------------------
    #      PARSERS: Describe Stacks
    #-----------------------------------------------------------------


    class DescribeStacksParser < RightAWSParser #:nodoc:
      def tagstart(name, attributes)
        case full_tag_name
        when 'DescribeStacksResponse/DescribeStacksResult/Stacks/member' then @item = { :outputs => [], :parameters => [], :capabilities => {} }
        when 'DescribeStacksResponse/DescribeStacksResult/Stacks/member/Outputs/member' then @output = {}
        when 'DescribeStacksResponse/DescribeStacksResult/Stacks/member/Parameters/member' then @parameter = {}
        when 'DescribeStacksResult/member'        then @item = { :outputs => {} }
        end
      end
      def tagend(name)
        case name
        when 'StackName'                                        then @item[:stack_name]              = @text
        when 'StackId'                                          then @item[:stack_id]                = @text
        when 'StackStatus'                                      then @item[:stack_status]            = @text
        when 'StatusResponse'                                   then @item[:stack_status_response]   = @text
        when 'DisableRollback'                                  then @item[:disable_rollback]        = @text
        when 'CreationTime'                                     then @item[:creation_time]           = @text
        when 'TimeoutInMinutes'                                 then @item[:timeout_in_minutes]      = @text
        when 'OutputKey'                                        then @output[:output_key]            = @text
        when 'OutputValue'                                      then @output[:output_value]          = @text
        when 'ParameterValue'                                   then @parameter[:parameter_value]    = @text
        when 'ParameterKey'                                     then @parameter[:parameter_key]      = @text
        end
        case full_tag_name
        #when 'DescribeStacksResponse/DescribeStacksResult/Stacks/member/Outputs/member/OutputKey'   then @output[:output_key]    = @text
        #when 'DescribeStacksResponse/DescribeStacksResult/Stacks/member/Outputs/member/OutputValue' then @output[:output_value]  = @text
        when 'DescribeStacksResponse/DescribeStacksResult/Stacks/member/Outputs/member/Description' then @output[:description]   = @text
        #when 'DescribeStacksResponse/DescribeStacksResult/Stacks/member/Parameters/member/ParameterValue' then @parameter[:parameter_value] = @text
        #when 'DescribeStacksResponse/DescribeStacksResult/Stacks/member/Parameters/member/ParameterKey'   then @parameter[:parameter_key]   = @text
        when 'DescribeStacksResponse/DescribeStacksResult/Stacks/member/Outputs/member'             then @item[:outputs] << @output
        when 'DescribeStacksResponse/DescribeStacksResult/Stacks/member/Parameters/member'         then @item[:parameters] << @parameter
        when 'DescribeStacksResponse/DescribeStacksResult/Stacks/member'                           then @result << @item
        when 'DescribeStacksResult/member'                                  then @result << @item
        end
      end
      def reset
          @result = []
      end
    end







  end

end
