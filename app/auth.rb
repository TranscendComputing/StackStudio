Warden::Manager.serialize_into_session{|account| account.id }
Warden::Manager.serialize_from_session do |id|
  # Note: this is called every time we check with warden using #authenticated?
  client = StackPlace::HttpClient.connection
  client.verbose!
  client.identity_details(id)
end

Warden::Manager.before_failure do |env,opts|
  # Sinatra is very sensitive to the request method
  # since authentication could fail on any type of method, we need
  # to set it for the failure app so it is routed to the correct block
  env['REQUEST_METHOD'] = "POST"
end

Warden::Strategies.add(:password) do
  def valid?
    params["login"] || params["password"]
  end

  def authenticate!
    begin
      client = StackPlace::HttpClient.connection
      account = client.identity_auth(params["login"], params["password"])
      success!(account)
    rescue StackPlace::BaseError => e
      session[:flash] = { :error=>e.message} # force it, since sinatra-flash isn't made available in Warden strategies
      redirect!("/account/login")
    end
  end
end
