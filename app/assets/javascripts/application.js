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
//= require bootstrap-modal
//= require bootstrap-typeahead
//= require bootstrap-alert
//= require functions

$(function(){
  $('a[data-toggle="modal"]').click(function(e) {
    e.preventDefault();
    $.get($(this).attr('href'), function(data) {
      $('#url-modal .modal-body').append(data);
      $('#url-modal').modal('show');
    });
  });

  var autocomplete = $('input.search-query').typeahead()
    .on('keyup', function(e){

      e.stopPropagation();
      e.preventDefault();

      //filter out up/down, tab, enter, and escape keys
      if( $.inArray(e.keyCode,[40,38,9,13,27]) === -1 ){

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


          var resultArray = [];

          switch ($('input[name="search-type"]:checked').val()) {
            case 'artist':
              i = data.artists.length;
              while(i--){
                resultArray[i] = data.artists[i].name
              }
              break;

            case 'track':
              i = data.tracks.length;
              while(i--){
                resultArray[i] = data.tracks[i].name + ' :: ' + data.tracks[i].artists[0].name
              }
              break;

            case 'album':
              i = data.albums.length;
              while(i--){
                resultArray[i] = data.albums[i].name + ' :: ' + data.albums[i].artists[0].name
              }
              break;
          }

          self.data('typeahead').source = resultArray;

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
    $('#loading-query').show();

    var varArray = [];
    varArray['this']    = $(this);
    varArray['type']    = $('input[name="search-type"]:checked').val();
    varArray['search']  = $('input.search-query').val();
    varArray['query']   = {type: varArray['type'], query: varArray['search']};

    if( varArray['search'] ) {
      varArray['message'] = "There was an error adding your "+varArray['type']+". Please try again in a few moments.";
    } else {
      varArray['message'] = "Please input your "+varArray['type']+".";
    }

    submitAjax('post', '/add', varArray, successAdd);
  });

  $('a.delete-button, a.play-button').on('click', function(e){
    e.preventDefault();
    $('#loading-query').show();

    var varArray = [];
    varArray['this']    = $(this);
    varArray['type']    = $(this).data('type');
    varArray['id']      = $(this).data('id');
    varArray['query']   = {type: varArray['type'], id: varArray['id']};

    if( $(this).hasClass('delete-button') ) {
      varArray['message'] = "There was an error removing your "+varArray['type']+". Please try again in a few moments.";
      submitAjax('delete', '/remove', varArray, successDelete);
    } else {
      varArray['message'] = "There was an error listening your "+varArray['type']+". Please try again in a few moments.";
      submitAjax('post', '/listen', varArray, successPlay);
    }
  });
});
