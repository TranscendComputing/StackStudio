module StackPlace
  class Price
    include ActiveModel::Validations

    # basic fields
    attr_accessor :id, :name, :type, :effective_price, :effective_date, :properties, :entries, :cloud
  end
end
