module StackPlace::ProjectVersionRepresenter
  include Roar::Representer::JSON

  # wrap the fields e.g. { "model_name" : { ...fields... }
  self.representation_wrap = true

  property :id
  property :version
  property :status
  collection :elements, :class=>StackPlace::Element, :extend=>StackPlace::ElementRepresenter
  collection :nodes, :class=>StackPlace::Node, :extend=>StackPlace::NodeRepresenter
  collection :variants, :class=>StackPlace::Variant, :extend=>StackPlace::VariantRepresenter
  collection :embedded_projects, :class=>StackPlace::EmbeddedProject, :extend=>StackPlace::EmbeddedProjectRepresenter
  collection :environments, :class=>StackPlace::Environment, :extend=>StackPlace::EnvironmentRepresenter
end
