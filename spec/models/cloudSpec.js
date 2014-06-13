/*jshint smarttabs:true */
/*global define:true console:true describe:true it:true expect:true */
define(
    [
        'jquery',
        'common',
        'models/cloud'
    ],
    function($, Common, Cloud) {
        describe("Read and write model attributes via Backbone get/set", function() {
            var cloud;

            beforeEach(function() {
                var mockdata = {
                    id: '12345',
                    name: 'Test Cloud Model',
                    cloud_provider: 'The Best One',
                    cloud_mappings: [],
                    created_at: '2014-06-10',
                    updated_at: '2014-06-10',
                    permalink: 'http://www.google.com',
                    prices: []
                };
    
                cloud = new Cloud(mockdata);
            });
    
            afterEach(function() {
                cloud = undefined;
            });

            it("should be able to read and write id attribute", function() {
                expect(cloud.get('id')).toEqual('12345');
                cloud.set('id', '54321');
                expect(cloud.get('id')).toEqual('54321');
            });

            it("should properly read and write name attribute", function() {
                expect(cloud.get('name')).toEqual('Test Cloud Model');
                cloud.set('name', 'Model Cloud Test');
                expect(cloud.get('name')).toEqual('Model Cloud Test');
            });

            it("should properly read and write cloud_provider attribute", function() {
                expect(cloud.get('cloud_provider')).toEqual('The Best One');
                cloud.set('cloud_provider', 'One Best The');
                expect(cloud.get('cloud_provider')).toEqual('One Best The');
            });

            it("should properly read and write created_at attribute", function() {
                expect(cloud.get('created_at')).toEqual('2014-06-10');
                cloud.set('created_at', '2014-06-11');
                expect(cloud.get('created_at')).toEqual('2014-06-11');
            });

            it("should properly read and write updated_at attribute", function() {
                expect(cloud.get('updated_at')).toEqual('2014-06-10');
                cloud.set('updated_at', '2014-06-11');
                expect(cloud.get('updated_at')).toEqual('2014-06-11');
            });

            it("should properly read and write permalink attribute", function() {
                expect(cloud.get('permalink')).toEqual('http://www.google.com');
                cloud.set('permalink', 'http://www.yahoo.com');
                expect(cloud.get('permalink')).toEqual('http://www.yahoo.com');
            });
        });

        describe("Read and write model attributes via Backbone fetch() and save()", function() {
            var cloud;

            beforeEach(function() {
                var mockdata = {
                    cloud: {
                        id: '12345',
                        name: 'Test Cloud Model',
                        cloud_provider: 'The Best One',
                        cloud_mappings: [],
                        created_at: '2014-06-10',
                        updated_at: '2014-06-10',
                        permalink: 'http://www.google.com',
                        prices: []
                    }
                };

                spyOn($, 'ajax').andCallFake(function(options) {
                    // handle calls to save() by merging in new options values and return
                    if (options.type === 'PUT' && options.data) {
                        mockdata.cloud = $.extend({}, mockdata.cloud, JSON.parse(options.data));
                    }

                    if (options.type === 'DELETE') {
                        mockdata.cloud = {};
                    }

                    options.success(mockdata);
                });
    
                cloud = new Cloud();
                cloud.url = Common.apiUrl + '/stackstudio/v1/clouds';
                cloud.fetch();
            });
    
            afterEach(function() {
                cloud = undefined;
            });

            it("should properly read and write id attribute", function() {
                expect(cloud.get('id')).toEqual('12345');
                cloud.save({id: '54321'});
                expect(cloud.get('id')).toEqual('54321');
            });

            it("should properly read and write name attribute", function() {
                expect(cloud.get('name')).toEqual('Test Cloud Model');
                cloud.save({name: 'Model Cloud Test'});
                expect(cloud.get('name')).toEqual('Model Cloud Test');
            });

            it("should properly read and write cloud_provider attribute", function() {
                expect(cloud.get('cloud_provider')).toEqual('The Best One');
                cloud.save({cloud_provider: 'One Best The'});
                expect(cloud.get('cloud_provider')).toEqual('One Best The');
            });

            it("should properly read and write created_at attribute", function() {
                expect(cloud.get('created_at')).toEqual('2014-06-10');
                cloud.save({created_at: '2014-06-11'});
                expect(cloud.get('created_at')).toEqual('2014-06-11');
            });

            it("should properly read and write updated_at attribute", function() {
                expect(cloud.get('updated_at')).toEqual('2014-06-10');
                cloud.save({updated_at: '2014-06-11'});
                expect(cloud.get('updated_at')).toEqual('2014-06-11');
            });

            it("should properly read and write permalink attribute", function() {
                expect(cloud.get('permalink')).toEqual('http://www.google.com');
                cloud.save({permalink: 'http://www.yahoo.com'});
                expect(cloud.get('permalink')).toEqual('http://www.yahoo.com');
            });

            it("should properly delete cloud model", function() {
                expect(cloud.destroy()).toBeUndefined();
                // Properly destroyed Backbone model returns model that was destroyed
                expect(
                    cloud.get('id') === '12345' &&
                    cloud.get('name') === 'Test Cloud Model' &&
                    cloud.get('cloud_provider') === 'The Best One' &&
                    cloud.get('created_at') === '2014-06-10' &&
                    cloud.get('updated_at') === '2014-06-10' &&
                    cloud.get('permalink') === 'http://www.google.com'
                ).toBeTruthy();
            });
        });
    }
);
