module StackPlace
  module SubscriberRepresenter
    include Roar::Representer::JSON

    # wrap the fields e.g. { "model_name" : { ...fields... }
    # self.representation_wrap = :subscriber

    property :account, :class=>StackPlace::Account, :extend => StackPlace::AccountSummaryRepresenter
    property :role
  end
end
