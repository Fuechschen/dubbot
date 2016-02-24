# API-Keys

These keys are needed to access some third-party ressources.

### Soundcloud
This key is needed to return clean links for soundcloud-tracks

0. Register an account at https://aoundcloud.com if aren't having one
1. Go to your [app settings](http://soundcloud.com/you/apps) on soundcloud.
2. Click on 'Register new application'
3. Give the app a name of your choice (this is only to identify the app for you), read and accept the term and click on 'Register'
4. Copy the client ID to your config file for apiKeys.soundcloud

### Wordnik
This key is needed for !define

0. Create an [Wordnik-Account](https://www.wordnik.com/signup) if aren't having one
1. Go to http://developer.wordnik.com, fill both fields on the right and click on 'Sign me up for an API key'
2. You will have to wait for an email containing a link to your profile page.
3. Scroll down to 'Your Wordnik API key', copy the key and paste it under 'apiKeys.wordnik' in your config file

### YouTube
This key is needed to lookup countryblocks

0. Create a google-account if aren't having one
1. Head over to https://console.developers.google.com and create a new project.
2. Click on 'Use Google APIs'
3. Now select 'YouTube Data Api' and click on enable.
4. Select 'Credentials' on the left sidebar, click on 'Create Credentials', select 'API key' and click on 'Server-Key' in the next window
5. Name your key (this only for you to keep track on requests and organize your keys) and fill in an IP-Address if the machine dubbot is running on has a static IP-Address. If your machine has a changing IP-Address (e.g. you are running dubbot from a computer at home) leave this field empty.
6. Copy the key and paste it in your configfile for apiKeys.youtube