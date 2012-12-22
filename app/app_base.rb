require 'cgi'

class AppBase < Sinatra::Base
  register Sinatra::Flash

  set :public_folder, File.join(File.dirname(__FILE__), '..', 'public')

  error StackPlace::NotFound do
    erb :"errors/404"
  end

  error StackPlace::ConnectionFailed do
    erb :"errors/api_error"
  end

  helpers do
    include AuthSupport
    include ActionView::Helpers::FormTagHelper
    include ActionView::Helpers::FormOptionsHelper

    def h(orig)
      return nil if orig.nil?
      CGI.escapeHTML(orig)
    end

    # returns true if a view is being requested in offline mode, to
    # ensure that rendering is done relative and certain portions of the
    # view are excluded (for generating offline zipped documentation)
    def offline_mode?
      @offline_mode
    end

    def offline_mode!
      @offline_mode = true
    end

    # returns the root path for assets, based on whether we are using online or offline mode for rendering
    def root
      (offline_mode? ? "" : "/")
    end

    # returns the full URL to the Studio app, with the template ID included
    def edit_template_url(template_id, action)
      host = ENV["STACK_PLACE_STUDIO_URL"] || "http://172.17.1.109/bin/C9.html"
      "#{host}?template_id=#{template_id}&action=#{action}"
    end

    def errors_on(model, field)
      return "" if model.nil?
      return "" if model.errors.nil?
      return "<span class='field_error'>#{model.errors[field].join(", ")}</span>"
    end

    def date(date_string)
      return "" if date_string.blank?
      Time.parse(date_string).strftime("%b %d, %Y")
    end

  end

  def client
    c = StackPlace::HttpClient.connection
    c.verbose! if ENV['RACK_ENV'].empty? or ENV['RACK_ENV'] == 'development'
    c
  end
end
