module StackPlace
  module CloudQueryRepresenter
    include Roar::Representer::JSON

    # wrap the fields e.g. { "model_name" : { ...fields... }
    # self.representation_wrap = true

    property :query, :class=>StackPlace::Query, :extend => StackPlace::QueryRepresenter
    collection :clouds, :class=>StackPlace::Cloud, :extend => StackPlace::CloudRepresenter
  end
end
