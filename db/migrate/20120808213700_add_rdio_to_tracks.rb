class AddRdioToTracks < ActiveRecord::Migration
  def change
    add_column :tracks, :rdio_key, :string
    add_column :tracks, :rdio_short_url, :string
    add_column :tracks, :rdio_embed_url, :string
    add_column :tracks, :rdio_icon, :string

    add_column :artists, :rdio_key, :string
    add_column :artists, :rdio_short_url, :string
    add_column :artists, :rdio_icon, :string

    add_column :albums, :rdio_key, :string
    add_column :albums, :rdio_short_url, :string
    add_column :albums, :rdio_embed_url, :string
    add_column :albums, :rdio_icon, :string

  end
end
