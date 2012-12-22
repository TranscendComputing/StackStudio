class StackPlace::Variant
  include ActiveModel::Validations

  attr_accessor :id, :environment, :rule_type, :rules

  validates_presence_of :environment
  validates_presence_of :rule_type

  def initialize
    @rules = {}
  end
end
