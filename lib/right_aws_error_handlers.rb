module RightAwsErrorHandlers
	def generateJsonErrorMessage(error)
		return JSON.parse(error.to_json)
	end
end
