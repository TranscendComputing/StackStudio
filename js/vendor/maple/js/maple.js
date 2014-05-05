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
        
        var opts = branch;
        opts.tree = maple;
        opts.show = true;

        branch = _makeBranch(opts, true);

        maple.rootBranches.push(branch);

        $rootTree.append(branch.$el);
      });
		}
	});
});


function Branch ( options ) {
  this.name = options.name;
  this.branches = options.branches;
  this.type = options.type;
  this.cssClass = options.cssClass;
  this.preload = options.preload;
  this.parent = options.parent;
  this.tree = options.tree || this.parent.tree;
  this.onLoaded = options.onLoaded;
  this.onChildrenLoaded = options.onChildrenLoaded;
  this.getData = options.getData;

  var branch = this
    , tree = this.tree;
  
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

  this.render = function () {
    var $parent;
    if(!this.parent) {
      $parent = tree.element.find('.maple-subtree').first();
    } else {
      $parent = this.parent.$el.children('.maple-subtree');
    }
    $parent.append(this.$el);
  }.bind(this);

  this.loadChildren = function ( cb ) {
    
    if(this.$el.hasClass('loading')) {
      return;
    }

    var fetchMethod;
    if(this.url) {
      fetchMethod = "url";
      this.loading = true;
    } else if (this.getData && isFunction(this.getData)) {
      fetchMethod = "function";
      this.loading = true;
    } else {
      fetchMethod = "json";
    }

    switch(fetchMethod) {
      case "url":
        loadFromUrl(branch, cb);
        break;
      case "function":
        var children = branch.getData(function ( children ) {
          branch.$el.removeClass('loading');
          branch.children = children.map(function ( child ) {
            child.parent = branch;
            var newBranch = _makeBranch(child);
            return newBranch;
          });

          branch.loading = false;
          branch.loaded = true;

          if (typeof(cb) !== 'undefined') {
            cb(branch.children);
          }

          if(branch.onChildrenLoaded) {
            branch.onChildrenLoaded(branch.children);
          }
        });
        break;
      case "json":
        if(this.branches) {
          this.children = this.branches.map(function ( childBranch ) {
            childBranch.parent = branch;
            var newBranch = _makeBranch(childBranch);
            return newBranch;
          });
        } else {
          this.children = [];
        }

        if(typeof(cb) !== 'undefined') {
          cb(this.children);
        }
        break;
    }

  }.bind(this);

  this.renderChildren = function () {
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

    $.each(this.children, function ( index, child ) {
      child.render();
    });

    this.populated = true;
    this.onChildrenLoaded = undefined;
    this.$el.addClass('expanded');
  }.bind(this);

  this.populateChildren = function ( e ) {

    //if this is being called from an event, prevent default and propagation
    if(typeof(e) !== 'undefined') {
      e.preventDefault();
      e.stopPropagation();
    }

    if(this.loading) {
      this.$el.addClass('loading');
      this.onChildrenLoaded = this.renderChildren;

      return;
    }

    if(this.loaded) {
      this.renderChildren();
      return;
    }

    this.loadChildren(this.renderChildren);
  }.bind(this);

  this.assignParent = function ( child ) {
    child.parent = this;
    return child;
  };

  if(this.url || (this.getData && isFunction(this.getData))) {
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


  if(this.preload || this.type != 'folder') {
    this.loadChildren();
  }

  if(options.show || this.type == 'folder') {
    this.render();
  }

  return this;
}

function loadFromUrl ( branch, cb ) {
  $.ajax({
    type : 'GET',
    url : branch.url,
    data: branch.data,
    success: function ( result ) {
      
      branch.$el.removeClass('loading');
      if(branch.onLoaded) {
        result = branch.onLoaded(result, branch.$el);
      }
        
      branch.children = result.map(function ( child ) {
        child.parent = branch;
        return _makeBranch(child);
      });

      branch.loading = false;
      branch.loaded = true;

      if(typeof(cb) !== 'undefined') {
        cb(branch.children);
      }

      if(branch.onChildrenLoaded) {
        branch.onChildrenLoaded(branch.children);
      }
    }
  });
}

function _makeBranch ( options, root ) {
  var branchTemplate = '<li class="maple-branch' + (root ? ' maple-root-branch' : '') + '" data-branch="' + options.name + '"><span>' + options.name + '</span><ul class="maple-subtree"></ul></li>';
  
  options.$el = $(branchTemplate);
  var branch = new Branch(options);

  return branch;
}

/* Borrowed from underscore.js */
function isFunction ( obj ) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
}