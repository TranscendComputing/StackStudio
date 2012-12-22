module MultiCloudParser
	class Storage
		def describe_storage_parser(provider, directories)
			formatted_directories = []
			directories.each do |t|
				case provider
				when CloudConstants::Type::OPENSTACK
					formatted_directory = Bucket.new(t).to_json
				when CloudConstants::Type::EUCA
					formatted_directory = {}
					formatted_directory[:key] = t[:name]
					formatted_directory[:creation_date] = Time.zone.parse(t[:creation_date]).utc
				else
					formatted_directory = t.attributes
				end
				
				#AWS
				#key=name
				#creation_date=creation_date
				formatted_directories << formatted_directory
			end
			
			return formatted_directories
		end
		
		def describe_files_parser(provider, files)
			formatted_files = []
			files.each do |t|
				case provider
				when CloudConstants::Type::OPENSTACK
					formatted_file = BucketObject.new(t).to_json
				when CloudConstants::Type::EUCA
					formatted_file = {}
					formatted_file[:key] = t[:key]
					formatted_file[:content_length] = t[:size]
					formatted_file[:last_modified] = t[:last_modified]
				else
					formatted_file = t.attributes
				end
				
				#AWS
				#key="pic.jpg",
				#cache_control=nil,
				#content_disposition=nil,
				#content_encoding=nil,
				#content_length=2819,
				#content_md5=nil,
				#content_type="",
				#etag="e91af28af09ad6c105535d2784969c3f",
				#expires=nil,
				#last_modified=2012-06-06 16:47:57 -0500,
				#metadata={},
				#owner=nil,
				#storage_class=nil,
				#encryption=nil,
				#version=nil

				formatted_files << formatted_file
			end
			
			return formatted_files
		end
	end
end
