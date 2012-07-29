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

    result = parse_data(json, params[:type])

    if result.save
      respond_to do |format|
        format.json { render json: { :results => json, :id => result.id } }
      end
    end
  end

  private

  def parse_data(json, type)
    case type
      when 'artist'
        href = json['artists'].first['href']
        name = json['artists'].first['name']

        Artist.new({:name => name, :spotify_uri => href, :user_id => current_user.id})

      when 'track'
        href = json['tracks'].first['href']
        name = json['tracks'].first['name']
        artist = json['tracks'].first['artists'][0]['name']

        Track.new({:name => name, :artist_name => artist, :spotify_uri => href, :user_id => current_user.id})

      when 'album'
        href = json['albums'][0]['href']
        name = json['albums'][0]['name']
        artist = json['albums'][0]['artists'][0]['name']

        Album.new({:name => name, :artist_name => artist, :spotify_uri => href, :user_id => current_user.id})

    end
  end

end
