module StackPlace
  module Client
    module OrgSupport
      def org_details(id)
        response = get("/identity/#{version}/orgs/#{id}.json")
        log "[org.details] response=#{response.body}"
        handle_error_unless(response, 200)

        org = StackPlace::Org.new.extend(StackPlace::OrgRepresenter)
        org.from_json(response.body)
        return org
      end

      def org_create(org)
        org.extend(StackPlace::UpdateOrgRepresenter)
        response = post("/identity/#{version}/orgs", :body=>org.to_json)
        log "[org.create] response=#{response.body}"
        handle_error_unless(response, 201)

        created_org = StackPlace::Org.new
        created_org.extend(StackPlace::OrgRepresenter)
        created_org.from_json(response.body)
        return created_org
      end

      def org_update(org)
        org.extend(StackPlace::UpdateOrgRepresenter)
        response = put("/identity/#{version}/orgs/#{org.id}", :body=>org.to_json)
        log "[org.update] response=#{response.body}"
        handle_error_unless(response, 200)

        created_org = StackPlace::Org.new
        created_org.extend(StackPlace::OrgRepresenter)
        created_org.from_json(response.body)
        return created_org
      end

      def update_subscription(org_id, product_name, subscription)
        subscription.extend(StackPlace::UpdateSubscriptionRepresenter)
        response = put("/identity/#{version}/orgs/#{org_id}/#{product_name}/subscription", :body=>subscription.to_json)
        log "[org.update_subscription] response=#{response.body}"
        handle_error_unless(response, 200)

        created_org = StackPlace::Org.new
        created_org.extend(StackPlace::OrgRepresenter)
        created_org.from_json(response.body)
        return created_org
      end

      def add_subscriber(org_id, product_name, account_id, role)
        struct = Struct.new(:account_id, :role).new(account_id, role)
        struct.extend(StackPlace::AddSubscriberRepresenter)
        response = post("/identity/#{version}/orgs/#{org_id}/#{product_name}/subscribers", :body=>struct.to_json)
        log "[org.add_subscriber] response=#{response.body}"
        handle_error_unless(response, 200)
      end

      def remove_subscriber(org_id, product_name, account_id)
        response = delete("/identity/#{version}/orgs/#{org_id}/#{product_name}/subscribers/#{account_id}")
        log "[org.remove_subscriber] response=#{response.body}"
        handle_error_unless(response, 200)
      end
      
      def add_org_mapping(org_id, mapping)
        mapping.extend(StackPlace::UpdateCloudMappingRepresenter)
        response = post("/identity/#{version}/orgs/#{org_id}/mappings", :body=>mapping.to_json)
        log "[org.add_cloud_mapping] response=#{response.body}"
        handle_error_unless(response, 200)
        
        updated_org = StackPlace::Org.new
        updated_org.extend(StackPlace::OrgRepresenter)
        updated_org.from_json(response.body)
        return updated_org
      end
      
      def update_org_mapping(org_id, mapping)
        mapping.extend(StackPlace::UpdateCloudMappingRepresenter)
        response = put("/identity/#{version}/orgs/#{org_id}/mappings/#{mapping.id}", :body=>mapping.to_json)
        log "[org.update_cloud_mapping] response=#{response.body}"
        handle_error_unless(response, 200)   

        updated_org = StackPlace::Org.new
        updated_org.extend(StackPlace::OrgRepresenter)
        updated_org.from_json(response.body)
        return updated_org        
      end

      def remove_org_mapping(org_id, mapping_id)
        response = delete("/identity/#{version}/orgs/#{org_id}/mappings/#{mapping_id}")
        log "[org.remove_mapping] response=#{response.body}"
        handle_error_unless(response, 200)
        
        updated_org = StackPlace::Org.new
        updated_org.extend(StackPlace::OrgRepresenter)
        updated_org.from_json(response.body)
        return updated_org        
      end     

    end
  end
end
