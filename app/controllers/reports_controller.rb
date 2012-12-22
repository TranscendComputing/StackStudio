class ReportsController < ApplicationController
	def index 
		@report = $client.report_accounts
		respond_to do |format|
			format.json
			format.csv { render text: @report.to_csv }
		end
	end
end
