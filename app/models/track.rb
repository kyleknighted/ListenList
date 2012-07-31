class Track < ActiveRecord::Base
  belongs_to :user

  def has_artist?
    defined?(self.first.artist_name)
  end
end
