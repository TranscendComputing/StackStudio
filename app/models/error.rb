class Error
	BAD_REQUEST = "Bad Request"
    NOT_FOUND = "Not Found"
    TIME_OUT = "Timeout"
    FORBIDDEN = "Forbidden"
    INTERNAL_ERROR = "Internal Server Error"

	attr_accessor :code, :message, :title
	def initialize(error)
		case error
		when RestClient::Forbidden
			json = JSON.parse(error.as_json["response"])["error"]
			@code = json["code"]
			@message = json["message"]
			@title = json["title"]
		when Excon::Errors::BadRequest
            response_body = Nokogiri::XML(error.response.body)
			@message = response_body.css('Message').text
			@code = error.response.status
			@title = response_body.css('Code').text
            if @message.nil?
                response_body = JSON.parse(error.response.body)
                @title = BAD_REQUEST
                @message = response_body["badRequest"]["message"]
                @code = response_body["badRequest"]["code"]
            end 
        when Excon::Errors::InternalServerError        
			response_body = Nokogiri::XML(error.response.body)
            if response_body.css('Message').empty?
                @message = error.response.body
                @title = INTERNAL_ERROR
            else
                @message = response_body.css('Message').text
                @title = response_body.css('Code').text
            end
            @code = error.response.status
        when Excon::Errors::NotFound
            begin
                response_body = Nokogiri::XML(error.response.body)
                @message = response_body.css('Message').text
                @code = error.response.status
                @title = response_body.css('Code').text
            rescue
                @message = "Unable to connect to service endpoint"
                @code = error.response.status
                @title = NOT_FOUND
            end
        when Excon::Errors::Forbidden
            begin
                response_body = JSON.parse(error.response.body)
                @message = response_body["forbidden"]["message"]
                @code = error.response.status
                @title = FORBIDDEN
            rescue JSON::ParserError => json_error
                response_body = Nokogiri::XML(error.response.body)
                @message = response_body.css('Message').text
                @code = error.response.status
                @title = response_body.css('Code').text
            rescue
                @message = "Unable to connect to service endpoint"
                @code = error.response.status
                @title = NOT_FOUND
            end
        when Excon::Errors::Timeout
			@message = "Read Timeout Reached"
			@code = 408
			@title = TIME_OUT
        when AWS::CloudFormation::Errors::ValidationError, AWS::CloudFormation::Errors::AlreadyExistsException, AWS::IAM::Errors::NoSuchEntity
            @message = error.to_s
            @code = error.http_response.status
            @title = error.code
        when Net::HTTPServerException
            @message = JSON.parse(error.response.body)["error"][0]
            @code = error.response.code
            @title = error.response.message || "Server Error"
        when Fog::AWS::IAM::Error
            error = error.message.split(" => ")
            @message = error[1]
            @title = error[0]
            @code = 404         
        when Fog::Compute::AWS::Error
            error = error.message.split(" => ")
            @message = error[1]
            @title = error[0]
            @code = 406
        when Fog::AWS::RDS::NotFound, Fog::AWS::Elasticache::NotFound
            @message = error.to_s
            @title = NOT_FOUND
            @code = 404
        when ArgumentError
            begin
                @message = error.to_s[:message]
                @title = error.to_s[:title]
                @code = 500
            rescue
                raise error
            end
        else
            raise error
		end
		::Rails.logger.error({:message => @message, :title => @title, :code => @code, :error => error})
	end


	def to_json
		{:message => @message, :title => @title, :code => @code}.to_json
	end
end

