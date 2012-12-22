require 'open-uri'
require 'pp'
require 'csv'

module StackPlace
  module CLI
    class Admin < CLIBase
      def run(command, args)

        # identity
        if command == "identity.details"
          if args.length != 1
            puts "Usage:\n  stackplace identity.details <account_id>"
            exit(1)
          end
          id = args[0]
          html = @client.identity_details(id)
          if html.nil?
            puts "Not found"
          else
            puts "Identity details for #{id}:"
            puts html
          end
        elsif command == "identity.create"
          if args.length != 4
            puts "Usage:\n  stackplace identity.create <login> <email> <password> <country>"
            exit(1)
          end
          identity = ::StackPlace::Account.new
          identity.login = args[0]
          identity.email = args[1]
          identity.password = args[2]
          identity.password_confirmation = args[2]
          identity.country = args[3]
          details = @client.identity_create(identity)
          puts "New identity details for #{id}:"
          puts "#{pp details}"
        elsif command == "identity.auth"
          if args.length != 2
            puts "Usage:\n  stackplace identity.auth <login> <password>"
            exit(1)
          end
          details = @client.identity_auth(args[0], args[1])
          puts "Authenticated identity details for #{id}:"
          puts "#{pp details}"
        elsif command == "identity.cloud_account_details"
          if args.length != 1
            puts "Usage:\n  stackplace identity.cloud_account_details <cloud_account_id>"
            exit(1)
          end
          id = args[0]
          html = @client.cloud_account_details(id)
          if html.nil?
            puts "Not found"
          else
            puts "Cloud Account details for #{id}:"
            puts html
          end
        elsif command == "identity.create_cloud_account"
          if args.length != 5
            puts "Usage:\n  stackplace identity.create_cloud_account <account_id> <cloud_id> <cloud account name> <access key> <secret key>"
            exit(1)
          end
          cloud_account = ::StackPlace::CloudAccount.new
          cloud_account.name = args[2]
          cloud_account.access_key = args[3]
          cloud_account.secret_key = args[4]
          account = @client.create_cloud_account(args[0], args[1], cloud_account)
          puts "Created cloud account. Account details for #{id}:"
          puts "#{pp account}"
        elsif command == "identity.delete_cloud_account"
          if args.length != 3
            puts "Usage:\n  stackplace identity.delete_cloud_account <account_id> <cloud_id> <cloud account id>"
            exit(1)
          end
          account = @client.create_cloud_account(args[0], args[1], args[2])
          puts "Deleted cloud account. Account details for #{id}:"
          puts "#{pp account}"
        elsif command == "identity.create_key_pair"
          if args.length != 5
            puts "Usage:\n  stackplace identity.create_key_pair <account_id> <cloud account id> <key pair name> <fingerprint> <material>"
            exit(1)
          end
          key_pair = ::StackPlace::KeyPair.new
          key_pair.name = args[2]
          key_pair.fingerprint = args[3]
          key_pair.material = args[4]
          account = @client.create_key_pair(args[0], args[1], key_pair)
          puts "Created key pair. Account details for #{id}:"
          puts "#{pp account}"
        elsif command == "identity.delete_key_pair"
          if args.length != 3
            puts "Usage:\n  stackplace identity.delete_key_pair <account_id> <cloud_id> <cloud account id>"
            exit(1)
          end
          account = @client.create_key_pair(args[0], args[1], args[2])
          puts "Deleted key pair. Account details for #{id}:"
          puts "#{pp account}"

        # Orgs
        elsif command == "org.details"
          if args.length != 1
            puts "Usage:\n  stackplace-admin org.details <org id>"
            exit(1)
          end
          org = @client.org_details(args[0])
          puts "  Org Details: #{org}"
        elsif command == "org.create"
          if args.length != 1
            puts "Usage:\n  stackplace-admin org.create <org name>"
            exit(1)
          end
          create_org = ::StackPlace::Org.new
          create_org.name = args[0]
          org = @client.org_create(create_org)
          puts "  Created Org: #{org}"
        elsif command == "org.update"
          if args.length != 2
            puts "Usage:\n  stackplace-admin org.update <org id> <new org name>"
            exit(1)
          end
          update_org = ::StackPlace::Org.new
          update_org.id = args[0]
          update_org.name = args[1]
          org = @client.org_update(update_org)
          puts "  Updated Org: #{org}"
        elsif command == "org.update_subscription"
          if args.length < 3
            puts "Usage:\n  stackplace-admin org.update_subscription <org id> <product name> <billing level> <billing subscription id> <billing customer id>"
            exit(1)
          end
          update_sub = ::StackPlace::Subscription.new
          update_sub.billing_level = args[2]
          update_sub.billing_subscription_id = args[3]
          update_sub.billing_customer_id = args[4]
          org = @client.update_subscription(args[0], args[1], update_sub)
          puts "  Updated Org afer subscription: #{org}"
        elsif command == "org.add_subscriber"
          if args.length != 4
            puts "Usage:\n  stackplace-admin org.add_subscriber <org id> <product name> <account id> <role>"
            exit(1)
          end
          @client.add_subscriber(args[0], args[1], args[2], args[3])
          puts "  Added account #{args[2]}"
        elsif command == "org.remove_subscriber"
          if args.length != 3
            puts "Usage:\n  stackplace-admin org.remove_subscriber <org id> <product name> <account id>"
            exit(1)
          end
          @client.remove_subscriber(args[0], args[1], args[2])
          puts "  Removed account #{args[2]}"

        # clouds
        elsif command == "cloud.query"
          #puts "Usage:\n  stackplace-admin cloud.details [page num] [per page]"
          page = args[0] || 1
          per_page = args[1] || 20
          query = @client.cloud_query(page, per_page)
          puts "Browsing Clouds: Page ##{query.query.page}"
          puts "  Query results: #{query.query}"
          query.clouds.each do |cloud|
            puts "  cloud: #{pp cloud}"
          end
        elsif command == "cloud.details"
          if args.length != 1
            puts "Usage:\n  stackplace-admin cloud.details <cloud id>"
            exit(1)
          end
          cloud = @client.cloud_details(args[0])
          puts "  Cloud Details: #{cloud}"
        elsif command == "cloud.create"
          if args.length == 0
            puts "Usage:\n  stackplace-admin cloud.create <cloud name> [public] [url] [protocol] [host] [port]"
            exit(1)
          end
          create_cloud = ::StackPlace::Cloud.new
          create_cloud.name = args[0]
          create_cloud.public = ((args[1] || 'true') == 'true')
          create_cloud.url = args[2]
          create_cloud.protocol = args[3]
          create_cloud.host = args[4]
          create_cloud.port = args[5]
          cloud = @client.cloud_create(create_cloud)
          puts "  Created Cloud: #{pp cloud}"
        elsif command == "cloud.update"
          if args.length < 2
            puts "Usage:\n  stackplace-admin cloud.update <cloud id> <cloud name> <public> <url> <protocol> <host> <port>"
            exit(1)
          end
          update_cloud = ::StackPlace::Cloud.new
          update_cloud.id = args[0]
          update_cloud.name = args[1]
          update_cloud.public = (args[2] == 'true')
          update_cloud.url = args[3]
          update_cloud.protocol = args[4]
          update_cloud.host = args[5]
          update_cloud.port = args[6]
          cloud = @client.cloud_update(update_cloud)
          puts "  Updated Cloud: #{pp cloud}"
        elsif command == "cloud.add_service"
          if args.length < 2
            puts "Usage:\n  stackplace-admin cloud.add_service <cloud id> <service_type> [path] [protocol] [host] [port]"
            exit(1)
          end
          service = ::StackPlace::CloudService.new
          service.service_type = args[1]
          service.path = args[2]
          service.protocol = args[3]
          service.host = args[4]
          service.port = args[5]
          @client.add_cloud_service(args[0], service)
          puts "  Added Cloud Service"
        elsif command == "cloud.remove_service"
          if args.length != 2
            puts "Usage:\n  stackplace-admin cloud.remove_service <cloud id> <service_id>"
            exit(1)
          end
          @client.remove_cloud_service(args[0], args[1])
          puts "  Removed Cloud Service"
        elsif command == "cloud.add_mapping"
          if args.length < 3
            puts "Usage:\n  stackplace-admin cloud.add_mapping <cloud id> <name> <mapping_type> [submitted_by]"
            exit(1)
          end
          mapping = ::StackPlace::CloudMapping.new
          mapping.name = args[1]
          mapping.mapping_type = args[2]
          mapping.submitted_by = args[3]
          @client.add_cloud_mapping(args[0], mapping)
          puts "  Added Cloud Mapping"
        elsif command == "cloud.remove_mapping"
          if args.length != 2
            puts "Usage:\n  stackplace-admin cloud.remove_mapping <cloud id> <mapping_id>"
            exit(1)
          end
          @client.remove_cloud_mapping(args[0], args[1])
          puts "  Removed Cloud Mapping"

        # projects
        elsif command == "project.query"
          page = args[0] || 1
          per_page = args[1] || 20
          query = @client.project_query(page, per_page)
          puts "Browsing Projects: Page ##{query.query.page}"
          puts "  Query results: #{query.query}"
          query.projects.each do |project|
            puts "  project: #{pp project}"
          end
        elsif command == "project.open"
          if args.length != 2
            puts "Usage:\n  stackplace-admin project.open <project id> <account id>"
            exit(1)
          end
          project = @client.open_project(args[0], args[1])
          puts "  Project Details: #{pp project}"
        elsif command == "project.create"
          if args.length != 5
            puts "Usage:\n  stackplace-admin project.create <name> <description> <type> <owner_id> <cloud_account_id>"
            exit(1)
          end
          create_project = ::StackPlace::Project.new
          create_project.name = args[0]
          create_project.description = args[1]
          create_project.project_type = args[2]
          owner = ::StackPlace::Account.new
          owner.id = args[3]
          create_project.owner = owner
          cloud_account = ::StackPlace::CloudAccount.new
          cloud_account.id = args[4]
          create_project.cloud_account = cloud_account
          project = @client.project_create(create_project)
          puts "  Created Project: #{pp project}"
        elsif command == "project.update"
          if args.length != 6
            puts "Usage:\n  stackplace-admin project.update <project id> <name> <description> <type> <owner_id> <cloud_account_id>"
            exit(1)
          end
          update_project = ::StackPlace::Project.new
          update_project = ::StackPlace::Project.new
          update_project.id = args[0]
          update_project.name = args[1]
          update_project.description = args[2]
          update_project.project_type = args[3]
          owner = ::StackPlace::Account.new
          owner.id = args[4]
          update_project.owner = owner
          cloud_account = ::StackPlace::CloudAccount.new
          cloud_account.id = args[5]
          update_project.cloud_account = cloud_account
          project = @client.project_update(update_project)
          puts "  Updated Project: #{pp project}"
        elsif command == "project.delete"
          if args.length != 1
            puts "Usage:\n  stackplace-admin project.delete <project id>"
            exit(1)
          end
          @client.project_delete(args[0])
          puts "  Deleted Project"
        elsif command == "project.add_member"
          if args.length != 3
            puts "Usage:\n  stackplace-admin project.add_member <project id> <account_id> <role>"
            exit(1)
          end
          project = @client.add_project_member(args[0], args[1], args[2])
          puts "  Added Project Member:\n #{pp project}"
        elsif command == "project.remove_member"
          if args.length != 2
            puts "Usage:\n  stackplace-admin project.remove_member <project id> <member_id>"
            exit(1)
          end
          project = @client.remove_project_member(args[0], args[1])
          puts "  Removed Project Member\n #{pp project}"
        elsif command == "project.archive"
          if args.length != 1
            puts "Usage:\n  stackplace-admin project.archive <project id>"
            exit(1)
          end
          project = @client.project_archive(args[0])
          puts "  Updated Project:\n #{pp project}"
        elsif command == "project.reactivate"
          if args.length != 1
            puts "Usage:\n  stackplace-admin project.reactivate <project id>"
            exit(1)
          end
          project = @client.project_reactivate(args[0])
          puts "  Updated Project:\n #{pp project}"
        elsif command == "project.freeze_version"
          if args.length < 2
            puts "Usage:\n  stackplace-admin project.freeze_version <project id> <version> [description]"
            exit(1)
          end
          version = ::StackPlace::Version.new
          version.number = args[1]
          version.description = args[2]
          project = @client.project_freeze_version(args[0], version)
          puts "  Updated Project:\n #{pp project}"
        elsif command == "project.add_environment"
          if args.length != 2
            puts "Usage:\n  stackplace-admin project.add_environment <project id> <environment_name>"
            exit(1)
          end
          project = @client.add_project_environment(args[0], args[1])
          puts "  Added Project Environment:\n #{pp project}"
        elsif command == "project.remove_environment"
          if args.length != 2
            puts "Usage:\n  stackplace-admin project.remove_environment <project id> <environment_name>"
            exit(1)
          end
          project = @client.remove_project_environment(args[0], args[1])
          puts "  Removed Project Environment\n #{pp project}"
        elsif command == "project.version_details"
          if args.length != 2
            puts "Usage:\n  stackplace-admin project.version_details <project id> <version_id>"
            exit(1)
          end
          project = @client.project_version_details(args[0], args[1])
          puts "  Project Version Details:\n #{pp project}"
        elsif command == "project.add_element"
          if args.length != 4
            puts "Usage:\n  stackplace-admin project.add_element <project id> <name> <group_name> <element_type>"
            exit(1)
          end
          element = ::StackPlace::Element.new
          element.name = args[1]
          element.group_name = args[2]
          element.element_type = args[3]
          element = @client.add_element(args[0], element)
          puts "  Element Details:\n #{pp element}"
        elsif command == "project.update_element"
          if args.length != 5
            puts "Usage:\n  stackplace-admin project.update_element <project id> <element_id> <name> <group_name> <element_type>"
            exit(1)
          end
          element = ::StackPlace::Element.new
          element.id = args[1]
          element.name = args[2]
          element.group_name = args[3]
          element.element_type = args[4]
          element = @client.update_element(args[0], element)
          puts "  Element Details:\n #{pp element}"
        elsif command == "project.delete_element"
          if args.length != 2
            puts "Usage:\n  stackplace-admin project.delete_element <project id> <element_id>"
            exit(1)
          end
          element = @client.delete_element(args[0], args[2])
          puts "  Element Deleted:\n"
        elsif command == "project.add_node"
          if args.length != 5
            puts "Usage:\n  stackplace-admin project.add_node <project id> <name> <x> <y> <view>"
            exit(1)
          end
          node = ::StackPlace::Node.new
          node.name = args[1]
          node.x = args[2]
          node.y = args[3]
          node.view = args[4]
          node = @client.add_node(args[0], node)
          puts "  Node Details:\n #{pp node}"
        elsif command == "project.update_node"
          if args.length != 6
            puts "Usage:\n  stackplace-admin project.update_node <project id> <node id> <name> <x> <y> <view>"
            exit(1)
          end
          node = ::StackPlace::Node.new
          node.id = args[1]
          node.name = args[2]
          node.x = args[3]
          node.y = args[4]
          node.view = args[5]
          node = @client.update_node(args[0], node)
          puts "  Node Details:\n #{pp node}"
        elsif command == "project.delete_node"
          if args.length != 2
            puts "Usage:\n  stackplace-admin project.delete_node <project id> <node_id>"
            exit(1)
          end
          node = @client.delete_node(args[0], args[1])
          puts "  Node Deleted:\n"
        elsif command == "project.link_nodes"
          if args.length != 3
            puts "Usage:\n  stackplace-admin project.link_nodes <project id> <source_node_id> <target_node_id>"
            exit(1)
          end
          node = @client.link_nodes(args[0], args[1], args[2])
          puts "  Nodes Linked:\n#{pp node}"
        elsif command == "project.add_variant"
          if args.length != 3
            puts "Usage:\n  stackplace-admin project.add_variant <project id> <environment> <rule_type>"
            exit(1)
          end
          variant = ::StackPlace::Variant.new
          variant.environment = args[1]
          variant.rule_type = args[2]
          variant = @client.add_variant(args[0], variant)
          puts "  Variant Details:\n #{pp variant}"
        elsif command == "project.update_variant"
          if args.length != 4
            puts "Usage:\n  stackplace-admin project.update_variant <project id> <variant id> <environment> <rule_type>"
            exit(1)
          end
          variant = ::StackPlace::Variant.new
          variant.id = args[1]
          variant.environment = args[2]
          variant.rule_type = args[3]
          variant = @client.update_variant(args[0], variant)
          puts "  Variant Details:\n #{pp variant}"
        elsif command == "project.delete_variant"
          if args.length != 2
            puts "Usage:\n  stackplace-admin project.delete_variant <project id> <variant_id>"
            exit(1)
          end
          variant = @client.remove_variant(args[0], args[1])
          puts "  Variant Deleted:\n"
        elsif command == "project.add_embedded"
          if args.length != 2
            puts "Usage:\n  stackplace-admin project.add_embedded <project id> <embedded project id>"
            exit(1)
          end
          embedded = @client.add_embedded_project(args[0], args[1])
          puts "  Embedded Project Details:\n #{pp embedded}"
        elsif command == "project.remove_embedded"
          if args.length != 2
            puts "Usage:\n  stackplace-admin project.add_embedded <project id> <embedded project id>"
            exit(1)
          end
          embedded = @client.remove_embedded_project(args[0], args[1])
          puts "  Embedded Project Removed"
        elsif command == "project.add_variant_embedded"
          if args.length != 4
            puts "Usage:\n  stackplace-admin project.add_variant_embedded <project id> <embedded project id> <environment> <rule_type>"
            exit(1)
          end
          variant = ::StackPlace::Variant.new
          variant.environment = args[2]
          variant.rule_type = args[3]
          variant = @client.add_variant_to_embedded_project(args[0], args[1], variant)
          puts "  Variant Details:\n #{pp variant}"
        elsif command == "project.update_variant_embedded"
          if args.length != 5
            puts "Usage:\n  stackplace-admin project.update_variant_embedded <project id> <embedded project id>  <variant id> <environment> <rule_type>"
            exit(1)
          end
          variant = ::StackPlace::Variant.new
          variant.id = args[2]
          variant.environment = args[3]
          variant.rule_type = args[4]
          variant = @client.update_variant_to_embedded_project(args[0], args[1], variant)
          puts "  Variant Details:\n #{pp variant}"
        elsif command == "project.delete_variant_embedded"
          if args.length != 3
            puts "Usage:\n  stackplace-admin project.delete_variant_embedded <project id> <embedded project id>  <variant_id>"
            exit(1)
          end
          variant = @client.remove_variant_from_embedded_project(args[0], args[1], args[2])
          puts "  Variant Deleted:\n"

        # provisioning
        elsif command == "provisioning.details"
          if args.length != 1
            puts "Usage:\n  stackplace-admin provisioning.details <provisioned_version_id>"
            exit(1)
          end
          pv = @client.provisioned_version_details(args[0])
          puts "  Provisioned version details:\n#{pp pv}"
        elsif command == "provisioning.create"
          if args.length != 4
            puts "Usage:\n  stackplace-admin provisioning.create <project id> <provisioned stack name> <version> <environment>"
            exit(1)
          end
          pv = ::StackPlace::ProvisionedVersion.new
          pv.stack_name = args[1]
          pv.version = args[2]
          pv.environment = args[3]
          pv = @client.create_provisioned_version(args[0], pv)
          puts "  Provisioned version created:\n#{pp pv}"
        elsif command == "provisioning.create_instance"
          if args.length != 4
            puts "Usage:\n  stackplace-admin provisioning.create_instance <provisioned_version_id> <instance_type> <resource_id> <instance_id>"
            exit(1)
          end
          pi = ::StackPlace::ProvisionedInstance.new
          pi.instance_type = args[1]
          pi.resource_id = args[2]
          pi.instance_id = args[3]
          pv = @client.create_provisioned_instances(args[0], [pi])
          puts "  Provisioned instances created:\n#{pp pv}"
        elsif command == "provisioning.delete_instance"
          if args.length != 2
            puts "Usage:\n  stackplace-admin provisioning.delete_instance <provisioned_version_id> <instance_id>"
            exit(1)
          end
          pv = @client.remove_provisioned_instance(args[0], args[1])
          puts "  Provisioned instance deleted:\n#{pp pv}"
        elsif command == "provisioning.delete"
          if args.length != 1
            puts "Usage:\n  stackplace-admin provisioning.delete <provisioned_version_id>"
            exit(1)
          end
          pv = @client.remove_provisioned_version(args[0])
          puts "  Provisioned version deleted"

          # reporting
        elsif command == "report.accounts"
          if args.length != 0
            puts "Usage:\n  stackplace-admin report.accounts"
            exit(1)
          end
          report = @client.report_accounts
          puts "  Accounts Report:\n#{pp report}"

        # default
        else
          super(command, args)
        end
      end
    end
  end
end
