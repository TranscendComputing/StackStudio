class StackPlace::ProvisionedInstance
  include ActiveModel::Validations

  attr_accessor :id, :instance_type, :resource_id, :instance_id, :properties

  validates_presence_of :instance_type
  validates_presence_of :resource_id
  validates_presence_of :instance_id

  def initialize
    @properties = { }
  end
end
