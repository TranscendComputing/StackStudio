module StackPlace
  class Cloud
    include ActiveModel::Validations

    # basic fields
    attr_accessor :id, :permalink, :name, :cloud_provider, :url, :protocol, :host, :port, :public, :topstack_enabled, :topstack_id, :cloud_services, :cloud_mappings, :prices

    def initialize
      @cloud_services = []
      @cloud_mappings = []
	  @prices = []
    end
  end
end
