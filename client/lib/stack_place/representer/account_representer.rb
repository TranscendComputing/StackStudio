module StackPlace
  module AccountRepresenter
    include Roar::Representer::JSON

    # wrap the fields e.g. { "model_name" : { ...fields... }
    self.representation_wrap = true

    property :id
	property :org_id
    property :login
    property :email
    property :first_name
    property :last_name
    property :password
    property :country_code
    property :company
	collection :permissions, :class=>StackPlace::Permission, :extend => StackPlace::PermissionRepresenter
    collection :subscriptions, :class=>StackPlace::AccountSubscription, :extend => StackPlace::AccountSubscriptionRepresenter
    collection :cloud_accounts, :class=>StackPlace::CloudAccount, :extend => StackPlace::CloudAccountRepresenter
    collection :project_memberships, :class=>StackPlace::ProjectMembership, :extend => StackPlace::ProjectMembershipRepresenter
  end
end
