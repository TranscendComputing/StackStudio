ActionController::Routing::Routes.draw do |map|
  map.resources :users

  map.resource :session

  # For some reason, this mapped default GET to the show action
  #map.resource :icons

  # The priority is based upon order of creation: first created -> highest priority.

  # Sample of regular route:
  #   map.connect 'products/:id', :controller => 'catalog', :action => 'view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   map.purchase 'products/:id/purchase', :controller => 'catalog', :action => 'purchase'
  # This route can be invoked with purchase_url(:id => product.id)

  #root :to => "studio#index"
  map.signup '/signup', :controller => 'users', :action => 'new'
  map.login '/login', :controller => 'sessions', :action => 'new'
  map.logout '/logout', :controller => 'sessions', :action => 'destroy'

  #External log mappings
  match "logging/:action", :controller => "ExternalLogger"
  #map.logMessage "/logging", :controller => "external_logger", :action => "test_logger"

  #Cloud apis mappings
  match "/provisioning/:user_id/:cloud_account_id/:service/:action", :controller => "Provisioning"
  match "/validating/:cloud_account_id/:service/:source/:action", :controller => "Provisioning"
  match "/resources/:cloud_account_ids/:objects/:service/:action", :controller => "ObjectManagement"
  match "/s3_upload/:user_id/:cloud_account_id/:service/:physical_id/:action", :controller => "Provisioning"
  match "/s3_download/:user_id/:cloud_account_id/:service/:physical_id/:action", :controller => "Provisioning"
  
  #Monitor mappings
  match "/monitoring/:service/:action", :controller => "CloudMonitorDefaults"
  match "/monitoring/:cloud_account_id/:instance_id/:start_time/:period/:action" => "CloudMonitorDefaults"

  #Events and news mapping(s)
  match "/events/:action" => "EventsAndNews"

  #Email mappings
  match "/user/:user_id/:action" => "Users"
  
  #Helper mappings
  match "/helpers/:action", :controller => "Provisioning"

  #Api mappings
  match "/api/:user_id/:action", :controller => "Api"
  
  #User mappings
  map.resetUserPassword '/user/reset_password', :controller => 'users', :action => 'reset_password'

  #Cloud Formation mappings
  map.shallowLoadTemplate '/cfn_stacks/shallow_load_template', :controller => 'cfn_stacks', :action => 'shallow_load_template'

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   map.resources :products
  map.resource :session
  map.resources :users
  map.resources :cloud_monitors
  map.resources :events_and_news
  map.resource :provisioning
  map.resource :external_logger


  # You can have the root of your site routed with map.root -- just remember to delete public/index.html.
  # map.root :controller => "welcome"

  # See how all your routes lay out with "rake routes"

  # Install the default routes as the lowest priority.
  map.connect ':controller/:action/:id'
  map.connect ':controller/:action/:id.:format'
end
