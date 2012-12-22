module StackPlace
  class Org
    attr_accessor :id, :name, :accounts, :subscriptions, :cloud_mappings

    def initialize
	  @accounts = Array.new
      @subscriptions = Array.new
      @cloud_mappings = Array.new
    end
  end
end
