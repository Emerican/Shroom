
jQuery(function()
{

  var container = jQuery('body');
  var buttons = container.find('button, .button');
  var back_button = container.find('button[action="back"]');
  var navigation = container.find('nav');

  var section_history = [];
  var current_section = "main";
  var last_section = current_section;

  var section_change = function(section_name)
  {
    current_section = section_name;
    navigation.trigger('change');
    jQuery('section').hide();
    jQuery("#"+section_name).show();
  };

  navigation.on('change',function()
  {
    back_button.toggle( section_history.length > 0 );
    navigation.find('p').html( current_section );

  }).trigger('change');;

  buttons.on('click',function()
  {
    var target = jQuery(this);
    var action = target.attr('action');

    var prevent_default = true;

    switch( action.split('/')[0] )
    {
      case 'section':

        var section_name = action.split('/')[1];
        section_history.push( current_section );
        section_change( section_name );

      break;
      case 'back':
        section_change( section_history.pop() );
      break;

      case 'new':
      case 'set':
        prevent_default = false;
      break;

    }
    return !prevent_default;
  });

  container.on('submit', 'form',function()
  {
    var form = jQuery(this);
    var action = target.attr('action') || target.find('button, .button').attr('action');
    var resource_id = target.attr('resource_uuid') || target.find('[name="uuid"]').val();
    var resource_name = action.split('/')[1];

    switch( action.split('/')[0] )
    {
      case 'new':
        Mints[resource_name].new( form.serialize() );
      break;

      case 'set':
        Mints[resource_name].get(resource_id).set( form.serialize() );
      break;

    }

    // handle data refresh in .on('change',function(){}) event
    target.parents('section').trigger('change');
    return false;
  });
});
