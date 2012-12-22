module StackPlace
  class AccountSubscription
    attr_accessor :org_id, :org_name, :product, :billing_level, :role

    def initialize(org_id=nil, org_name=nil, product=nil, billing_level=nil, role=nil)
      @org_id = org_id
      @org_name = org_name
      @product = product
      @billing_level = billing_level
      @role = role
    end
  end
end
