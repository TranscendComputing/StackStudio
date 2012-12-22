module StackPlace
  module Client
    module TemplateSupport
      def template_create(template)
        template.extend(StackPlace::ImportTemplateRepresenter)
        response = post("/stackplace/#{version}/templates", :body=>template.to_json)
        log "[template.create] response=#{response.body}"
        handle_error_unless(response, 201)

        created_template = StackPlace::Template.new
        created_template.extend(StackPlace::TemplateRepresenter)
        created_template.from_json(response.body)
        return created_template
      end

      def template_details(id)
        response = get("/stackplace/#{version}/templates/#{id}.json")
        log "[template.details] response=#{response.body}"
        handle_error_unless(response, 201)
        created_template = StackPlace::Template.new
        created_template.extend(StackPlace::TemplateRepresenter)
        created_template.from_json(response.body)
        return created_template
      end

      def template_html(id)
        # fetch the details for the template first
        response = get("/stackplace/#{version}/templates/#{id}.html")
        response.body
      end

      def template_raw(id)
        response = get("/stackplace/#{version}/templates/#{id}/raw")
        response.body
      end
    end
  end
end
