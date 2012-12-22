class AccountApp < AppBase
  get '/' do
    "Account home"
  end

  get '/login/?' do
    @account = StackPlace::Account.new # embedded create account
    erb :"account/login"
  end

  post '/login/?' do
    warden.authenticate!
    flash[:notice] = "Welcome back!"
    return_or_redirect_to "/"
  end

  get '/logout/?' do
    warden.logout
    redirect '/account/login'
  end

  post '/unauthenticated/?' do
    status 410
    "Could not login"
  end

  get '/new/?' do
    @account = StackPlace::Account.new
    @countries = client.country_query.countries
    erb :"account/new"
  end

  post '/create/?' do
    @account = StackPlace::Account.new
    @account.login = params[:login]
    @account.email = params[:email]
    @account.first_name = params[:first_name]
    @account.last_name = params[:last_name]
    @account.company = params[:company]
    @account.country_code = params[:country_code]
    @account.password = params[:password]
    @account.password_confirmation = params[:password_confirmation]
    if @account.valid?
      begin
        @created_account = client.identity_create(@account)
        # login and redirect
        warden.set_user(@created_account)
        flash[:notice] = "You are now registered. Welcome!"
        return_or_redirect_to '/browse'
      rescue StackPlace::BaseError => e
        e.merge_validation_errors(@account)
        @countries = client.country_query.countries
        erb :"account/new"
      end
    else
      @countries = client.country_query.countries
      erb :"account/new"
    end
  end
end
