class MainController < ApplicationController

  def index
    if current_user
      @artists = current_user.artists
      @tracks = current_user.tracks
      @albums = current_user.albums
    end
  end

  def about
    render :layout => false
  end

  def add
    if params[:type] == 'track' || params[:type] == 'album'
      query = params[:query].split('::')[0]
    else
      query = params[:query]
    end

    response = RestClient.get "http://ws.spotify.com/search/1/" + params[:type] + ".json", { :params => { :q => query } }
    json = ActiveSupport::JSON.decode(response)

    name = json["#{params[:type]}s"][0]['name']
    href = json["#{params[:type]}s"][0]['href']
    artist = json["#{params[:type]}s"][0]['artists'] ? json["#{params[:type]}s"][0]['artists'][0]['name'] : ''

    new_data = parse_data(name, href, artist, params[:type])

    if new_data.save
      render :json => { :results => { :href => href, :name => name, :artist => artist }, :id => new_data.id }
    end
  end

  def remove
    data = case params[:type]
           when 'artist'
             Artist.find(params[:id])
           when 'track'
             Track.find(params[:id])
           when 'album'
             Album.find(params[:id])
           end

    data.destroy

    respond_to do |format|
      format.json { head :no_content }
    end
  end

  private

  def parse_data(name, href, artist, type)
    case type
      when 'artist'
        Artist.new({:name => name, :spotify_uri => href, :user_id => current_user.id})

      when 'track'
        Track.new({:name => name, :artist_name => artist, :spotify_uri => href, :user_id => current_user.id})

      when 'album'
        Album.new({:name => name, :artist_name => artist, :spotify_uri => href, :user_id => current_user.id})

    end
  end

end
