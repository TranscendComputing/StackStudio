module AuthSupport
  # The main accessor to the warden middleware
  def warden
      return request.env['warden']
  end

  # Return session info
  #
  # @param [Symbol] the scope to retrieve session info for
  def session_info(scope=nil)
    scope ? warden.session(scope) : scope
  end

  # Check the current session is authenticated to a given scope
  def authenticated?(scope=nil)
    # NOTE: this calls Warden::Manager.serialize_from_session
    # (see auth.rb), which triggers a web service call
    scope ? warden.authenticated?(scope) : warden.authenticated?
  end
  alias_method :logged_in?, :authenticated?

  # Require authorization for an action
  #
  # @param [String] path to redirect to if user is unauthenticated
  def authorize!(failure_path=nil)
    unless authenticated?
      session[:return_to] = request.env['REQUEST_URI']
      redirect(failure_path ? failure_path : "/account/login")
    end
  end

  # Redirect to the return_to path, captured on a failed authorize!
  # call, or to the default path provided if no return-to is found
  #
  # @param [String] path to redirect to if no return-to value is found
  def return_or_redirect_to(default_path)
    redirect(session[:return_to] || default_path)
  end
end
