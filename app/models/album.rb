class Album < ActiveRecord::Base
  belongs_to :user

  def self.create_from_spotify(query)
    response = RestClient.get "http://ws.spotify.com/search/1/album.json", { :params => { :q => query } }
    json = ActiveSupport::JSON.decode(response)

    name = json["albums"][0]['name']
    href = json["albums"][0]['href']
    artist = json["albums"][0]['artists'] ? json["albums"][0]['artists'][0]['name'] : ''

    {:name => name, :artist => artist, :spotify_uri => href}
  end

end
