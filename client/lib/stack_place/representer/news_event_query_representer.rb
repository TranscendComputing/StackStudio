module StackPlace
  module NewsEventQueryRepresenter
    include Roar::Representer::JSON

    # wrap the fields e.g. { "model_name" : { ...fields... }
    # self.representation_wrap = true

    property :query, :class=>StackPlace::Query, :extend => StackPlace::QueryRepresenter
    collection :news_events, :class=>StackPlace::NewsEvent, :extend => StackPlace::NewsEventRepresenter
  end
end
