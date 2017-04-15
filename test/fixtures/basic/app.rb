require 'rubygems'
require 'twilio-ruby'
require 'sinatra'
 
get '/sms-quickstart' do
  twiml = Twilio::TwiML::Response.new do |r|
    r.Message "Hey Monkey. Thanks for the message! I am going exactly to 80 col"
  end
  twiml.text
end
