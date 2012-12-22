module StackPlace
  module Client
    module IdentitySupport
      def identity_create(account)
        account.extend(StackPlace::AccountRepresenter)
        response = post("/identity/#{version}/accounts", :body=>account.to_json)
        log "[identity.create] response=#{response.body}"
        handle_error_unless(response, 201)

        created_account = StackPlace::Account.new
        created_account.extend(StackPlace::AccountRepresenter)
        created_account.from_json(response.body)
        return created_account
      end

      def identity_details(id)
        response = get("/identity/#{version}/accounts/#{id}.json")
        log "[identity.details] response=#{response.body}"
        handle_error_unless(response, 201)

        created_account = StackPlace::Account.new
        created_account.extend(StackPlace::AccountRepresenter)
        created_account.from_json(response.body)
        return created_account
      end

      def identity_update(account)
        account.extend(StackPlace::AccountRepresenter)
        response = put("/identity/#{version}/accounts/#{account.id}", :body=>account.to_json)
        log "[identity.update] response=#{response.body}"
        handle_error_unless(response, 200)

        updated_account = StackPlace::Account.new
        updated_account.extend(StackPlace::AccountRepresenter)
        updated_account.from_json(response.body)
        return updated_account
      end

      def identity_auth(login, password)
        response = post("/identity/#{version}/accounts/auth", :body=>{ :login=>login, :password=>password})
        log "[identity.auth] response=#{response.body}"
        handle_error_unless(response, 201)

        auth_account = StackPlace::Account.new
        auth_account.extend(StackPlace::AccountRepresenter)
        auth_account.from_json(response.body)
        return auth_account
      end

      def country_query
        url = "/identity/#{version}/accounts/countries.json"
        response = get(url)
        handle_error_unless(response, 200)
        query = StackPlace::CountryQuery.new.extend(StackPlace::CountryQueryRepresenter)
        query.from_json(response.body)
        return query
      end

      def create_cloud_account(account_id, cloud_id, cloud_account)
        cloud_account.extend(StackPlace::UpdateCloudAccountRepresenter)
        response = post("/identity/#{version}/accounts/#{account_id}/#{cloud_id}/cloud_accounts", :body=>cloud_account.to_json)
        log "[identity.create_cloud_account] response=#{response.body}"
        handle_error_unless(response, 201)

        account = StackPlace::Account.new
        account.extend(StackPlace::AccountRepresenter)
        account.from_json(response.body)
        return account
      end

      def update_cloud_account(account_id, cloud_id, cloud_account)
	      cloud_account.extend(StackPlace::UpdateCloudAccountRepresenter)
	      response = put("/identity/#{version}/accounts/#{account_id}/cloud_accounts/#{cloud_account.id}", :body=>cloud_account.to_json)
	      log "[account.update_cloud_account] response=#{response.body}"
	      handle_error_unless(response, 200)

	      updated_cloud_account = StackPlace::CloudAccount.new
	      updated_cloud_account.extend(StackPlace::CloudAccountRepresenter)
	      updated_cloud_account.from_json(response.body)
	      return updated_cloud_account
      end


      def delete_cloud_account(account_id, cloud_account_id)
        response = delete("/identity/#{version}/accounts/#{account_id}/cloud_accounts/#{cloud_account_id}")
        log "[identity.delete_cloud_account] response=#{response.body}"
        handle_error_unless(response, 200)

        account = StackPlace::Account.new
        account.extend(StackPlace::AccountRepresenter)
        account.from_json(response.body)
        return account
      end
	  
	  def add_account_permission(account_id, permission)
		permission.extend(StackPlace::UpdatePermissionRepresenter)
        response = post("/identity/#{version}/accounts/#{account_id}/permissions", :body=>permission.to_json)
        log "[identity.add_account_permission] response=#{response.body}"
        handle_error_unless(response, 201)

        account = StackPlace::Account.new
        account.extend(StackPlace::AccountRepresenter)
        account.from_json(response.body)
        return account
	  end
	  
	  def delete_account_permission(account_id, permission_id)
		response = post("/identity/#{version}/accounts/#{account_id}/permissions/#{permission_id}")
		log "[identity.delete_account_permission] response=#{response.body}"
        handle_error_unless(response, 200)

        account = StackPlace::Account.new
        account.extend(StackPlace::AccountRepresenter)
        account.from_json(response.body)
        return account
	  end

      def create_key_pair(account_id, cloud_account_id, key_pair)
        key_pair.extend(StackPlace::UpdateKeyPairRepresenter)
        response = post("/identity/#{version}/accounts/#{account_id}/#{cloud_account_id}/key_pairs", :body=>key_pair.to_json)
        log "[identity.create_key_pair] response=#{response.body}"
        handle_error_unless(response, 201)

        account = StackPlace::Account.new
        account.extend(StackPlace::AccountRepresenter)
        account.from_json(response.body)
        return account
      end

      def delete_key_pair(account_id, cloud_account_id, key_pair_id)
        response = delete("/identity/#{version}/accounts/#{account_id}/#{cloud_account_id}/key_pairs/#{key_pair_id}")
        log "[identity.delete_key_pair] response=#{response.body}"
        handle_error_unless(response, 200)

        account = StackPlace::Account.new
        account.extend(StackPlace::AccountRepresenter)
        account.from_json(response.body)
        return account
      end

      def create_audit_log(account_id, cloud_account_id, audit_log)
        audit_log.extend(StackPlace::AuditLogRepresenter)
        response = post("/identity/#{version}/accounts/#{account_id}/#{cloud_account_id}/audit_logs", :body=>audit_log.to_json)
        log "[identity.create_audit_log] response=#{response.body}"
        handle_error_unless(response, 201)

        account = StackPlace::Account.new
        account.extend(StackPlace::AccountRepresenter)
        account.from_json(response.body)
        return account
      end
      
      def create_cloud_resource(account_id, cloud_account_id, cloud_resource)
        cloud_resource.extend(StackPlace::CloudResourceRepresenter)
        response = post("/identity/#{version}/accounts/#{account_id}/#{cloud_account_id}/cloud_resources", :body=>cloud_resource.to_json)
        log "[identity.create_cloud_resource] response=#{response.body}"
        handle_error_unless(response, 201)

        account = StackPlace::Account.new
        account.extend(StackPlace::AccountRepresenter)
        account.from_json(response.body)
        return account
      end      

      def cloud_account_details(id)
        response = get("/identity/#{version}/accounts/cloud_accounts/#{id}.json")
        log "[identity.cloud_account_details] response=#{response.body}"
        handle_error_unless(response, 200)

        cloud_account = StackPlace::CloudAccount.new
        cloud_account.extend(StackPlace::CloudAccountRepresenter)
        cloud_account.from_json(response.body)
        return cloud_account
      end

    end
  end
end
