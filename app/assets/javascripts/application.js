// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require jquery
//= require jquery_ujs
//= require_tree .
//= require bootstrap

var autocomplete = $('input.search-query').typeahead()
  .on('keyup', function(ev){

    ev.stopPropagation();
    ev.preventDefault();

    //filter out up/down, tab, enter, and escape keys
    if( $.inArray(ev.keyCode,[40,38,9,13,27]) === -1 ){

      var self = $(this);
      $('#loading-query').show();

      self.data('typeahead').source = [];

      //active used so we aren't triggering duplicate keyup events
      if( !self.data('active') && self.val().length > 0){

        self.data('active', true);

        //Do data request. Insert your own API logic here.
        $.getJSON("http://ws.spotify.com/search/1/" + $('input[name="search-type"]:checked').val() + ".json",{
          q: $(this).val()
        }, function(data) {

        //set this to true when your callback executes
        self.data('active',true);


        var arr = [];

        switch ($('input[name="search-type"]:checked').val()) {
          case 'artist':
            i = data.artists.length;
            while(i--){
              arr[i] = data.artists[i].name
            }
            break;

          case 'track':
            i = data.tracks.length;
            while(i--){
              arr[i] = data.tracks[i].name + ' :: ' + data.tracks[i].artists[0].name
            }
            break;

          case 'album':
            i = data.albums.length;
            while(i--){
              arr[i] = data.albums[i].name + ' :: ' + data.albums[i].artists[0].name
            }
            break;
        }

        self.data('typeahead').source = arr;

        //trigger keyup on the typeahead to make it search
        self.trigger('keyup');

        //All done, set to false to prepare for the next remote query.
        self.data('active', false);
        $('#loading-query').hide();

      });

    }
  }
});

$('input[name="search-type"]').change(function(){
  $('#save-search').text('Save ' + $(this).val());
});

$('#save-search').click(function(e){
  e.preventDefault();
  type = $('input[name="search-type"]:checked').val();
  query = $('input.search-query').val();
  $('#loading-query').show();

  $.ajax({
    type: "POST",
    url: "/add",
    data: {type: type, query: query},
    dataType: "json",
    success: function(response){

      var name = response.results.name,
          artist = response.results.artist,
          href = response.results.href,
          id = response.id;

      new_listing = '<tr><td>'+name+'</td>';

      if( artist.length > 0 )
        new_listing += '<td>'+artist+'</td>';

      new_listing += '<td><a href="'+href+'" class="btn btn-primary btn-mini play-button"><i class="icon-play icon-white"></i> Play</a> '
      new_listing += '<a href="#" data-remove="'+type+':'+id+'" class="btn btn-danger btn-mini"><i class="icon-remove icon-white"></i> Remove</a>'
      new_listing += '</td></tr>';

      $('#'+type+'-list tbody').append(new_listing);

      if( $('#'+type+'-list').hasClass('hide') ){
        $('#'+type+'-list').removeClass('hide');
        $('#'+type+'-none').addClass('hide');
      }
      $('#loading-query').hide();
    },
    error: function(response){
      $('#spotify-search').after("<div class=\"alert\"><button class=\"close\" data-dismiss=\"alert\">×</button><strong>Warning!</strong> There was an error adding your "+type+". Please try again in a few moments.</div>");
    }
  });
});

$('a[data-remove]').live('click', function(e){
  e.preventDefault();
  $('#loading-query').show();

  $this = $(this);
  data = $this.data('remove');
  type = data.split(':')[0];
  id = data.split(':')[1];

  $.ajax({
    type: "DELETE",
    url: "/remove",
    data: {type: type, id: id},
    dataType: "json",
    success: function(response){
      $this.parents('tr').fadeOut(400, function(){
        $this.parents('tr').remove();
        if( $('#'+type+'-list tbody tr').length === 0 ) {
          $('#'+type+'-list').addClass('hide');
          $('#'+type+'-none').removeClass('hide');
        }
        $('#loading-query').hide();
      });
    },
    error: function(response){
      $('#spotify-search').after("<div class=\"alert\"><button class=\"close\" data-dismiss=\"alert\">×</button><strong>Warning!</strong> There was an error removing your "+type+". Please try again in a few moments.</div>");
    }
  });
});

$('a[data-toggle="modal"]').click(function(e) {
  e.preventDefault();
  var href = $(this).attr('href');
  if (href.indexOf('#') == 0) {
    $(href).modal('open');
  } else {
    $.get(href, function(data) {
      modal = '<div class="modal hide" id="url-modal"><div class="modal-body"><button type="button" class="close" data-dismiss="modal">×</button>'+data+'</div></div>';
      $(modal).appendTo('body');
      $('#url-modal').modal('show');
    });
  }
});

$('a.play-button').live('click', function(e){
  e.preventDefault();

  $this = $(this);
  uri = $this.attr('href');
  type = $this.attr('href').split(':')[1];

  $.ajax({
    type: "post",
    url: "/listen",
    data: {type: type, uri: uri},
    dataType: "json",
    success: function(response){
      console.log(response.listened_to);
      $this.parents('tr').addClass('listened');
      window.location = uri;
    },
    error: function(response){
      $('#spotify-search').after("<div class=\"alert\"><button class=\"close\" data-dismiss=\"alert\">×</button><strong>Warning!</strong> There was an error listening to your "+type+". Please try again in a few moments.</div>");
    }
  });
});