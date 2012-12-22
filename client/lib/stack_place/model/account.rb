module StackPlace
  class Account
    include ActiveModel::Validations

    # basic fields
    attr_accessor :id, :org_id, :login, :email, :first_name, :last_name, :country_code, :company, :terms_of_service, :subscriptions, :permissions, :cloud_accounts, :project_memberships
    validates_presence_of :login
    validates_presence_of :email
    validates_presence_of :password, :unless => :id
    validates_presence_of :country_code
    validates_acceptance_of :terms_of_service, :allow_nil=>false

    # for setting/resetting passwords. Will not reset a password if not provided on an update
    attr_accessor :password, :password_confirmation
    validates_confirmation_of :password,  :if => :password

    def initialize
      @subscriptions = []
	  @permissions = []
      @cloud_accounts = []
      @project_memberships = []
    end
  end
end
