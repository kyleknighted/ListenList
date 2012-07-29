ListenList::Application.routes.draw do
  resources :albums

  resources :create_albums

  resources :artists

  resources :tracks

  root :to => 'main#index'

  match '/auth/:provider/callback', to: 'sessions#create'
  match "/signout" => "sessions#destroy", :as => :signout

  match "/about" => "main#about"

  post '/add' => 'main#add'
end
