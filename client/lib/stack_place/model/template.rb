module StackPlace
  class Template
    include ActiveModel::Validations

    CLOUD_FORMATION = "cloud_formation"
    FROM_SOURCE = 'source'
    FROM_FILE = 'file'
    FROM_URL = 'url'

    attr_accessor :id, :stack_id, :template_type, :name, :import_source, :json, :stack

    validates_presence_of :name
    validates_presence_of :import_source
    validates_presence_of :json

    def html
      if respond_to?(:links) and links[:html]
        return StackPlace::Client.get(links[:html])
      end
      nil
    end

    def published?
      return (!self.stack_id.nil?)
    end
  end
end
