class Report
	require 'csv'

	def initialize(report)
	end

	def self.to_csv
		CSV.generate do |csv|
			csv << column_names
			all.each do |report|
				csv << report.attributes.values_at(*column_names)
			end
		end
	end
end

