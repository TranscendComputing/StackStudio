# Load the rails application
require File.expand_path('../application', __FILE__)

# ENV['FIXTURES'] ||= 'projects,users,user_project_rels,ec2_accounts'

ENV['RAILS_ENV'] ||= 'development'

# Initialize the rails application
ToughUI::Application.initialize!
# added 20110421
# require 'aws'
