module StackPlace::ProjectMembershipRepresenter
  include Roar::Representer::JSON

  # wrap the fields e.g. { "model_name" : { ...fields... }
  self.representation_wrap = :membership

  property :project_id
  property :project_name
  property :role
  property :project_status
  property :last_opened_at
end
