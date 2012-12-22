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
  class GimInterface < RightAwsBase
    include RightAwsBaseInterface

    # Amazon ACW API version being used
    API_VERSION       = "2009-02-01"
    DEFAULT_HOST      = "tpaas.momentumsoftware.com"
    DEFAULT_PATH      = '/GoldenImageQuery'
    DEFAULT_PROTOCOL  = 'http' #''https'
    DEFAULT_PORT      = 8080 #80 #443

    #PROXY_HOST = "http://ipv4.fiddler"
    #PROXY_PORT = 8888

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


    #################################
    ####-------ViewImages------######
    #################################

    def view_images
      req = generate_request("ViewImages")
      request_info( req, ViewImagesParser.new(:logger => @logger))
    end

    #####################################
    ####-------GetMachineSizes------#####
    #####################################

    def get_machine_sizes(cluster)
      request_hash = {}
      request_hash['Cluster'] = cluster
      req = generate_request("GetMachineSizes", request_hash)
      request_info( req, GetMachineSizesParser.new(:logger => @logger))
    end




    #-----------------------------------------------------------------
    #      PARSERS: View Images
    #-----------------------------------------------------------------

    class ViewImagesParser < RightAWSParser #:nodoc:
      def tagstart(name, attributes)
        case name
        when 'Image'  then @item = {}
        end
      end
      def tagend(name)
        case name
        when 'OS'          then @item[:operating_system]          = @text
        when 'Platform'    then @item[:platform] = @text
        when 'Architecture' then @item[:architecture] = @text
        when 'MachineID'             then @item[:machine_id]              = @text
        when 'RamdiskID'             then @item[:ramdisk_id]              = @text
        when 'KernelID'              then @item[:kernel_id]               = @text
        when 'Cloud'                 then @item[:cloud]                   = @text
        when 'Image'       then @result << @item
        end
      end
      def reset
        @result = []
      end
    end




    #-----------------------------------------------------------------
    #      PARSERS: Get Machine Sizes
    #-----------------------------------------------------------------

    class GetMachineSizesParser < RightAWSParser #:nodoc:
      def tagend(name)
        case name
        when 'MachineSize'       then @result << @text
        end
      end
      def reset
        @result = []
      end
    end



  end
end
