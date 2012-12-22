module StackPlace::ProjectQueryRepresenter
  include Roar::Representer::JSON

  # wrap the fields e.g. { "model_name" : { ...fields... }
  # self.representation_wrap = true

  property :query, :class=>StackPlace::Query, :extend => StackPlace::QueryRepresenter
  collection :projects, :class=>StackPlace::Project, :extend => StackPlace::ProjectRepresenter
end
