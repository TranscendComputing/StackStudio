class ScriptsController < ApplicationController
	include ServiceInterfaceMethods

	PARAMS_REGEX = /^[(REM|rem)]*[\t]*:[\s]*<<'PARAMETERS'(.*?)^\b[(REM|rem)]*\b[ \t\r\n]*PARAMETERS$/m
	PARAM_REGEX = /\w*:\s*\".*\"/

	def get_parameters
		params[:service] = "S3"
		@resource_interface = getResourceInterface(params)
		params[:key]["-"] = "/" unless params[:key]["-"].nil?
		@script = @resource_interface.get_object(params[:bucket], params[:key])
		script_string = @script.match(PARAMS_REGEX).to_s
		parameters_array = script_string.scan PARAM_REGEX
		parameters_hash = Hash.new
		parameters_array.each do |p|
			param = p.split(":")
			parameters_hash[param[0]] = param[1]
		end
		render :json => parameters_hash.to_a
	end
end
