module StackPlace
  module CloudRepresenter
    include Roar::Representer::JSON

    # wrap the fields e.g. { "model_name" : { ...fields... }
    self.representation_wrap = true

    property :id
    property :name
    property :cloud_provider
    property :permalink
    property :url
    property :protocol
    property :host
    property :port
    property :public
    property :topstack_enabled
    property :topstack_id
    collection :cloud_services, :class=>StackPlace::CloudService, :extend => StackPlace::CloudServiceRepresenter
    collection :cloud_mappings, :class=>StackPlace::CloudMapping, :extend => StackPlace::CloudMappingRepresenter
	collection :prices, :class=>StackPlace::Price, :extend => StackPlace::PriceRepresenter
  end
end
