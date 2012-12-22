module StackPlace
  class CreateStack
    include ActiveModel::Validations

    attr_accessor :name, :description, :support_details, :license_agreement, :image_name, :image_data, :public, :account_id, :template_id, :category_id

    validates_presence_of :name
    validates_presence_of :account_id
    validates_presence_of :category_id
  end
end
