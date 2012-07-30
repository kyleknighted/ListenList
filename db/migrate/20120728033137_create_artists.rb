class CreateArtists < ActiveRecord::Migration
  def change
    create_table :artists do |t|
      t.string :name
      t.string :spotify_uri
      t.string :spotify_url
      t.boolean :listened_to, :default => false
      t.integer :user_id

      t.timestamps
    end
  end
end
