module StackPlace
  module Client
    module ProvisioningSupport
      def provisioned_version_details(provisioned_version_id)
        response = get("/stackstudio/#{version}/provisioning/#{provisioned_version_id}.json")
        log "[provisioning.details] response=#{response.body}"
        handle_error_unless(response, 200)

        pv = StackPlace::ProvisionedVersion.new.extend(StackPlace::ProvisionedVersionRepresenter)
        pv.from_json(response.body)
        return pv
      end

      def create_provisioned_version(project_id, provisioned_version)
        provisioned_version.extend(StackPlace::UpdateProvisionedVersionRepresenter)
        response = post("/stackstudio/#{version}/provisioning/#{project_id}", :body=>provisioned_version.to_json)
        log "[provisioning.create] response=#{response.body}"
        handle_error_unless(response, 201)

        pv = StackPlace::ProvisionedVersion.new.extend(StackPlace::ProvisionedVersionRepresenter)
        pv.from_json(response.body)
        return pv
      end

      def create_provisioned_instances(provisioned_version_id, instances)
        pi_instances = Struct.new(:instances).new
        pi_instances.instances = instances
        pi_instances.extend(StackPlace::ProvisionedInstancesRepresenter)
        response = post("/stackstudio/#{version}/provisioning/#{provisioned_version_id}/instances", :body=>pi_instances.to_json)
        log "[provisioning.update] response=#{response.body}"
        handle_error_unless(response, 200)

        pv = StackPlace::ProvisionedVersion.new.extend(StackPlace::ProvisionedVersionRepresenter)
        pv.from_json(response.body)
        return pv
      end
      
      def update_provisioned_instance(provisioned_version_id, instance)
        instance.extend(StackPlace::ProvisionedInstanceRepresenter)
        response = put("/stackstudio/#{version}/provisioning/#{provisioned_version_id}/instances/#{instance.id}", :body=>instance.to_json)
        handle_error_unless(response, 200)
        
        pv = StackPlace::ProvisionedVersion.new.extend(StackPlace::ProvisionedVersionRepresenter)
        pv.from_json(response.body)
        return pv
      end

      def remove_provisioned_instance(provisioned_version_id, instance_id)
        response = delete("/stackstudio/#{version}/provisioning/#{provisioned_version_id}/instances/#{instance_id}")
        log "[provisioning.delete_provisioned_instance] response=#{response.body}"
        handle_error_unless(response, 200)

        pv = StackPlace::ProvisionedVersion.new.extend(StackPlace::ProvisionedVersionRepresenter)
        pv.from_json(response.body)
        return pv
      end

      def remove_provisioned_version(provisioned_version_id)
        response = delete("/stackstudio/#{version}/provisioning/#{provisioned_version_id}")
        log "[provisioning.delete_provisioned_instance] response=#{response.body}"
        handle_error_unless(response, 200)
      end

    end

  end
end
