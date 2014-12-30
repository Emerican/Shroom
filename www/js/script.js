
jQuery(function()
{

  var section_history = ['main_view'];
  var section_change = function(section_name)
  {
    back_button.toggle( section_history.length > 1 );

    jQuery('section').hide();
    jQuery("#"+section_name).show();
  };

  var container = jQuery('body');
  var buttons = container.find('button, .button');
  var back_button = container.find('button[action="back"]');

  buttons.on('click',function()
  {
    var target = jQuery(this);
    var action = target.attr('action');

    switch( action.split('/')[0] )
    {
      case 'section':
        var section_name = action.split('/')[1];
        section_change( section_name );
        section_history.push( section_name );
      break;
      case 'back':
        section_change( section_history.pop() );
      break;

    }

    return false;
  });
});
