class WelcomeDashboardController < ApplicationController
	require 'open-uri'

	def get_learning_center_content
		content_url = "http://tcdocs.momentumsoftwareinc.com/learningCenterContent.html"

		source = open(content_url).read

		render :text => source
	end
end

