module StackPlace
  module Client
    module CategorySupport
      def category_query(page=1, per_page=100)
        url = "/stackplace/#{version}/categories"
        #url += "?page=#{page}"
        #url += "&per_page=#{per_page}"
        response = get(url)
        handle_error_unless(response, 200)
        query = StackPlace::CategoryQuery.new.extend(StackPlace::CategoryQueryRepresenter)
        query.from_json(response.body)
        return query
      end

      def category_create(category)
        category.extend(StackPlace::CategoryRepresenter)
        response = post("/stackplace/#{version}/categories", :body=>category.to_json)
        log "[category.create] response=#{response.body}"
        handle_error_unless(response, 201)

        created_category = StackPlace::Category.new
        created_category.extend(StackPlace::CategoryRepresenter)
        created_category.from_json(response.body)
        return created_category
      end

      def category_details(id_or_permalink)
        response = get("/stackplace/#{version}/categories/#{id_or_permalink}.json")
        log "[category.details] response=#{response.body}"
        handle_error_unless(response, 201)

        created_category = StackPlace::Category.new
        created_category.extend(StackPlace::CategoryRepresenter)
        created_category.from_json(response.body)
        return created_category
      end

      def category_update(category)
        category.extend(StackPlace::CategoryRepresenter)
        response = put("/stackplace/#{version}/categories/#{category.id}", :body=>category.to_json)
        log "[category.update] response=#{response.body}"
        handle_error_unless(response, 200)

        updated_category = StackPlace::Category.new
        updated_category.extend(StackPlace::CategoryRepresenter)
        updated_category.from_json(response.body)
        return updated_category
      end
    end
  end
end
