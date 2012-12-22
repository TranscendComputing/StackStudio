require 'client_spec_helper'

describe ProjectRepresenter do

  before :each do
    @project = FactoryGirl.build(:project)

    @account_1 = FactoryGirl.build(:account)
    @cloud_account = FactoryGirl.build(:cloud_account)
    @project.cloud_account = @cloud_account
    @project.owner = @account_1
  end

  describe "#to_json" do
    it "should export to json" do
      @project.extend(ProjectRepresenter)
      result = @project.to_json
      result.should eq("{\"project\":{\"id\":\"#{@project.id}\",\"name\":\"#{@project.name}\",\"description\":\"#{@project.description}\",\"project_type\":\"#{@project.project_type}\",\"owner\":{\"id\":\"#{@account_1.id}\",\"login\":\"#{@account_1.login}\"},\"cloud_account\":{\"cloud_account\":{\"id\":\"#{@cloud_account.id}\",\"name\":\"#{@cloud_account.name}\",\"key_pairs\":[]}}}}")
    end
  end

  describe "#from_json" do
    it "should import from json payload" do
      json = "{\"project\":{\"id\":\"#{@project.id}\",\"name\":\"#{@project.name}\",\"description\":\"#{@project.description}\",\"owner\":{\"id\":\"#{@account_1.id}\",\"login\":\"#{@account_1.login}\"},\"cloud_account\":{\"cloud_account\":{\"id\":\"#{@cloud_account.id}\",\"name\":\"#{@cloud_account.name}\",\"key_pairs\":[]}}}}"
      new_project = Project.new
      new_project.extend(ProjectRepresenter)
      new_project.from_json(json)
      new_project.name.should eq(@project.name)
      new_project.description.should eq(@project.description)
      new_project.id.should eq(@project.id)
    end
  end
end
