jQuery(function()
{
  var serverAdress = "http://mints.strautmanis.lv";

  // resource list
  var resources = [ "bills", "client_groups", "clients", "discounts", "payments", "product_groups", "products", "purchases"];

  var resource_params = {};

  resources.forEach(function(res)
  {
    resource_params[res] = ['id','created_at','updated_at','synced'];
  });

  resource_params.bills = resource_params.bills.concat(
    ['client_id']
  );
  resource_params.client_groups = resource_params.client_groups.concat(
    ['name']
  );
  resource_params.clients = resource_params.clients.concat(
    ['card_id','name','surname','client_group_id','phone','email','postpay']
  );
  resource_params.discounts = resource_params.discounts.concat(
    ['client_id','client_group_id','product_id','product_group_id','amount']
  );
  resource_params.payments = resource_params.payments.concat(
    ['client_id','amount']
  );
  resource_params.product_groups = resource_params.product_groups.concat(
    ['name']
  );
  resource_params.products = resource_params.products.concat(
    ['product_group_id','name','price','description']
  );
  resource_params.purchases = resource_params.purchases.concat(
    ['product_id','bill_id','count']
  );


  // bind event handlers to resources
  window.Mints = {
    utilities:{
      connection: function( resource, id, type, callback )
      {
        var resource_id = "";
        var sub_resource = "";
        var data={};

        if( id && !isNaN(id) )
        {
          resource_id = "/" + id;
        }
        if (resource.indexOf('/') != -1 )
        {
          sub_resource = "/" + resource.split('/')[1];
          resource = resource.split('/')[0];
        }

        if( type == 'post' )
        {
          Mints[resource].data[id].synced = true;
          var resource_singular = resource.substring(0, resource.length - 1);
          data[resource_singular] = Mints[resource].data[id];

          if(id && !isNaN(id))
          {
            data._method = "patch";
          }

          data.utf8 = "✓";
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
        if( !'synced' in data )
        {
          data.synced = true;
        }

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

    ns.new = function( params )
    {
      var self = this;

      var new_object = {};
      resource_params[this.class_name].forEach(function(param)
      {
        if(param == 'id')
        {
          new_object[param] = UUID.generate();
        }
        else if( params && params[param] )
        {
          new_object[param] = params[param];
        }
        else
        {
          new_object[param] = null;
        }

      });

      Mints.u.save_to_data( self, new_object );
    };
  });

});
