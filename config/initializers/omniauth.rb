Rails.application.config.middleware.use OmniAuth::Builder do
  provider :rdio, ENV['RDIO_KEY'], ENV['RDIO_SECRET']
end