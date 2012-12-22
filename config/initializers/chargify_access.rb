#sets Chargify configurations

chargify_config = YAML::load_file(File.join(File.dirname(__FILE__), "..", "chargify.yml"))

Chargify.configure do |c|
  c.subdomain = chargify_config['subdomain']
  c.api_key   = chargify_config['api_key']
end

