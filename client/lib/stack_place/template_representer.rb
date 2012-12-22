module TemplateRepresenter
  include Roar::Representer::JSON
  include Roar::Representer::Feature::Hypermedia

  property :id
  property :name
  property :stack_id
  property :template_type
  property :import_source

  # Possible approach: use Hypermedia support on the service's
  # Representers and a separate Representer for the client that knows
  # how to decode the links manually (without Roar, just Representable
  # gem). Requires maintaining two different representers, but that
  # may be ok, since we are packaging the service client for separate
  # distribution. Perhaps the server and client representers share a
  # common one in core, but customize for generated or consumed link
  # support?

  # NOTE: This currently executes for both to_json and from_json,
  # meaning that clients are actually generating the links, rather
  # than just capturing what is sent from the server
  # link :html do
  #   puts "*** HERE!!!"
  #   "/foo/bar"
  # end
  #
  # link :raw do
  #   ""
  # end
end
