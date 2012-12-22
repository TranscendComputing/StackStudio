module StackPlace
  module Client
    module NewsEventSupport
      def news_event_query(page=1, per_page=100)
        response = get("/stackstudio/#{version}/news_events")
        log "[news_event.query] response=#{response.body}"
        handle_error_unless(response, 200)

        query = StackPlace::NewsEventQuery.new.extend(StackPlace::NewsEventQueryRepresenter)
        query.from_json(response.body)
        return query
      end

      def news_event_create(news_event)
        news_event.extend(StackPlace::UpdateNewsEventRepresenter)
        response = post("/stackstudio/#{version}/news_events", :body=>news_event.to_json)
        log "[news_event.create] response=#{response.body}"
        handle_error_unless(response, 201)

        created_news_event = StackPlace::NewsEvent.new
        created_news_event.extend(StackPlace::NewsEventRepresenter)
        created_news_event.from_json(response.body)
        return created_news_event
      end
      
      def news_event_update(news_event)
        news_event.extend(StackPlace::UpdateNewsEventRepresenter)
        response = put("/stackstudio/#{version}/news_events/#{news_event.id}", :body=>news_event.to_json)
        log "[news_event.update] response=#{response.body}"
        handle_error_unless(response, 200)

        created_news_event = StackPlace::NewsEvent.new
        created_news_event.extend(StackPlace::NewsEventRepresenter)
        created_news_event.from_json(response.body)
        return created_news_event
      end
      
      def news_event_delete(news_event_id)
        response = delete("/stackstudio/#{version}/news_events/#{news_event_id}")
        log "[news_event.delete] response=#{response.body}"
        handle_error_unless(response, 200)
      end

    end
  end
end
