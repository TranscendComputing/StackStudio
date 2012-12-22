module StackPlace
  class HttpClient
    include HTTParty

    include StackPlace::Client::TemplateSupport
    include StackPlace::Client::AccountSupport
    include StackPlace::Client::StackSupport
    include StackPlace::Client::CategorySupport
    include StackPlace::Client::OrgSupport

    # internal - may need to move this to the admin client
    include StackPlace::Client::IdentitySupport

    # stack studio - may need to move this to a stack_studio client
    include StackPlace::Client::CloudSupport
    include StackPlace::Client::ProjectSupport
    include StackPlace::Client::ProvisioningSupport
    include StackPlace::Client::ReportSupport
    include StackPlace::Client::NewsEventSupport

    DEFAULT_VERSION = 'v1'

    attr :verbose
    attr_accessor :version

    def self.connection
      @@connection ||= StackPlace::HttpClient.new
      @@connection.verbose!
      @@connection
    end

    def initialize(token=nil, host=StackPlace::Config.host)
      raise "No API endpoint URL set! Either use ENV['STACK_PLACE_SERVICE_ENDPOINT'] environment variable or set StackPlace::Config.host" if host.nil? or host.empty?
      @token = token
      @host = host
      @verbose = false
    end

    #
    # -- Helpers
    #

    def version
      @version || DEFAULT_VERSION
    end

    def verbose!
      @verbose = true
      self.class.debug_output $stderr # HTTParty in debug mode
    end

    def verbose?
      return @verbose
    end

    def post(path, body={ })
      url = "#{@host}#{path}"
      # log "[StackPlace::Client] POST: #{url}\n#{body}" if verbose?
      self.class.post("#{url}", body)
    end

    def put(path, body)
      url = "#{@host}#{path}"
      # log "[StackPlace::Client] PUT: #{url}\n#{body}" if verbose?
      self.class.put("#{url}", body)
    end

    def delete(path)
      url = "#{@host}#{path}"
      # log "[StackPlace::Client] PUT: #{url}\n#{body}" if verbose?
      self.class.delete("#{url}")
    end

    def get(path)
      url = "#{@host}#{path}"
      # log "[StackPlace::Client] GET: #{url}"
      begin
        self.class.get("#{url}")
      rescue Errno::ECONNREFUSED => e
        raise StackPlace::ConnectionFailed.new("#{url}")
      end
    end

    def handle_error_unless(response, expected_code)
      return nil if response.code == expected_code
      log("Status code: #{response.code}")
      if response.code == 400 # BAD REQUEST
        raise StackPlace::BadRequest.new(build_message(response.body))
      elsif response.code == 401 # NOT AUTHORIZED
        raise StackPlace::NotAuthorized.new(build_message(response.body))
      elsif response.code == 404 # NOT FOUND
        raise StackPlace::NotFound.new(build_message(response.body))
      elsif response.code == 500 # ERROR
        raise StackPlace::ServerError.new(build_message(response.body))
      elsif response.code >= 400
        # Catch-all
        raise StackPlace::BaseError.new(build_message(response.body))
      end
    end

    def build_message(body)
      return nil if body.nil? or body.empty?
      message = StackPlace::Error.new
      message.extend(ErrorRepresenter)
      message.from_json(body) unless body.nil? or body.empty?
      message
    end

    def log(message)
      puts "#{message}" if verbose?
    end
  end
end
