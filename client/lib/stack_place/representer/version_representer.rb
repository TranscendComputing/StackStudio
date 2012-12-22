module StackPlace::VersionRepresenter
  include Roar::Representer::JSON

  # wrap the fields e.g. { "model_name" : { ...fields... }
  self.representation_wrap = true

  property :number
  property :description
  collection :environments, :class=>StackPlace::Environment, :extend=>StackPlace::EnvironmentRepresenter
end
