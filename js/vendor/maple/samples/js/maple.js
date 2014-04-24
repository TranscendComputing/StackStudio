$(function () {
	$.widget('msi.maple', {

		options : {
			tree : {}
		},

		_create : function () {
      $(this.element).addClass('maple-wrapper');
      
      var maple = this;
			maple.tree = maple.options.tree;
      maple.rootBranches = [];
      var $rootTree = $('<ul class="maple-tree">');
      maple.element.append($rootTree);

      $.each(maple.tree.branches, function ( index, branch ) {
          
        branch.tree = maple;
        branch = maple._makeBranch(branch, true);

        maple.rootBranches.push(branch);

        $rootTree.append(branch.$el);
      });
		},

    _makeBranch : function ( options, root ) {
      var branchTemplate = '<li class="maple-branch' + (root ? ' maple-root-branch' : '') + '" data-branch="' + options.name + '"><span>' + options.name + '</span><ul class="maple-subtree"></ul></li>';
      
      options.$el = $(branchTemplate);
      var branch = new Branch(options, this);

      return branch;
    }
	});
});


function Branch ( options, tree ) {
  var branch = this;

  this.name = options.name;
  this.branches = options.branches;
  this.type = options.type;
  this.cssClass = options.cssClass;
  
  if(options.url ) {
    this.url = options.url;
  }

  this.$el = options.$el;

  //add data attributes
  if(options.attributes) {
    for(var i in options.attributes) {
      if(options.attributes.hasOwnProperty(i)) {
        branch.$el.attr('data-' + i, options.attributes[i]);
      }
    }
  }
  

  if(options.cssClass) {
    this.$el.addClass(options.cssClass);
  }

  if(options.type === 'folder') {
    this.$el.addClass('maple-folder');
    this.$icon = $('<img class="maple-icon">');
    this.$el.prepend(this.$icon);
  } else {
    this.$el.addClass('maple-item');
  }

  this.data = options.data || {};
  this.children = options.children || [];
  this.onClicked = options.onClicked;

  this.populateChildren = function ( e ) {
    e.preventDefault();
    e.stopPropagation();

    if(branch.populated) {

      if(branch.$el.hasClass('maple-collapsed')) {
        branch.$el.children('.maple-subtree').show();
        branch.$el.addClass('expanded');
        branch.$el.removeClass('maple-collapsed');  
      } else {
        branch.$el.children('.maple-subtree').hide();
        branch.$el.removeClass('loading');
        branch.$el.removeClass('expanded');
        branch.$el.addClass('maple-collapsed');
      }
      return;
    }

    branch.$el.addClass('loading');

    $.ajax({
      type : 'GET',
      url : branch.url,
      data: branch.data,
      success: function ( result ) {
        
        branch.$el.removeClass('loading');
        branch.$el.addClass('expanded');

        if(options.onLoaded) {
          result = options.onLoaded(result, branch.$el);
        }
          
        branch.children = result;

        renderChildren(branch.children, branch, tree);

        branch.populated = true;
      }
    });
  }

  if(this.url) {
    if(this.$icon) {
      this.$icon.on('click', this.populateChildren);
    } else {
      if(tree.options.populateOnBranchClick === true) {
        this.$el.on('click', this.populateChildren);  
      }
    }
  }

  if(this.onClicked) {
    this.$el.children('span').on('click', function ( e ) {
      e.stopPropagation();
      branch.onClicked.call(e, branch.$el, options);
    });

    this.$el.children('span').css('cursor', 'pointer');
  }
  

  if (branch.branches && branch.branches.length) {
    renderChildren(branch.branches, branch, tree);
  }

  return this;
}

function renderChildren ( children, parent, tree ) {
  $.each(children, function ( index, child ) {
          
    child.tree = tree;
    var subBranch = tree._makeBranch(child);

    parent.$el.children('.maple-subtree').append(subBranch.$el);
  });
}