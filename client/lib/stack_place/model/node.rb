class StackPlace::Node
  attr_accessor :id, :name, :x, :y, :view, :element_id, :properties, :node_links

  def initialize
    #@properties = { }
    @node_links = []
  end
end
