#
# Represents an Account's role within a project. Typical roles include: owner, member
#
class StackPlace::Member
  OWNER = 'owner'
  MEMBER = 'member'

  include ActiveModel::Validations

  attr_accessor :id, :account, :role, :permissions

  validates_presence_of :account
  validates_presence_of :role

  def account_id
    (account.nil? ? nil : account.id)
  end
end
