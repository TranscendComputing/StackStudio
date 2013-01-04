  //
  // Toggles the state of a section, usually attached as a click() event on an element.
  //
  // Expected element structure:
  //
  // parent ==> class=['collapsed'|'expanded'] <-- class that controls the expanded/collapsed indicator
  //   element ==> click(toggle_collapsed) <-- gets the click event and bound to this function
  //   element ==> class='expanded' <-- show/hide. Given .collapsed or .expanded class based on state
  //
  function toggle_collapsed()
  {
    the_parent = jQuery(jQuery(this).parent());
    the_child = the_parent.children(".expandable");
    if(the_child.is(":visible")) {
      the_parent.removeClass('expanded');
    } else {
      the_parent.addClass('expanded');
    }
    the_parent.children(".expandable").slideToggle(500);
  }

  function show_source_view()
  {
    jQuery("#standard_view").hide();
    jQuery("#source_view").show();
  }

  function show_standard_view()
  {
    jQuery("#source_view").hide();
    jQuery("#standard_view").show();
  }

  function attach_doc_listeners() {
    // apply the default classes to elements, to prevent littering this within the HTML
    jQuery(".resource").addClass('collapsed');
    jQuery(".parameter").addClass('collapsed');
    jQuery(".mapping_set").addClass('collapsed');

    // toggle the components that support expand/contract
    jQuery(".collapsed > .name").click(toggle_collapsed);
  }

  jQuery(document).ready(function() {
      attach_doc_listeners();
  });
