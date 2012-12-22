class RootApp < AppBase
  get '/' do
    #erb :index
    redirect "/dashboard"
  end

#  get '/dashboard' do
#    authorize!
#    erb :dashboard
#  end

end
