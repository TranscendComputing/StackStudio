/*jshint smarttabs:true */
/*global define:true console:true describe:true it:true expect:true */
define(['collections/stacks'], function(StackList) {
    var stackList = new StackList();

    describe("StackList Collection", function() {
        it("verify URL is as intended", function() {
            expect(stackList.url).toContain('/stackstudio/v1/stacks/account/');
        });
    });
});
