/*jshint smarttabs:true */
/*global define:true console:true describe:true it:true expect:true afterEach:true beforeEach:true waitsFor:true */
define([
    'jquery',
    'models/compute/compute',
    'views/compute/computeCreateView'
], function($, Compute, ComputeCreateView) {
    var flag = false,
        that = this;
    return describe('View:: Create Instance', function() {
        beforeEach(function() {
            that.compute = new Compute();
            that.view = new ComputeCreateView({model: that.compute});
            that.mockData = { 
                name: 'MyInstance',
                description: 'Instance Description',
                instanceId: 'i-12345678',
                imageId: 'ami-12345678',
                imageName: 'Ubuntu-12.0',
                zone: 'us-east-1a',
                state: 'running',
                keypairName: 'specrunner',
                publicIp: '0.0.0.0',
                privateIp: '0.0.0.0',
                running: true
            };
            $("#sandbox").html(that.view.el);
            flag = true;
            
            waitsFor(function() {
                return flag;
            });
        });
        
        afterEach(function() {
            this.view.remove();
        });
        
        describe('Opens And Closes', function() {
            it('should be open', function() {
                expect(this.view.$el.dialog("isOpen")).toEqual(true);
            });
        });        
    });
});
