module ResponseUtilities
    def symbolize_keys(collection)
        collection.each do |item|
            item.keys.each do |key|
                item[key.underscore.to_sym] = item[key]
                item.delete(key)
            end
        end
    end
end
