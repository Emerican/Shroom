jQuery(function()
{
  var serverAdress = "mints.strautmanis.lv";
  var connection = function( resource, param, type, callback ){
    jQuery.ajax
    ({
      url: serverAdress+"/"+resource,
      type: 'get',
      dataType: "json",
      success: function( json )
    {
      callback ( json );
    }
  });

  var getData = function(resource, param){
    connection(resource, param, "get", function(){});
  };
  var postData = function(){
    connection(resource, param, "post", function(){});
  };

  };
});
