# Find A Place
![Sample Notifications](https://cdn.jsdelivr.net/gh/jhcccc/FindAPlace@master/screenshot.png)
A notification tool for McGill University course registration. Get a message via Telegram, when there's a space in the course you wish to register.

# Dependency
- Telegram
    - A Telegram account (Sign up for free)
    - A Telegram bot (Create for free using @BotFather)
- Python 3
    - telegram_send 
- Node.js
    - Puppeteer

# Installation
First, git clone or download zip
## Install telegram-send
``` 
sudo pip3 install telegram-send
telegram-send --configure
```
## Install Puppeteer
Navigate to project folder, then
```
npm i puppeteer
```

## Fill in Information
Fill in courses & credential information in `check.js`

# Usage
Run it on a server or desktop by:
`python3 main.py`

If you are running it on a desktop with GUI, you may use `headless: false` to see it running.
