module StackPlace
  class Stack
    attr_accessor :id, :name, :description, :support_details, :license_agreement, :image_name, :image_data, :permalink, :public, :downloads, :account, :category, :templates, :resource_groups, :created_at, :updated_at

    RESOURCE_GROUP_MAPPINGS = {
      "identity"         =>  "IAM.png",
      "load_balancing"   =>  "NewLB.png",
      "auto_scaling"     =>  "Autoscale.png",
      "compute"          =>  "NewBasicServer.png",
      "datastore"        =>  "NewDB.png",
      "notification"     =>  "NotificationService.png",
      "monitoring"       =>  "CloudWatch.png",
      "cloud_formation"  =>  "CFStack.png",
      "caching"          =>  "CacheNew.png",
      "cdn"              =>  "CloudFront.png",
      "app_deploy"       =>  "NewBeanstalk.png",
      "dns"              =>  "Route53.png",
      "simple_storage"   =>  "NewSimpleStorage.png",
      "simple_db"        =>  "NewDB.png",
      "queue"            =>  "NewDB.png",
      "other"            =>  "Internet.png"
    }


    def initialize
      @templates = Array.new
      @resource_groups = Array.new
    end

    def split_permalink
      (self.permalink || "").split("/")
    end

    def icon_for_resource_group(resource_group)
      RESOURCE_GROUP_MAPPINGS[resource_group]
    end
  end
end
