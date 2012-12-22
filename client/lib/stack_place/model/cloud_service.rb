module StackPlace
  class CloudService
    include ActiveModel::Validations

    # basic fields
    attr_accessor :id, :service_type, :path, :protocol, :host, :port, :enabled, :cloud
  end
end
