module StackPlace
  module CLI
    class CLIBase

      attr_accessor :verbose

      def initialize(verbose=false)
        @verbose = verbose
        @client = ::StackPlace::HttpClient.new
        @client.verbose! if verbose?
      end

      def verbose?
        !!@verbose
      end

      def run(command, args)
        puts "Command not found: #{command}"
      end

      protected

      def log(message)
        puts message if verbose?
      end
    end
  end
end
