module StackPlace
  class CloudMapping
    attr_accessor :id, :name, :mapping_type, :submitted_by, :properties, :mapping_entries

    def initialize
      @properties = Hash.new
      @mapping_entries = Array.new
    end
  end
end
