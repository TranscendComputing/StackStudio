module StackPlace::ElementsRepresenter
  include Roar::Representer::JSON

  # wrap the fields e.g. { "model_name" : { ...fields... }
  #self.representation_wrap = true

  collection :elements, :class=>StackPlace::Element, :extend=>StackPlace::UpdateElementRepresenter
end
