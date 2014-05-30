/*jshint smarttabs:true */
/*global define:true console:true describe:true it:true expect:true */
define(['collections/stacks'], function(StackList) {
    describe("StackList Collection", function() {
        var stackList = new StackList();

        it("verify URL is as intended", function() {
            expect(stackList.url).toContain('/stackstudio/v1/stacks/account/');
        });
    });
});
