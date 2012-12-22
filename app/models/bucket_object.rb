class BucketObject
	attr_accessor :key, :content_length, :last_modified
    
	def initialize(object)
		case object
		when Hash
            @key = object["name"]
            @last_modified = object["last_modified"]
            @content_length = object["bytes"]
        end
	end


	def to_json
		JSON.parse({:key => @key, :content_length => @content_length, :last_modified => @last_modified}.to_json)
	end
end

