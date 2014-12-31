jQuery(function()
{
  var serverAdress = "http://mints.strautmanis.lv";

  // resource list
  var resources = [ "bills", "client_groups", "clients", "discounts", "payments", "product_groups", "products", "purchases"];


  // bind event handlers to resources
  window.Mints = {};
  resources.forEach(function(res)
  {
    window.Mints[res] = {};
    var ns = window.Mints[res];

    ns.data = {};
    ns.events = {};
    /**
  	 * on()
  	 */
  	ns.on = function( type, handler )
  	{
  		if( !this.events )
  		{
  			this.events = {};
  		}
  		if( !(type in this.events) )
  		{
  			this.events[ type ] = [];
  		}
  		this.events[ type ].push( handler );
  	};

  	/**
  	 * trigger()
  	 */
  	ns.trigger = function( type, args )
  	{
  		if( this.events[type] )
  		{
  			for( var i = 0; i < this.events[type].length; i++ )
  			{
  				this.events[type][i].apply( this, args || [] );
  			}
  		}
  	};
  });

  var connection = function( resource, id, type, callback )
  {
    var resource_id = "";
    if( id && !isNaN(id) )
    {
      resource_id = "/" + id;
    }
    var sub_resource = "";
    if (resource.indexOf('/') != -1 )
    {
      sub_resource = "/" + resource.split('/')[1];
      resource = resource.split('/')[0];
    }

    jQuery.ajax(
    {
      url: serverAdress+"/"+ resource + resource_id + sub_resource +".json",
      type: type,
      dataType: "json",
      success: function( json )
      {
        callback( json );
      }
    });
  };

  // for /clients/:client_id/payments.json use clients/payments as resource etc.
  Mints.getData = function(resource, id)
  {
    connection(resource, id, "get", function(data)
    {
      window.Mints[resource].data[data.id] = data;
      window.Mints[resource].trigger('change');
    });
  };
  Mints.postData = function(resource, id)
  {
    connection(resource, id, "post", function(){ window.Mints[resource].trigger('change') });
  };


});
