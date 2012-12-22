module StackPlace
  module Client
    module StackSupport
      def stack_query(page, per_page, category_ids=nil)
        url = "/stackplace/#{version}/stacks"
        url += "?page=#{page}"
        url += "&per_page=#{per_page}"
        unless category_ids.nil? or category_ids.empty?
          url += "&categories=#{category_ids.join(",")}"
        end
        response = get(url)
        handle_error_unless(response, 200)
        query = StackPlace::StackQuery.new.extend(StackPlace::StackQueryRepresenter)
        query.from_json(response.body)
        return query
      end

      def stack_create(create_stack)
        create_stack.extend(StackPlace::CreateStackRepresenter)
        response = post "/stackplace/#{version}/stacks", :body=>create_stack.to_json
        handle_error_unless(response, 201)
        stack = StackPlace::Stack.new.extend(StackPlace::StackRepresenter)
        stack.from_json(response.body)
        return stack
      end

      def stack_details(id_or_permalink)
        url = "/stackplace/#{version}/stacks/#{id_or_permalink}.json"
        response = get(url)
        handle_error_unless(response, 200)
        stack = StackPlace::Stack.new.extend(StackPlace::StackRepresenter)
        stack.from_json(response.body)
        return stack
      end

      def stack_download(permalink, stack_version)
        url = "/stackplace/#{version}/stacks/#{permalink}/download/#{stack_version}"
        response = get(url)
        handle_error_unless(response, 200)
        stack = StackPlace::Stack.new.extend(StackPlace::StackRepresenter)
        stack.from_json(response.body)
        return stack
      end

    end
  end
end

