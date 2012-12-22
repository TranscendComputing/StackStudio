class StackPlace::ProjectVersion
  attr_accessor :id, :version, :status, :elements, :nodes, :variants, :embedded_projects, :environments

  def initialize
    @properties = { }
    @elements = []
    @nodes = []
    @variants = []
    @embedded_projects = []
    @environments = []
  end
end
