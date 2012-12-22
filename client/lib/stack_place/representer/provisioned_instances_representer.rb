module StackPlace::ProvisionedInstancesRepresenter
  include Roar::Representer::JSON

  # wrap the fields e.g. { "model_name" : { ...fields... }
  #self.representation_wrap = true

  collection :instances, :class=>StackPlace::ProvisionedInstance, :extend=>StackPlace::UpdateProvisionedInstanceRepresenter
end
