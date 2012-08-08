require 'active_support'

module SpotifySearch

  extend ActiveSupport::Concern
  included do
    include SpotifySearch::ClassMethods
    belongs_to :user
  end

  module ClassMethods
    def create_from_spotify type, query
      response = RestClient.get "http://ws.spotify.com/search/1/#{type}.json", { params: { q: query } }

      if response and json = ActiveSupport::JSON.decode(response)
        json = json[type.pluralize][0]

        {
          name:   json['name'],
          href:   json['href'],
          artist: (json['artists'] ? json['artists'][0]['name'] : '')
        }
      else
        false
      end
    end
  end
end
