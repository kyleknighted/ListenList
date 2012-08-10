class MainController < ApplicationController

  require 'spotify'

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

  def search
    type = params[:type]
    output = []
    response = RestClient.get "http://ws.spotify.com/search/1/#{type}.json", { params: { q: params[:query] } }
    if response and json = ActiveSupport::JSON.decode(response)
      json[type.pluralize].each do |data|
        if type == 'track' or type == 'album'
          output.push("#{data['name']} :: #{data['artists'][0]['name']}")
        else
          output.push("#{data['name']}")
        end
      end
      render :json => output
    end
  end

  def add
    type =  params[:type]
    type_class = type.camelize.constantize

    if ['album', 'track'].include? type
      query = params[:query].split(' :: ')[0]
    else
      query = params[:query]
    end

    type_class = params[:type].camelize.constantize
    created = type_class.create_from_spotify(params[:type], query)

    hash = {:name => created[:name], :spotify_uri => created[:href], :user_id => current_user.id}
    hash[:artist_name] = created[:artist] if !created[:artist].empty?
    new_data = type_class.new(hash)

    if new_data.save
      render :json => { :results => { :name => created[:name], :artist => created[:artist], :href => created[:href] }, :id => new_data.id }
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
