# Explit

Track and split shared expenses with friends and family.

![Explit](https://github.com/nzambello/explit/raw/main/public/explit.png)

## Features

### User management

When signing up, you can choose to create a new user or to sign in with an existing user.
You can choose an icon, which can be an emoji or a letter to represent your user.

When entering the team, you can choose to create a new team or to join an existing team by its name.

Once logged in, in `/account/preferences` you can select a theme for the app and in `/account/manage` you can change your team, icon, and password.

### Track expenses

Once logged in, you can see a list of all your expenses and the balance of the team.

From the homepage, you can add an expense or transfer money to another user.

For every expense, you can see the amount, the date, the user who paid, and a description.

From the expense page, you can edit the amount and the description or delete the item.

### Balance equality

The goal of the app is to split equally the expenses among the team.

When you add an expense, the amount is added to the balance of the team.

Then, the balance of the team is calculated to show the amount of money each user should have or give.

#### Balance based on income

If enabled, the balance of the amount of money each user should have or give is based on each user's income.

There's an option in the `/team` page to enable this feature.

To have an equal split based on everyone's income, you can select
this option. If a team of two people, one earns 1.5 times as much as the other, then his or her share in the common expenses will be 1.5 times as much as the other's.

Otherwise, every user will have the same base amount of money.

### Statistics

The statistics page can show you how much you're spending currently and how much you've spent in previous months.

## Development

- [Remix Docs](https://remix.run/docs)

From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

- `build/`
- `public/build/`

### Using a Template

When you ran `npx create-remix@latest` there were a few choices for hosting. You can run that again to create a new project, then copy over your `app/` folder to the new project that's pre-configured for your target server.

```sh
cd ..
# create a new project, and pick a pre-configured host
npx create-remix@latest
cd my-new-remix-app
# remove the new project's app (not the old one!)
rm -rf app
# copy your app over
cp -R ../my-old-remix-app/app app
```
