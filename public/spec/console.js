/*jshint smarttabs:true */
/*global define:true console:true describe:true it:true expect:true */
define(['interpreters/cloud_interpreter'], function(CloudInterpreter) {
	describe("Console", function() {
		it("cloud-run-instances is callable", function() {
			var ret;
			var interpreter = new CloudInterpreter();
			ret = interpreter.exec('cloud-run-instances');
			expect(ret.type).toBe('success');
		});

		it("cloud-describe-instances is callable", function() {
			var ret;
			var interpreter = new CloudInterpreter();
			ret = interpreter.exec('cloud-describe-instances');
			expect(ret.type).toBe('success');
		});

	});
});

