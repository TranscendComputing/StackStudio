module StackPlace
  module StackRepresenter
    include Roar::Representer::JSON

    # wrap the fields e.g. { "model_name" : { ...fields... }
    self.representation_wrap = true

    property :id
    property :name
    property :description
	property :support_details
	property :license_agreement
	property :image_name
	property :image_data
    property :permalink
    property :public
    property :downloads
    property :created_at
    property :updated_at
    property :account, :class=>StackPlace::Account, :extend => StackPlace::AccountSummaryRepresenter
    property :category, :class=>StackPlace::Category, :extend => StackPlace::CategorySummaryRepresenter
    collection :templates, :class=>StackPlace::Template, :extend => StackPlace::TemplateRepresenter
    collection :resource_groups
  end
end
