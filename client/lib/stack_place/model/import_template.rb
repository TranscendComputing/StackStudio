module StackPlace
  class ImportTemplate
    include ActiveModel::Validations

    attr_accessor :name, :import_source, :json

    validates_presence_of :name
    validates_presence_of :import_source
    validates_presence_of :json
    validate :must_be_valid_json

    def must_be_valid_json
      return false if json.nil? or json.empty?
      begin
        JSON.parse(json)
        return true
      rescue JSON::ParserError => e
        errors.add(:json, "Invalid JSON format")
        return false
      end
    end

    def from_source(json)
      self.json = json
      self.import_source = StackPlace::Template::FROM_SOURCE
    end

    def from_file(file)
      self.json = file.readlines.join("")
      self.import_source = StackPlace::Template::FROM_FILE
    end

    def from_url(url)
      self.json = open(url).readlines.join("")
      self.import_source = StackPlace::Template::FROM_URL
    end

    # base64 encode the json payload. Used for over-the-wire transmission of JSON payloads when creating a new template
    def json_base64
      return Base64.encode64(self.json) unless self.json.nil? or self.json.empty?
    end

    # base64 decode the given encoded json payload. Used for over-the-wire transmission of JSON payloads when creating a new template
    def json_base64=(encoded)
      self.json = Base64.decode64(encoded) unless encoded.nil? or encoded.empty?
    end
  end
end
