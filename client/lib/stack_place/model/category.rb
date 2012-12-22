module StackPlace
  class Category
    include ActiveModel::Validations

    attr_accessor :id, :name, :permalink, :description
    validates_presence_of :name
  end
end
