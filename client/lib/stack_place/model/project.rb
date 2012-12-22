module StackPlace
  class Project
    STANDARD = 'standard'
    EMBEDDED = 'embedded'

    include ActiveModel::Validations

    # basic fields
    attr_accessor :id, :name, :description, :status, :project_type, :region, :owner, :cloud_account, :versions, :provisioned_versions

    def initialize
      @versions = []
      @provisioned_versions = []
    end

    def cloud_account_id
      return (cloud_account.nil? ? nil : cloud_account.id)
    end

    def owner_id
      return (owner.nil? ? nil : owner.id)
    end

  end
end
