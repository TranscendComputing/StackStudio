class ApiController < ApplicationController

	def publish_stack
		#Create Stack and Template		
		template = StackPlace::ImportTemplate.new
		template.name = params["template_name"].to_s + " " + params["version"].to_s
		template.from_source(params["raw_json"])
		created_template = $client.template_create(template)

		stack = StackPlace::CreateStack.new
		stack.name = params["template_name"]
		stack.description = params["description"]
		stack.category_id = params["category_id"]
		stack.account_id = params["user_id"]
		stack.support_details = params["support_details"]
		stack.license_agreement = params["license_agreement"]
		stack.image_name = params["image_name"]
		stack.image_data = params["image_data"]
		stack.template_id = created_template.id
		created_stack = $client.stack_create(stack)
		
		render :nothing => true
	end
	

end