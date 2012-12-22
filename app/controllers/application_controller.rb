class ApplicationController < ActionController::Base
  #protect_from_forgery
  helper :all # include all helpers, all the time

  include AuthenticatedSystem
  include CloudConstants
  include ResourceTypes
  include ServiceTypes

  def audit_log
	  new_audit_log = StackPlace::AuditLog.new
      new_audit_log.physical_resource_id = @physical_resource_id
      new_audit_log.logical_resource_id = @logical_resource_id
	  new_audit_log.service_type = params[:service]
	  new_audit_log.action = params[:action]
	  new_audit_log.parameters = params.except(:service, :controller, :action, :cloud_account_id, :user_id, :physical_id)
	  new_audit_log.response_status_code = @status_code || 200
	  unless @response.nil?
			  new_audit_log.errors = JSON.parse(@response.to_json)
	  end
	  new_audit_log.date = Time.now.to_s
	  $client.create_audit_log(params[:user_id], params[:cloud_account_id], new_audit_log)
  #rescue => error
  #      ::Rails.logger.error("Unable to process audit log")
  end
end

