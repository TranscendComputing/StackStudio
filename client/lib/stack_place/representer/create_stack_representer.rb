module StackPlace
  module CreateStackRepresenter
    include Roar::Representer::JSON

    # wrap the fields e.g. { "model_name" : { ...fields... }
    self.representation_wrap = :stack

    property :name
    property :description
    property :public
    property :account_id
    property :template_id
    property :category_id
  end
end
