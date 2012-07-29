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
        $('#loading-query').show();

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

  $.ajax({
      type: "POST",
      url: "/add",
      data: {type: type, query: query},
      dataType: "json",
      success: function(response){
        switch (type) {
          case 'artist':
            artist = response.results.artists[0]
            $('#artist-list tbody').append('<tr><td>'+artist.name+'</td><td>'+artist.artists[0].name
              + '</td><td><a href="'+artist.href+'" class="btn btn-primary btn-mini"><i class="icon-play icon-white"></i> Play</a> '
              + '<a href="#" data-remove="'+response.id+'" class="btn btn-danger btn-mini"><i class="icon-remove icon-white"></i> Remove</a>'
              + '</td></tr>');
            break;

          case 'track':
            track = response.results.tracks[0]
            $('#track-list tbody').append('<tr><td>'+track.name+'</td><td>'+track.artists[0].name
              + '</td><td><a href="'+track.href+'" class="btn btn-primary btn-mini"><i class="icon-play icon-white"></i> Play</a> '
              + '<a href="#" data-remove="'+response.id+'" class="btn btn-danger btn-mini"><i class="icon-remove icon-white"></i> Remove</a>'
              + '</td></tr>');
            break;

          case 'album':
            console.log(response);
            album = response.results.albums[0]
            $('#album-list tbody').append('<tr><td>'+album.name+'</td><td>'+album.artists[0].name
              + '</td><td><a href="'+album.href+'" class="btn btn-primary btn-mini"><i class="icon-play icon-white"></i> Play</a> '
              + '<a href="#" data-remove="'+response.id+'" class="btn btn-danger btn-mini"><i class="icon-remove icon-white"></i> Remove</a>'
              + '</td></tr>');
            break;
        }
      },
      error: function(response){
        $('#spotify-search').after();
      }
    });
});