class UserGroupApp < AppBase
  get '/' do
    erb :"user_group/index"
  end
  
end
