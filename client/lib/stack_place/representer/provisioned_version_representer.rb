module StackPlace::ProvisionedVersionRepresenter
  include Roar::Representer::JSON

  # wrap the fields e.g. { "model_name" : { ...fields... }
  self.representation_wrap = true

  property :id
  property :stack_name
  property :version
  property :environment
  collection :provisioned_instances, :class=>StackPlace::ProvisionedInstance, :extend=>StackPlace::ProvisionedInstanceRepresenter
end
