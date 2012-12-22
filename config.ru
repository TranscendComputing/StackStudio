# -*- coding: utf-8 -*-
# require the service client
require File.join(File.dirname(__FILE__), 'client', 'lib', 'stack_place')

# require app support libs and related gems
require File.join(File.dirname(__FILE__), 'lib', 'libs')
require File.join(File.dirname(__FILE__), 'app', 'auth')
require File.join(File.dirname(__FILE__), 'app', 'app_base')
require File.join(File.dirname(__FILE__), 'app', 'root_app')
require File.join(File.dirname(__FILE__), 'app', 'account_app')
require File.join(File.dirname(__FILE__), 'app', 'dashboard_app')
require File.join(File.dirname(__FILE__), 'app', 'resources_app')
require File.join(File.dirname(__FILE__), 'app', 'project_app')
require File.join(File.dirname(__FILE__), 'app', 'user_group_app')

# By default, Ruby buffers its output to stdout. To take advantage of
# Heroku's realtime logging, you will need to disable this buffering
# to have log messages sent straight to Heroku's logging
# infrastructure
# http://devcenter.heroku.com/articles/ruby#logging
$stdout.sync = true

use Rack::Session::Cookie, :secret => 'stackplace20120206'
use Rack::MethodOverride # Warden
use Rack::Logger

# Setup the Warden authentication manager
use Warden::Manager do |manager|
  manager.default_strategies :password
  manager.failure_app = AccountApp
end

# Setup the client endpoint
configure do
  # use the ENV value provided, or default to localhost for development mode
  StackPlace::Config.host = (ENV['STACK_PLACE_SERVICE_ENDPOINT'] || "http://localhost:9292")
end

map "/account" do
  run AccountApp
end

map "/dashboard" do
  run DashboardApp
end

map "/resources" do
  run ResourcesApp
end

map "/projects" do
  run ProjectApp
end
 
map "/settings" do
  run UserGroupApp
end

map "/" do
  run RootApp
end

