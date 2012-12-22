module StackPlace
  module OrgRepresenter
    include Roar::Representer::JSON

    # wrap the fields e.g. { "model_name" : { ...fields... }
    self.representation_wrap = :org

    property :id
    property :name
	collection :accounts, :class=>StackPlace::Account, :extend => StackPlace::AccountRepresenter
    collection :subscriptions, :class=>StackPlace::Subscription, :extend => StackPlace::SubscriptionRepresenter
    collection :cloud_mappings, :class=>StackPlace::CloudMapping, :extend => StackPlace::CloudMappingRepresenter
  end
end
