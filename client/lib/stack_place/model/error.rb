module StackPlace
  class Error
    attr_accessor :message
    attr_accessor :validation_errors

    def initialize(message=nil)
      @message = message
    end
  end
end
