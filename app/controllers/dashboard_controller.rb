class DashboardController < ApplicationController
	require 'open-uri'

	def learning_center
		content_url = "http://tcdocs.momentumsoftwareinc.com/learningCenterContent.html"
		source = open(content_url).read
		render :text => source
	end

        def get_latest
	    top = params[:take] || 6
	    @events_and_news = EventsAndNews.order("posted DESC").limit(top)
	    render :xml => @events_and_news, :camelize => true
	end

end
