namespace :report do
	desc "Return report"
	task :retrieve_report => [:environment] do
		@client = StackPlace::HttpClient.new
		report = @client.report_accounts.results
		num_users = report.count
		total_logins = 0
		total_projects = 0
		total_cloud_accounts = 0
		report.each do |r|
			total_logins = total_logins + r["total_logins"] unless r["total_logins"].nil?
			total_projects = total_projects + r["total_projects_owned"] unless r["total_projects_owned"].nil?
			total_cloud_accounts = total_cloud_accounts + r["total_cloud_accounts"] unless r["total_cloud_accounts"].nil?
			if r["login"] == "admin"
				@admin_projects = r["total_projects_owned"]
				@admin_logins = r["total_logins"]
				@admin_accounts = r["total_cloud_accounts"]
			end
		end

		puts "Total Non-Admin Logins: #{total_logins - @admin_logins}     (#{@admin_logins} from admin)"
		puts "Total Non-Admin Cloud Accounts: #{total_cloud_accounts - @admin_accounts}    (#{@admin_accounts} from admin)"
		puts "Total Non-Admin Projects: #{total_projects - @admin_projects}     (#{@admin_projects} from admin)"

		pp report
	end
end
