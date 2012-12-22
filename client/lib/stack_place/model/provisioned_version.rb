class StackPlace::ProvisionedVersion
  include ActiveModel::Validations

  attr_accessor :id, :stack_name, :version, :environment, :provisioned_instances

  validates_presence_of :stack_name
  validates_presence_of :environment
  validates_presence_of :version

  def initialize
    @provisioned_instances = []
  end
end
