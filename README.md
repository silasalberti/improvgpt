# ImprovGPT

Pratice your improv skills using ChatGPT. This is a final project for the amazing TAPS 103 class at Stanford :) 

Currently, the bot supports the following games:
- One-Word Story
- One-Word Proverb
- Story Geometry
- Three Things
- Just a Scene

Feel free to add more games by changing `initialMessage` and `messageState` in `pages/index.tsx`!

[Get in touch via twitter if you need help](https://twitter.com/SilasAlberti)


## Development

1. Clone the repo

```
git clone [github https url]
```

2. Install packages

```
pnpm install
```

3. Set up your `.env` file

- Copy `.env.local.example` into `.env`
  Your `.env` file should look like this:

```
OPENAI_API_KEY=
```

- Visit [openai](https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key) to retrieve API keys and insert into your `.env` file.


## Run the app

Once you've verified that the embeddings and content have been successfully added to your supabase table, you can run the app `npm run dev` and type a question to ask your website.

## Credit

Frontend of this repo is inspired by [langchain-chat-nextjs](https://github.com/zahidkhawaja/langchain-chat-nextjs) and build upon [langchain-supabase-website-chatbot](https://github.com/mayooear/langchain-supabase-website-chatbot).
