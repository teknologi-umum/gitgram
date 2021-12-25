# Gitgram
Github notifications for Telegram

**BackStory of Gitgram**:

Gitgram created because our team at that time was working on a big project and because our team used telegram to discuss the project, a bot on telegram called Gitgram was created to help us anywhere without having to check directly on github

**Feature**:

- deployment status
- issue
- ping 
- pull request
- release
- vulnerabillity

**How to use**:

First you will need to clone this repo

``` 
git clone https://github.com/teknologi-umum/gitgram.git 
```

and then install all of it's dependencies

```bash
# if you're using npm
npm install 
# or yarn
yarn install
```

To make the bot work properly, you will need these environment variables.
- `NODE_ENV`
	Used for NodeJS to determine whether the bot is running in production or development.
- `PORT`
	Which port to run the bot.
- `WEBHOOK_SECRET`
	Your webhook secret. You should see it when you create your Github webhook.
- `BOT_TOKEN`
	Your telegram bot token.
- `DEV_PROXY_URL`
	Webhook proxy URL used for easier development process.

**Example:**
```
NODE_ENV=development
PORT=3000
WEBHOOK_SECRET=123456789
BOT_TOKEN=xyzx:isyelacuapwodncnmzdcmajwo 
DEV_PROXY_URL=web.com/duffUGHIUGsdsd
```

If you don't know how to make a Telegram bot and get its token, you can refer to [Telegram Bot Documentation](https://core.telegram.org/bots)

If you don't know how to make a webhook for Github, you can visit
[Github Webhook Documentation](https://docs.github.com/en/developers/webhooks-and-events/webhooks/about-webhooks)