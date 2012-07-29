class CreateAlbums < ActiveRecord::Migration
  def change
    create_table :albums do |t|
      t.string :name
      t.string :artist_name
      t.string :spotify_uri
      t.string :spotify_url
      t.boolean :listened_to, :default => 0
      t.integer :user_id

      t.timestamps
    end
  end
end
