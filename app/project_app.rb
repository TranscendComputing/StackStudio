class ProjectApp < AppBase
  # initialize the browser - uses its own layout
  get '/' do
    @projects = [0,1,2,3,4,5]
    erb :"/project/index", :layout=>false
  end
  
    # shows a stack given its full permalink (account/stack_permalink)
  get '/doc' do
    erb :"/project/doc"
  end
  
  post '/add_resource' do
    #do some stuff
  end
  
  get '/open' do
    @set_open_project = true
    erb :"/project/index", :layout=>false
  end
  
=begin
  # pagination support
  get '/list' do
    query_categories
    query_stacks
    erb :"/browse/_stack_list", :layout=>false
  end

  # shows a stack given its full permalink (account/stack_permalink)
  get '/:account/:stack' do
    @stack = client.stack_details("#{params[:account]}/#{params[:stack]}")
    erb :"/stacks/show", :layout=>false
  end

  # shows a stack given its full permalink (account/stack_permalink)
  get '/:account/:project_id/doc' do
    @project = client.project_details("#{params[:account]}/#{params[:stack]}")
    @template_id = @stack.templates.first.id
    # make a service call by id to obtain the HTML
    @html = client.template_html(@template_id)
    # make second service call to obtain JSON source
    @json = client.template_raw(@template_id)
    # show the HTML version of the template
    erb :"browse/doc", :layout=>(request.xhr? ? false : :"browse/browser_layout")
  end

  def query_projects
    @projects = client.project_query.projects
  end

  # helper to call the stacks service and fetch the current page, with filters applied
  def query_stacks
    @page = (params[:page] || 1).to_i
    @per_page = 35
    # set the default categories to be shown, unless the user overrides them with their own choice(s)
    defaults = @categories.select { |c| c.name == "Application" or c.name == "Platform" }.collect{ |c| c.id}
    @selected_categories = (params[:categories].nil? ? defaults : [params[:categories]] )
    stack_query = client.stack_query(@page, @per_page, @selected_categories)
    @query = stack_query.query
    @stacks = stack_query.stacks
  end
=end
end
