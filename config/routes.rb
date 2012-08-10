ListenList::Application.routes.draw do
  root :to => 'main#index'

  match '/auth/:provider/callback', to: 'sessions#create'
  match "/signout" => "sessions#destroy", :as => :signout

  get "/search" => "main#search"
  match "/about" => "main#about"

  post '/add' => 'main#add'
  post '/listen' => 'main#listen'
  delete '/remove' => 'main#remove'
end
