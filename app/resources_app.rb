class ResourcesApp < AppBase
  get '/' do
    erb :"layout_resources", :layout=>false
  end
  
end
