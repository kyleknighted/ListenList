function submitAjax(method, action, varArray, successFunction) {
  $.ajax({
    type: method,
    url: action,
    data: varArray['query'],
    dataType: "json",
    success: function(response){
      successFunction(response, varArray);
    },
    error: function(response){
      generateError(varArray['message'])
    }
  });
}

function successAdd(response, varArray) {
  $('input.search-query').val('');

    var name = response.results.name,
        artist = response.results.artist,
        href = response.results.href,
        id = response.id;

    newListing = generateMarkup(name, artist, href, id, varArray['type']);

    $('#'+varArray['type']+'-list tbody').append(newListing);

    if( $('#'+varArray['type']+'-list').hasClass('hide') ){
      $('#'+varArray['type']+'-list').removeClass('hide');
      $('#'+varArray['type']+'-none').addClass('hide');
    }

    $('#loading-query').hide();
}

function successDelete(response, varArray) {
  varArray['this'].parents('tr').fadeOut(400, function(){
    varArray['this'].parents('tr').remove();
    if( $('#'+varArray['type']+'-list tbody tr').length === 0 ) {
      $('#'+varArray['type']+'-list').addClass('hide');
      $('#'+varArray['type']+'-none').removeClass('hide');
    }
    $('#loading-query').hide();
  });
}

function successPlay(response, varArray) {
  varArray['this'].parents('tr').addClass('listened');
  window.location = varArray['this'].attr('href');
}

function generateMarkup(name, artist, href, id, type) {
  newListing = '<tr><td>'+name+'</td>';

  if( artist ) { newListing += '<td>'+artist+'</td>'; }

  newListing += '<td><a href="'+href+'" data-id="'+id+'" data-type="'+type+'" class="btn btn-primary btn-mini play-button"><i class="icon-play icon-white"></i> Play</a> '
  newListing += '<a href="#" data-id="'+id+'" data-type="'+type+'" class="btn btn-danger btn-mini delete-button"><i class="icon-remove icon-white"></i> Remove</a>'
  newListing += '</td></tr>';

  return newListing
}

function generateError(message) {
  $('#spotify-search').after("<div class=\"alert\"><button class=\"close\" data-dismiss=\"alert\">×</button><strong>Warning!</strong> "+message+"</div>");
}