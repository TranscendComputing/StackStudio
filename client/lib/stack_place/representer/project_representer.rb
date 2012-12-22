module StackPlace::ProjectRepresenter
  include Roar::Representer::JSON

  # wrap the fields e.g. { "model_name" : { ...fields... }
  self.representation_wrap = true

  property :id
  property :name
  property :description
  property :status
  property :project_type
  property :region
  property :owner, :class=>StackPlace::Account, :extend => StackPlace::AccountSummaryRepresenter
  property :cloud_account, :class=>StackPlace::CloudAccount, :extend => StackPlace::CloudAccountRepresenter
  collection :versions, :class=>StackPlace::Version, :extend=>StackPlace::VersionRepresenter
  collection :provisioned_versions, :class=>StackPlace::ProvisionedVersion, :extend=>StackPlace::ProvisionedVersionSummaryRepresenter
end
