class StackPlace::AuditLog
  attr_accessor :logical_resource_id, :physical_resource_id, :service_type, :action, :parameters, :response_status_code, :errors, :date

  def initialize
     @parameters = {}
     @errors = {}
  end
end
