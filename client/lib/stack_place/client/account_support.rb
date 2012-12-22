module StackPlace
  module Client
    module AccountSupport
      def account_details(login_or_id)
        response = get("/stackplace/#{version}/accounts/#{login_or_id}.json")
        log "[account.details] response=#{response.body}"
        handle_error_unless(response, 201)

        created_account = StackPlace::Account.new
        created_account.extend(StackPlace::AccountSummaryRepresenter)
        created_account.from_json(response.body)
        return created_account
      end
    end
  end
end
