__LIB_DIR__ = File.expand_path(File.join(File.dirname(__FILE__)))

$LOAD_PATH.unshift __LIB_DIR__ unless
  $LOAD_PATH.include?(__LIB_DIR__) ||
  $LOAD_PATH.include?(File.expand_path(__LIB_DIR__))

# external gem dependencies
require 'json'
require 'uri'
require 'roar/representer/json'
require 'roar/representer/feature/hypermedia'

# internal cli dependencies
require 'stack_place'
require 'stack_place/http_client'
require 'stack_place/cli/cli_base'
require 'stack_place/cli/stackplace'
