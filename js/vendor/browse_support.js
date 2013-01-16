function checkbox_toggled() {
    the_checkbox = jQuery(this);
    cat_filter_list = [];
    if(the_checkbox.val() == "all" && the_checkbox.is(':checked')) {
	// uncheck all that have a value != 'all' and update the list with no filter
	jQuery(".filters input[type=checkbox]").attr("checked", false);
	jQuery("#category_filter_all").attr("checked", true);
    } else if (jQuery(".filters input[type=checkbox]:checked").length == 0) {
	jQuery("#category_filter_all").attr("checked", true);
    } else {
	jQuery("#category_filter_all").attr("checked", false);
	jQuery.each(jQuery(".filters input[type=checkbox]"), function(index, chkbx) { 
	    if(jQuery(chkbx).val() != 'all' && jQuery(chkbx).is(':checked')) {
		cat_filter_list.push(jQuery(chkbx).val());
	    }
	});	// uncheck 'all' and update the list with a filtered result
    }
    jQuery.get('/browse/list?categories='+cat_filter_list.join(','), function(data) {
	jQuery('#stack_list').html(data);
	attach_stack_link_listeners();
	attach_pagination_link_listeners();
    });	  
}

// If a stack is selected from the list, load it into the content pane
function attach_stack_link_listeners() {
    jQuery('.stack_link a').click(function() {
	jQuery.get(this.href, function(data) {
	    jQuery('#content').html(data);
	    attach_doc_listeners(); // template_support.js
	    attach_view_source_listeners(); 
	    jQuery('#source_view').hide();
	});	  
	return false;
    });
}

// if the stack list is paginated, refresh the list and attach listeners to the new links
function attach_pagination_link_listeners() {
    jQuery('.nav a').click(function() {
	jQuery.get(this.href, function(data) {
	    jQuery('#stack_list').html(data);
	    attach_stack_link_listeners();
	    attach_pagination_link_listeners();
	});	  
	return false;
    });
}

function attach_view_source_listeners() {
    jQuery('#view_source_link').click(function() {
	jQuery('#view_doc_link').show();
	jQuery('#view_source_link').hide();
	jQuery('#standard_view').hide();
	jQuery('#source_view').show();
	return false;
    });
    jQuery('#view_doc_link').click(function() {
	jQuery('#view_doc_link').hide();
	jQuery('#view_source_link').show();
	jQuery('#standard_view').show();
	jQuery('#source_view').hide();
	return false;
    });
}

// when the page is loaded, initialize the listeners
jQuery(document).ready(function() {
    // attach listeners to each listed stack link
    attach_stack_link_listeners();

    // attach listeners to the pagination links, to refresh the list using AJAX
    attach_pagination_link_listeners();

    // bind the filter headings as collapsable. The template_support.js script will do the rest
    jQuery(".filters").addClass('collapsed');
    jQuery(".filters").addClass('expanded');
    jQuery(".filters > .filter_name").click(toggle_collapsed);

    // bind the checkboxes to the handler
    jQuery(".filters input[type=checkbox]").click(checkbox_toggled);
});
