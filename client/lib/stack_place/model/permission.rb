class StackPlace::Permission
  include ActiveModel::Validations

  attr_accessor :id, :name, :environment

  validates_presence_of :name
  validates_presence_of :environment
end
