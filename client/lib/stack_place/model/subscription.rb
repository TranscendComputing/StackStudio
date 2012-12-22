module StackPlace
  class Subscription
    attr_accessor :product, :billing_level, :billing_subscription_id, :billing_customer_id, :subscribers

    def initialize
      @subscribers = Array.new
    end
  end
end
