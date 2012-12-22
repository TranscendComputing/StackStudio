#sets StackPlace configuration host
require_relative '../../client/lib/stack_place'


StackPlace::Config.host = ENV['STACK_PLACE_SERVICE_ENDPOINT'] || "http://localhost:9292"
$client = StackPlace::HttpClient.new
