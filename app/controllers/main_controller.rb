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
    type =  params[:type]
    type_class = type.camelize.constantize

    query = ['album', 'track'].include? type ? params[:query].split(' :: ')[0] : params[:query]

    response = RestClient.get "http://ws.spotify.com/search/1/#{type}.json", { :params => { :q => query } }
    json = ActiveSupport::JSON.decode(response)

    name = json["#{type}s"][0]['name']
    href = json["#{type}s"][0]['href']
    artist = json["#{type}s"][0]['artists'] ? json["#{type}s"][0]['artists'][0]['name'] : ''

    hash = {:name => name, :spotify_uri => href, :user_id => current_user.id}
    hash[:artist_name] = artist unless artist.empty?

    new_data = type_class.new(hash)

    if new_data.save
      render :json => { :results => { :name => name, :artist => artist, :href => href }, :id => new_data.id }
    end
  end

  def listen
    data = params[:type].camelize.constantize.find(params[:id])

    if data.update_attribute(:listened_to, true)
      render :json => { :listened_to => true }
    end
  end

  def remove
    data = params[:type].camelize.constantize.find(params[:id])

    data.destroy

    respond_to do |format|
      format.json { head :no_content }
    end
  end

end
