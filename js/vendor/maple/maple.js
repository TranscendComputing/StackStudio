$(function () {
	$.widget('msi.maple', {

		options : {
			tree : {}
		},

		_create : function () {
      var maple = this;

			this.tree = this.options.tree;
      this.rootBranches = [];
      var $rootTree = $('<ul class="maple-tree">');
      this.element.append($rootTree);

      $.each(this.tree.branches, function ( index, branch ) {
          
        var branch = maple._makeBranch({
          name : branch.name,
          url : branch.url,
          tree : maple,
          children : branch.children
        }, true);

        maple.rootBranches.push(branch);
        $rootTree.append(branch.$el);

      });
		},

    _makeBranch : function ( options, root ) {
      var branchTemplate = '<li class="maple-branch' + (root ? ' maple-root-branch' : '') + '" data-branch="' + options.name + '"><span>' + options.name + '</span><ul class="maple-subtree"></ul></li>';
      //var branchTemplate = '<div></div>'
      options.$el = $(branchTemplate);
      var branch = new Branch(options, this);
      
      // this.element.on('click', '[data-branch="' + options.name + '"]', function ( e ) {
      //   branch.populateChildren();
      // });

      return branch;
    }
	});
});

function Branch ( options, tree ) {
  var branch = this;
  this.name = options.name;
  this.url = options.url;
  this.$el = options.$el;
  this.data = options.data || { branch : options.name }
  this.children = options.children || [];

  this.populateChildren = function () {
    var tree = this;

    $.ajax({
      type : 'GET',
      url : branch.url,
      data: branch.data,
      success: function ( result ) {
        if (options.onLoad) {
          result = options.onLoad(result);
        }

        branch.children = result;
        $.each(branch.children, function ( index, child ) {
          var subBranch = tree._makeBranch({
            name : child.name,
            url : child.url,
            tree : tree
          });

          branch.$el.find('.maple-subtree').append(subBranch.$el);
        });
      }
    });
  }

  this.$el.on('click', this.populateChildren);

  return this;
}