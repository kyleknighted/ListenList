
$(function(){
  // Setup modal box for About page information
  $('a[data-toggle="modal"]').click(function(e) {
    e.preventDefault();
    $.get($(this).attr('href'), function(data) {
      $('#url-modal .modal-body').append(data);
      $('#url-modal').modal('show');
    });
  });

  $('input.search-query').typeahead().on('keyup', function (e) {
    e.stopPropagation();
    e.preventDefault();

    //filter out up/down, tab, enter, and escape keys
    if ($.inArray(e.keyCode, [40, 38, 9, 13, 27, 91, 18, 17, 16]) === -1) {

      var self = $(this),
          type = $('input[name="search-type"]:checked').val();

      $('#loading-query').removeClass('hide');

      //active used so we aren't triggering duplicate keyup events
      if (!self.data('active') && self.val().length > 0) {

        self.data('active', true);

        // Request value from Spotify
        $.getJSON("/search",{ query: $(this).val(), type: type }, function (response) {
          // get returned array and append to data source
          self.data('typeahead').source = response;

          //trigger keyup on the typeahead to make it search
          self.trigger('keyup');

          //All done, set to false to prepare for the next remote query.
          self.data('active', false);
          $('#loading-query').addClass('hide');

        });
      }
    }
  });

  // Update "Search" button to correct verbiage
  $('input[name="search-type"]').change(function(){
    $('#save-search').text('Save ' + $(this).val());
  });

  // Save Search Clicking - adds track/artist/album to database
  // TODO: Accept "Enter" key as valid submittal option
  $('#save-search').click(function(e){
    e.preventDefault();
    $('#loading-query').removeClass('hide');

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

  // Delete and Play button functionality is very similiar
  // Adding both together with simple `if` statement
  $('a.delete-button, a.play-button').on('click', function(e){
    e.preventDefault();
    $('#loading-query').removeClass('hide');

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
