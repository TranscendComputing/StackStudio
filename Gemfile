#
# Sources:
#
#   http://openrails.blogspot.com/2011/04/jruby-on-rails-instalation.html
#

source 'http://rubygems.org'

=begin
gem 'rails', '3.0.7'

platforms :jruby do
    gem 'jruby-openssl'
end
gem 'passenger', '3.0.9', :platforms=>:ruby

gem 'encryptor'
gem 'chargify_api_ares'

# Openstack Keystone and Swift Support
gem 'openstack-keystone-client', :require => 'keystone/v2_0/client'
gem 'rest-client', :require => 'rest_client'
gem 'openstack-swift', :path => "vendor/openstack-swift"

# Amazon SES support for ActionMailer
gem 'aws-ses', '~> 0.3.2', :require => 'aws/ses'

# Amazon API Support
#gem 'right_aws','~> 3.0.3',  :path => "vendor/right_aws-3.0.3", :require => 'right_aws'
gem 'right_aws',  :path => "vendor/right_aws-2.1.0", :require => 'right_aws'
gem 'fog', '~> 1.7', :require => 'fog'
#gem 'fog', :path => "vendor/fog", :require => 'fog'
gem 'aws-sdk', '~> 1.5.2'

# Install correct gems to support chef
gem 'chef', '~> 10.12.0', :require => 'chef', :platforms=>:ruby
gem 'spice', :require => 'spice'

# roar will not install from gem if in windows environment
# see previous revision (before 8/17/12) for vendor resource
gem 'roar', '~> 0.9.1'


# Install the warbler gem, in case you want to generate a war file for
# your Rails application and deploy it to an app server, like Tomcat
# or Glassfish
gem 'warbler', :platforms=>:jruby
gem 'jruby-openssl', :platforms=>:jruby


group :development, :test do
  gem 'awesome_print'
  gem 'ruby-debug19', :platforms=>:ruby
  gem 'thin', :platform => :ruby
  gem 'bson'
  gem 'bson_ext', :platform => :ruby
  gem 'jasmine'
  if RUBY_PLATFORM=~/i386-mingw32/
    gem 'eventmachine', '1.0.0.beta.4.1', :platforms=>[:mswin, :mingw, :mingw_19, :mingw_18]
  else
    gem 'eventmachine'
  end
end
=end


gem 'rake'

# Web support
gem 'erubis', '~> 2.7.0'
gem 'sinatra', '~> 1.3.1', :require => "sinatra/base"
gem 'thin', '~> 1.3.1'
gem 'activesupport', '~> 3.2.0', :require => 'active_support'
gem 'actionpack', '~> 3.2.0', :require => 'action_pack'
gem 'sinatra-flash', '~> 0.3.0'

# Services integration support
gem 'roar', '~> 0.9.2'
gem 'httparty', '~> 0.8.1'
gem 'activemodel', '~> 3.2.0'

# Offline zipped doc support
gem 'zippy', '~> 0.1.0'

# Auth support
gem 'warden', '~>1.1.0'

# Email support
gem 'aws-ses', '~>0.4.4'

# Test-only
group :development, :test do
  gem 'rspec', '~> 2.4'
  gem 'rspec-mocks'
  #gem 'heroku' # deprecated
  gem 'foreman'
  gem 'rack-test'
  gem 'awesome_print'
  gem 'factory_girl', '~> 3.0.0'
end
