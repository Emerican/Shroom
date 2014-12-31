jQuery(function()
{
  var serverAdress = "http://mints.strautmanis.lv";

  // resource list
  var resources = [ "bills", "client_groups", "clients", "discounts", "payments", "product_groups", "products", "purchases"];


  // bind event handlers to resources
  window.Mints = {
    utilities:{
      connection: function( resource, id, type, callback )
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

        var data;
        if( type == 'post' )
        {
          data = Mints[resource].data[id];
        }

        jQuery.ajax(
        {
          url: serverAdress+"/"+ resource + resource_id + sub_resource +".json",
          type: type,
          dataType: "json",
          data: data,
          success: function( json )
          {
            callback( json );
          }
        });
      },
      save_to_data: function(resource, data)
      {
        data.synced = true;

        if( !resource.data[data.id] )
        {
          resource.data[data.id] = data;
        }
        else
        {
          var d_local = new Date(resource.data[data.id].updated_at);
          var d_server = new Date(data.updated_at);

          if (d_local > d_server)
          {
            resource.data[data.id].synced = false;
          }
          else if (d_local < d_server)
          {
            resource.data[data.id] = data;
          }
        }
      }
    }
  };
  Mints.u = Mints.utilities;

  resources.forEach(function(res)
  {
    window.Mints[res] = {};
    var ns = window.Mints[res];

    ns.class_name = res;
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

    /**
  	 * get_data()
  	 */
    ns.get_data = function(id)
    {
      var self = this;

      Mints.u.connection(self.class_name, id, "get", function(data)
      {
        if( Object.prototype.toString.call( data ) === '[object Array]' )
        {
          data.forEach(function(item)
          {
            Mints.u.save_to_data( self, item );
          });
        }
        else
        {
          Mints.u.save_to_data( self, data );
        }

        self.trigger('change');
      });
    };

    ns.sync = function()
    {
      var self = this;

      for( var id in self.data )
      {
        if( !self.data[id].synced )
        {
          Mints.u.connection( self.class_name, id, "post", function(){ self.trigger('sync') } );
        }
      }
    };
  });

});
