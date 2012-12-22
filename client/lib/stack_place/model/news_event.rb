module StackPlace
  class NewsEvent
    include ActiveModel::Validations

    # basic fields
    attr_accessor :id, :description, :url, :source, :posted
  end
end
