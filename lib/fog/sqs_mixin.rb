module SqsMixin
    private
    
    def path_from_queue_url(queue_url)
        port_and_path = queue_url.split(":").last
        return port_and_path.sub(/^[0-9]+/, "")
    end
end