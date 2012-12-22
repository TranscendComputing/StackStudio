class StackPlace::EmbeddedProject
  attr_accessor :id, :embedded_project_id, :embedded_project_name, :variants

  def initialize
    @variants = []
  end
end
