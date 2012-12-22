module StackPlace
  module UpdateOrgRepresenter
    include Roar::Representer::JSON

    # wrap the fields e.g. { "model_name" : { ...fields... }
    self.representation_wrap = :org

    property :name
	collection :accounts, :class=>StackPlace::Account, :extend=>StackPlace::AccountRepresenter
  end
end
