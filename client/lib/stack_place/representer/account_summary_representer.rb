module StackPlace
  module AccountSummaryRepresenter
    include Roar::Representer::JSON

    property :id
	property :org_id
    property :login
    property :first_name
    property :last_name
  end
end
