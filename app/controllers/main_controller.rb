class MainController < ApplicationController

  def index
    if current_user
      @artists = Artist.where(:user_id => current_user.id)
      @tracks = Track.where(:user_id => current_user.id)
      @albums = Album.where(:user_id => current_user.id)
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

    response = RestClient.get "http://ws.spotify.com/search/1/" + params[:type] + ".json", { :params => { :q => params[:query] } }
    json = ActiveSupport::JSON.decode(response)

    case params[:type]
      when 'artist'
        href = json['artists'].first['href']
        name = json['artists'].first['name']

        @artist = Artist.new({:name => name, :spotify_uri => href, :user_id => current_user.id})

        if @artist.save
          respond_to do |format|
            format.json { render json: { :results => json } }
          end
        end
      when 'track'
        href = json['tracks'].first['href']
        name = json['tracks'].first['name']
        artist = json['tracks'].first['artists'][0]['name']

        @track = Track.new({:name => name, :artist_name => artist, :spotify_uri => href, :user_id => current_user.id})

        if @track.save
          respond_to do |format|
            format.json { render json: { :results => json } }
          end
        end
      when 'album'
        href = json['albums'][0]['href']
        name = json['albums'][0]['name']
        artist = json['albums'][0]['artists'][0]['name']

        @album = Album.new({:name => name, :artist_name => artist, :spotify_uri => href, :user_id => current_user.id})

        if @album.save
          respond_to do |format|
            format.json { render json: { :results => json } }
          end
        end
    end


  end

end
