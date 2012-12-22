module StackPlace
  module Client
    module CloudSupport
      def cloud_query(page=1, per_page=100)
        response = get("/stackstudio/#{version}/clouds")
        log "[cloud.query] response=#{response.body}"
        handle_error_unless(response, 200)

        query = StackPlace::CloudQuery.new.extend(StackPlace::CloudQueryRepresenter)
        query.from_json(response.body)
        return query
      end

      def cloud_details(id)
        response = get("/stackstudio/#{version}/clouds/#{id}.json")
        log "[cloud.details] response=#{response.body}"
        handle_error_unless(response, 200)

        cloud = StackPlace::Cloud.new.extend(StackPlace::CloudRepresenter)
        cloud.from_json(response.body)
        return cloud
      end

      def cloud_create(cloud)
        cloud.extend(StackPlace::UpdateCloudRepresenter)
        response = post("/stackstudio/#{version}/clouds", :body=>cloud.to_json)
        log "[cloud.create] response=#{response.body}"
        handle_error_unless(response, 201)

        created_cloud = StackPlace::Cloud.new
        created_cloud.extend(StackPlace::CloudRepresenter)
        created_cloud.from_json(response.body)
        return created_cloud
      end

      def cloud_update(cloud)
        cloud.extend(StackPlace::UpdateCloudRepresenter)
        response = put("/stackstudio/#{version}/clouds/#{cloud.id}", :body=>cloud.to_json)
        log "[cloud.update] response=#{response.body}"
        handle_error_unless(response, 200)

        created_cloud = StackPlace::Cloud.new
        created_cloud.extend(StackPlace::CloudRepresenter)
        created_cloud.from_json(response.body)
        return created_cloud
      end
      
      def cloud_delete(cloud_id)
        response = delete("/stackstudio/#{version}/clouds/#{cloud_id}")
        log "[cloud.delete] response=#{response.body}"
        handle_error_unless(response, 200)
      end

      def add_cloud_service(cloud_id, service)
        service.extend(StackPlace::UpdateCloudServiceRepresenter)
        response = post("/stackstudio/#{version}/clouds/#{cloud_id}/services", :body=>service.to_json)
        log "[cloud.add_cloud_service] response=#{response.body}"
        handle_error_unless(response, 200)
      end

      def remove_cloud_service(cloud_id, service_id)
        response = delete("/stackstudio/#{version}/clouds/#{cloud_id}/services/#{service_id}")
        log "[cloud.remove_cloud_service] response=#{response.body}"
        handle_error_unless(response, 200)
      end

      def add_cloud_mapping(cloud_id, mapping)
        mapping.extend(StackPlace::UpdateCloudMappingRepresenter)
        response = post("/stackstudio/#{version}/clouds/#{cloud_id}/mappings", :body=>mapping.to_json)
        log "[cloud.add_cloud_mapping] response=#{response.body}"
        handle_error_unless(response, 200)
      end

      def remove_cloud_mapping(cloud_id, mapping_id)
        response = delete("/stackstudio/#{version}/clouds/#{cloud_id}/mappings/#{mapping_id}")
        log "[cloud.remove_cloud_mapping] response=#{response.body}"
        handle_error_unless(response, 200)
      end

    end
  end
end
