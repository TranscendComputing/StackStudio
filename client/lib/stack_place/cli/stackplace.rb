require 'open-uri'
require 'pp'

module StackPlace
  module CLI
    class StackPlace < CLIBase
      def run(command, args)
        # TODO: make this more intelligent. I'm hardcoding for now, as no one but the devs are using this (for debugging)
        if command == "template.create"
          import = ::StackPlace::ImportTemplate.new
          if args.length != 2
            puts "Usage:\n  stackplace template.create <name> <path_to_template>"
            exit(1)
          end
          import.name = args[0]
          if args[1][0..3] == 'http'
            import.from_url(args[1])
          else
            import.from_file(File.new(args[1]))
          end
          # log "Request: #{import.to_json}"
          template = @client.template_create(import)
          #log "Response: #{response.body}"
        elsif command == "template.raw"
          if args.length != 1
            puts "Usage:\n  stackplace template.raw <template_id>"
            exit(1)
          end
          id = args[0]
          raw = @client.template_raw(id)
          if raw.nil?
            puts "Not found"
          else
            puts "JSON template for #{id}:"
            puts raw
          end
        elsif command == "template.details"
          if args.length != 1
            puts "Usage:\n  stackplace template.details <template_id>"
            exit(1)
          end
          id = args[0]
          template = @client.template_details(id)
          puts "Template details for #{id}:"
          puts template.to_json
        elsif command == "template.html"
          if args.length != 1
            puts "Usage:\n  stackplace template.html <template_id>"
            exit(1)
          end
          id = args[0]
          html = @client.template_html(id)
          if html.nil?
            puts "Not found"
          else
            puts "Template HTML for #{id}:"
            puts html
          end

          # account
        elsif command == "account.details"
          if args.length != 1
            puts "Usage:\n  stackplace account.details <account_id>"
            exit(1)
          end
          id = args[0]
          summary = @client.account_details(id)
          if summary.nil?
            puts "Not found"
          else
            puts "Account details for #{id}:"
            puts summary.inspect
          end

          # stacks
        elsif command == "stack.query"
          page = args[0] || 1 # optional page #
          per_page = args[1] || 20 # optional per page
          stack_query = @client.stack_query(page, per_page)
          puts "Browsing Stacks: Page ##{stack_query.query.page}"
          puts "  Query results: #{stack_query.query.inspect}"
          stack_query.stacks.each do |stack|
            puts "  Stack: #{stack.inspect}"
          end
        elsif command == "stack.create"
          if args.length < 3
            puts "Usage:\n  stackplace stack.create <name> <desc> <account_id> [template_id]"
            exit(1)
          end
          create_stack = ::StackPlace::CreateStack.new
          create_stack.name = args[0]
          create_stack.description = args[1]
          create_stack.account_id = args[2]
          create_stack.template_id = args[3]
          stack = @client.stack_create(create_stack)
          puts "  Created Stack: #{stack.inspect}"
        elsif command == "stack.details"
          if args.length != 1
            puts "Usage:\n  stackplace stack.details <stack_id>"
            exit(1)
          end
          stack = @client.stack_details(args[0])
          puts "  Stack details for #{args[0]}:"
          puts "#{stack.inspect}"

        else
          super(command, args)
        end
      end

    end
  end
end

