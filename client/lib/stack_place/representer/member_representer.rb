module StackPlace::MemberRepresenter
  include Roar::Representer::JSON

  # wrap the fields e.g. { "model_name" : { ...fields... }
  self.representation_wrap = true

  property :id
  property :account, :class=>StackPlace::Account, :extend=>StackPlace::AccountSummaryRepresenter
  property :role
  collection :permission, :class=>StackPlace::Permission, :extend=>StackPlace::PermissionRepresenter
end
