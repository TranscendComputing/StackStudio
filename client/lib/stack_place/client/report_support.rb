module StackPlace
  module Client
    module ReportSupport
      def report_accounts
        response = get("/stackstudio/#{version}/report/accounts")
        log "[project.query] response=#{response.body}"
        handle_error_unless(response, 200)

        report = Struct.new(:results).new.extend(StackPlace::ReportRepresenter)
        report.from_json(response.body)
        report
      end
    end
  end
end
