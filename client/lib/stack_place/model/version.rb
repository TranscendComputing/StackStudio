class StackPlace::Version
  attr_accessor :number, :description, :environments
  
  def initialize
    @environments = []
  end  
end
