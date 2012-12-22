module StackPlace
  module Client
    module ProjectSupport
      def project_query(page=1, per_page=100)
        response = get("/stackstudio/#{version}/projects")
        log "[project.query] response=#{response.body}"
        handle_error_unless(response, 200)

        query = StackPlace::ProjectQuery.new.extend(StackPlace::ProjectQueryRepresenter)
        query.from_json(response.body)
        return query
      end

      def open_project(id, account_id)
        response = post("/stackstudio/#{version}/projects/#{id}/open/#{account_id}")
        log "[project.details] response=#{response.body}"
        handle_error_unless(response, 200)

        project = StackPlace::Project.new.extend(StackPlace::ProjectRepresenter)
        project.from_json(response.body)
        return project
      end

      def project_create(project)
        project.extend(StackPlace::UpdateProjectRepresenter)
        response = post("/stackstudio/#{version}/projects", :body=>project.to_json)
        log "[project.create] response=#{response.body}"
        handle_error_unless(response, 201)

        created_project = StackPlace::Project.new
        created_project.extend(StackPlace::ProjectRepresenter)
        created_project.from_json(response.body)
        return created_project
      end

      def project_update(project)
        project.extend(StackPlace::UpdateProjectRepresenter)
        response = put("/stackstudio/#{version}/projects/#{project.id}", :body=>project.to_json)
        log "[project.update] response=#{response.body}"
        handle_error_unless(response, 200)

        created_project = StackPlace::Project.new
        created_project.extend(StackPlace::ProjectRepresenter)
        created_project.from_json(response.body)
        return created_project
      end

      def project_delete(project_id)
        response = delete("/stackstudio/#{version}/projects/#{project_id}")
        log "[project.delete] response=#{response.body}"
        handle_error_unless(response, 200)
      end

      def add_project_member(project_id, account_id, role)
        member = StackPlace::Member.new.extend(StackPlace::UpdateMemberRepresenter)
        member.account = StackPlace::Account.new
        member.account.id = account_id
        member.role = role
        response = post("/stackstudio/#{version}/projects/#{project_id}/members", :body=>member.to_json)
        log "[project.add_project_member] response=#{response.body}"
        handle_error_unless(response, 200)

        created_project = StackPlace::Project.new
        created_project.extend(StackPlace::ProjectRepresenter)
        created_project.from_json(response.body)
        return created_project
      end

      def remove_project_member(project_id, account_id)
        response = delete("/stackstudio/#{version}/projects/#{project_id}/members/#{account_id}")
        log "[project.remove_project_member] response=#{response.body}"
        handle_error_unless(response, 200)

        created_project = StackPlace::Project.new
        created_project.extend(StackPlace::ProjectRepresenter)
        created_project.from_json(response.body)
        return created_project
      end
	  
	  def add_member_permission(project_id, member_id, permission)
		response = post("/stackstudio/#{version}/projects/#{project_id}/members/#{member_id}/permissions", :body=>permission.to_json)
		log "[project.add_member_permission] response=#{response.body}"
		handle_error_unless(response, 200)
		
		created_project = StackPlace::Project.new
        created_project.extend(StackPlace::ProjectRepresenter)
        created_project.from_json(response.body)
        return created_project
	  end
	  
	  def remove_member_permission(project_id, member_id, permission_id)
		response = delete("/stackstudio/#{version}/projects/#{project_id}/members/#{member_id}/permissions/#{permission_id}")
		log "[project.remove_member_permission] response=#{response.body}"
		handle_error_unless(response, 200)
		
		created_project = StackPlace::Project.new
        created_project.extend(StackPlace::ProjectRepresenter)
        created_project.from_json(response.body)
        return created_project
	  end

      def project_archive(project_id)
        response = post("/stackstudio/#{version}/projects/#{project_id}/archive")
        log "[project.archive] response=#{response.body}"
        handle_error_unless(response, 200)

        updated_project = StackPlace::Project.new
        updated_project.extend(StackPlace::ProjectRepresenter)
        updated_project.from_json(response.body)
        return updated_project
      end

      def project_reactivate(project_id)
        response = post("/stackstudio/#{version}/projects/#{project_id}/reactivate")
        log "[project.reactivate] response=#{response.body}"
        handle_error_unless(response, 200)

        updated_project = StackPlace::Project.new
        updated_project.extend(StackPlace::ProjectRepresenter)
        updated_project.from_json(response.body)
        return updated_project
      end
      
      def project_version_archive(project_id, project_version)
        response = post("/stackstudio/#{version}/projects/#{project_id}/versions/#{project_version}/archive")
        log "[project_version.archive] response=#{response.body}"
        handle_error_unless(response, 200)

        project_version = StackPlace::ProjectVersion.new.extend(StackPlace::ProjectVersionRepresenter)
        debugger
        project_version.from_json(response.body)
        return project_version
      end

      def project_version_reactivate(project_id, project_version)
        response = post("/stackstudio/#{version}/projects/#{project_id}/versions/#{project_version}/reactivate")
        log "[project_version.reactivate] response=#{response.body}"
        handle_error_unless(response, 200)

        #project_version = StackPlace::ProjectVersion.new.extend(StackPlace::ProjectVersionRepresenter)
        #project_version.from_json(response.body)
        #return project_version
        return response.body
      end

      def project_freeze_version(project_id, new_version)
        new_version.extend(StackPlace::VersionRepresenter)
        response = post("/stackstudio/#{version}/projects/#{project_id}/freeze_version", :body=>new_version.to_json)
        log "[project.freeze_version] response=#{response.body}"
        handle_error_unless(response, 201)

        updated_project = StackPlace::Project.new
        updated_project.extend(StackPlace::ProjectRepresenter)
        updated_project.from_json(response.body)
        return updated_project
      end

      def promote_environment(project_id, version_number, environment_name)
        environment = StackPlace::Environment.new.extend(StackPlace::UpdateEnvironmentRepresenter)
        environment.name = environment_name
        response = post("/stackstudio/#{version}/projects/#{project_id}/versions/#{version_number}/promote", :body=>environment.to_json)
        log "[project.promote_environment] response=#{response.body}"
        handle_error_unless(response, 200)

        updated_version = StackPlace::ProjectVersion.new
        updated_version.extend(StackPlace::ProjectVersionRepresenter)
        updated_version.from_json(response.body)
        return updated_version
      end

      def project_version_details(project_id, project_version)
        response = get("/stackstudio/#{version}/projects/#{project_id}/versions/#{project_version}.json")
        log "[project.version_details] response=#{response.body}"
        handle_error_unless(response, 200)

        project_version = StackPlace::ProjectVersion.new.extend(StackPlace::ProjectVersionRepresenter)
        project_version.from_json(response.body)
        return project_version
      end

      def add_element(project_id, element)
        element.extend(StackPlace::UpdateElementRepresenter)
        response = post("/stackstudio/#{version}/projects/#{project_id}/elements", :body=>element.to_json)
        log "[project.add_element] response=#{response.body}"
        handle_error_unless(response, 200)

        created_element = StackPlace::Element.new
        created_element.extend(StackPlace::ElementRepresenter)
        created_element.from_json(response.body)
        return created_element
      end

      def import_elements(project_id, elements)
        all = Struct.new(:elements).new
        all.extend(StackPlace::ElementsRepresenter)
        response = post("/stackstudio/#{version}/projects/#{project_id}/elements/import", :body=>all.to_json)
        log "[project.import_elements] response=#{response.body}"
        handle_error_unless(response, 200)

        import_results = StackPlace::ImportResults.new.extend(StackPlace::ImportResultsRepresenter)
        import_results.from_json(response.body)
        return import_results
      end

      def update_element(project_id, element)
        element.extend(StackPlace::UpdateElementRepresenter)
        response = put("/stackstudio/#{version}/projects/#{project_id}/elements/#{element.id}", :body=>element.to_json)
        log "[project.update_element] response=#{response.body}"
        handle_error_unless(response, 200)

        updated_element = StackPlace::Element.new
        updated_element.extend(StackPlace::ElementRepresenter)
        updated_element.from_json(response.body)
        return updated_element
      end

      def remove_element(project_id, element_id)
        response = delete("/stackstudio/#{version}/projects/#{project_id}/elements/#{element_id}")
        log "[project.remove_element] response=#{response.body}"
        handle_error_unless(response, 200)
      end

      def add_node(project_id, node)
        node.extend(StackPlace::UpdateNodeRepresenter)
        response = post("/stackstudio/#{version}/projects/#{project_id}/nodes", :body=>node.to_json)
        log "[project.add_node] response=#{response.body}"
        handle_error_unless(response, 200)

        created_node = StackPlace::Node.new
        created_node.extend(StackPlace::NodeRepresenter)
        created_node.from_json(response.body)
        return created_node
      end

      def import_nodes(project_id, nodes)
        all = Struct.new(:nodes).new
        all.extend(StackPlace::NodesRepresenter)
        response = post("/stackstudio/#{version}/projects/#{project_id}/nodes/import", :body=>all.to_json)
        log "[project.import_nodes] response=#{response.body}"
        handle_error_unless(response, 200)

        import_results = StackPlace::ImportResults.new.extend(StackPlace::ImportResultsRepresenter)
        import_results.from_json(response.body)
        return import_results
      end

      def update_node(project_id, node)
        node.extend(StackPlace::UpdateNodeRepresenter)
        response = put("/stackstudio/#{version}/projects/#{project_id}/nodes/#{node.id}", :body=>node.to_json)
        log "[project.update_node] response=#{response.body}"
        handle_error_unless(response, 200)

        updated_node = StackPlace::Node.new
        updated_node.extend(StackPlace::NodeRepresenter)
        updated_node.from_json(response.body)
        return updated_node
      end

      def remove_node(project_id, node_id)
        response = delete("/stackstudio/#{version}/projects/#{project_id}/nodes/#{node_id}")
        log "[project.remove_node] response=#{response.body}"
        handle_error_unless(response, 200)
      end

      def link_nodes(project_id, source_node_id, target_node_id)
        json = { "node_link" => { "source_id"=>source_node_id, "target_id"=>target_node_id }}.to_json
        response = post("/stackstudio/#{version}/projects/#{project_id}/nodes/link", :body=>json)
        log "[project.link_node] response=#{response.body}"
        handle_error_unless(response, 200)

        updated_node = StackPlace::Node.new
        updated_node.extend(StackPlace::NodeRepresenter)
        updated_node.from_json(response.body)
        return updated_node
      end

      def add_variant(project_id, variant)
        variant.extend(StackPlace::UpdateVariantRepresenter)
        response = post("/stackstudio/#{version}/projects/#{project_id}/variants", :body=>variant.to_json)
        log "[project.add_variant] response=#{response.body}"
        handle_error_unless(response, 200)

        created_variant = StackPlace::Variant.new
        created_variant.extend(StackPlace::VariantRepresenter)
        created_variant.from_json(response.body)
        return created_variant
      end

      def update_variant(project_id, variant)
        variant.extend(StackPlace::UpdateVariantRepresenter)
        response = put("/stackstudio/#{version}/projects/#{project_id}/variants/#{variant.id}", :body=>variant.to_json)
        log "[project.update_variant] response=#{response.body}"
        handle_error_unless(response, 200)

        updated_variant = StackPlace::Variant.new
        updated_variant.extend(StackPlace::VariantRepresenter)
        updated_variant.from_json(response.body)
        return updated_variant
      end

      def remove_variant(project_id, variant_id)
        response = delete("/stackstudio/#{version}/projects/#{project_id}/variants/#{variant_id}")
        log "[project.remove_variant] response=#{response.body}"
        handle_error_unless(response, 200)
      end

      def add_embedded_project(project_id, embedded_project_id)
        ep = StackPlace::EmbeddedProject.new.extend(UpdateEmbeddedProjectRepresenter)
        ep.embedded_project_id = embedded_project_id
        response = post("/stackstudio/#{version}/projects/#{project_id}/embedded_projects", :body=>ep.to_json)
        log "[project.add_embedded_project] response=#{response.body}"
        handle_error_unless(response, 200)

        created_ep = StackPlace::EmbeddedProject.new
        created_ep.extend(StackPlace::EmbeddedProjectRepresenter)
        created_ep.from_json(response.body)
        return created_ep
      end

      def remove_embedded_project(project_id, embedded_project_id)
        response = delete("/stackstudio/#{version}/projects/#{project_id}/embedded_projects/#{embedded_project_id}")
        log "[project.remove_embedded_project] response=#{response.body}"
        handle_error_unless(response, 200)
      end

      def add_variant_to_embedded_project(project_id, embedded_project_id, variant)
        variant.extend(StackPlace::UpdateVariantRepresenter)
        response = post("/stackstudio/#{version}/projects/#{project_id}/embedded_projects/#{embedded_project_id}/variants", :body=>variant.to_json)
        log "[project.add_variant] response=#{response.body}"
        handle_error_unless(response, 200)

        created_variant = StackPlace::Variant.new
        created_variant.extend(StackPlace::VariantRepresenter)
        created_variant.from_json(response.body)
        return created_variant
      end

      def update_variant_to_embedded_project(project_id, embedded_project_id, variant)
        variant.extend(StackPlace::UpdateVariantRepresenter)
        response = put("/stackstudio/#{version}/projects/#{project_id}/embedded_projects/#{embedded_project_id}/variants/#{variant.id}", :body=>variant.to_json)
        log "[project.update_variant] response=#{response.body}"
        handle_error_unless(response, 200)

        updated_variant = StackPlace::Variant.new
        updated_variant.extend(StackPlace::VariantRepresenter)
        updated_variant.from_json(response.body)
        return updated_variant
      end

      def remove_variant_from_embedded_project(project_id, embedded_project_id, variant_id)
        response = delete("/stackstudio/#{version}/projects/#{project_id}/embedded_projects/#{embedded_project_id}/variants/#{variant_id}")
        log "[project.remove_variant] response=#{response.body}"
        handle_error_unless(response, 200)
      end

    end

  end
end
