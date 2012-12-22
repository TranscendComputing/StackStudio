module StackPlace
  class ConnectionFailed < StandardError; end;

  class BaseError < StandardError
    attr :error_response

    def initialize(error_response=nil)
      @error_response = error_response || StackPlace::Error.new
      super(@error_response.message)
    end

    def merge_validation_errors(active_model)
      self.error_response.validation_errors.each_pair do |name, msgs|
        msgs.each do |msg|
          active_model.errors[name] = msg
        end
      end unless self.error_response.nil? or self.error_response.validation_errors.nil?
    end
  end

  class BadRequest < BaseError; end;
  class NotAuthorized < BaseError; end;
  class NotFound < BaseError; end;
  class ServerError < BaseError; end;
end

