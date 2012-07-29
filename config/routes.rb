ListenList::Application.routes.draw do
  root :to => 'main#index'

  match '/auth/:provider/callback', to: 'sessions#create'
  match "/signout" => "sessions#destroy", :as => :signout

  match "/about" => "main#about"

  post '/add' => 'main#add'
  delete '/remove' => 'main#remove'
end