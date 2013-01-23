/*jshint smarttabs:true */
/*global define:true console:true describe:true it:true expect:true afterEach:true beforeEach:true waitsFor:true */
define([
    'jquery',
    'views/resourceNavigationView',
    '/js/aws/views/compute/awsInstancesAppView.js'
], function($, ResourceNavigationView, AwsInstancesAppView) {

    return describe('View:: Show AWS Instances', function() {
        beforeEach(function() {
            var flag = false,
                that = this;
            that.view = new ResourceNavigationView();
            that.view.cloudPath = 'aws';
            that.view.typePath = 'compute';
            that.view.subtypePath = 'instances';
            that.resourceApp = this.view.resourceApp;

            $("#sandbox").html(that.view.render().el);
            flag = true;
            
            waitsFor(function() {
                return flag;
            });
        });
        
        afterEach(function() {
            this.view.remove();
        });
        
        describe('Renders Instances Table', function() {
            it('should be open', function() {
                this.view.loadResourceApp("aws", this.view.typePath, this.view.subtypePath, this.view.idPath);
                console.log(this.resourceApp);
                expect( this.resourceApp instanceof AwsInstancesAppView ).toBeTruthy();
            });
        });        
    });
});
