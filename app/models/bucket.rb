class Bucket
	attr_accessor :key, :creation_date
    
	def initialize(bucket)
		case bucket
        when Hash
            @key = bucket["name"]
        end
	end


	def to_json
		JSON.parse({:key => @key}.to_json)
	end
end

