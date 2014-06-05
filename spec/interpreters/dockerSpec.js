/*jshint smarttabs:true */
/*global define:true console:true describe:true it:true expect:true */
define(
    ['interpreters/docker_interpreter'],
    function(DockerInterpreter) {
	    describe("Docker Test", function() {
            var interpreter = new DockerInterpreter();

		    it("apt-get is callable", function() {
			    var ret = interpreter.exec('apt-get');
			    expect(ret.type).toBe('success');
		    });

            it("service is callable", function() {
                var ret = interpreter.exec('service');
                expect(ret.type).toBe('success');
            });
	    });
    }
);
