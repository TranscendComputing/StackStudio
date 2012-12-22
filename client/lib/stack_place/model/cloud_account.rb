class StackPlace::CloudAccount
  attr_accessor :id, :cloud_id, :cloud_name, :cloud_provider, :name, :description, :access_key, :secret_key, :audit_logs, :cloud_resources, :cloud_attributes, :stack_preferences, :topstack_id, :topstack_enabled, :topstack_configured

  def initialize
    @audit_logs = []
    @cloud_resources = []
  end
end
