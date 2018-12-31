# F Word

Anything built with Firebase is destined to be insecure. So, I used Firebase.

All these API thingies are `GET` or `POST` requests at `https://test-9d9aa.firebaseapp.com/fword`.

The API thing type name thing is included in the URL as `&type=API_THING_TYPE_NAME_THING`. For example:

```js
fetch('https://test-9d9aa.firebaseapp.com/fword?session=true&type=signout', {
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  method: 'POST',
  body: JSON.stringify({
    session: '82a2d0da25d09c6826c818f43288d31a' // session ID
  })
}).then(r => {
  //
});
```

When there's an error, the status code will be `400` and the response will have the error message. If it succeeds, the status code will be `200`.

## API things that require a session

All requests have to be `POST` requests, include `?session=true`, and include the session ID in the body. If the session doesn't exist, it'll error with `session doesn't exist`. If the session has just expired, it'll error with `expired session`.

### `type=signout`

Deletes current session.

### `type=setexpiry`

Sets the user's session expiry time given `time` in the body. The time can be `-1` to never expire, or a number above 300000 (5 minutes) representing the time it takes for a session to expire. Will error with `too short` if the number isn't -1 yet it's below 300000.

### `type=setbio`

Sets the user's bio given `content` in the body. Will error with `too long` if the content is more than 500 characters.

### `type=setpfp`

Sets the user's profile picture given `newpfp`. If it doesn't fit the `DEGREE.HEX1.HEX2` format, it will error with `not a pfp`.

### `type=setpass`

Sets the user's password given `password`. Will error with `dumb password` if it doesn't contain a space.

### `type=setsecret`

Sets the user's secret text given `content` in the body. Will error with `too long` if the content is more than 500 characters.

### `type=secret`

Returns the user's secret text.

### `type=post`

Makes a new post given `content` (will error, when trimmed, with `too long` if over 500 characters or `too short` if empty) and `parent` (optional), which refers to a post ID.

### `type=like`

Given `post=` in the URL, it will like a post. It will at times appropriately error with `post does not exist`. It responds with new like count.

### `type=unlike`

Given `post=` in the URL, it will remove a like from a post if the user has one. It responds with new like count.

### `type=user-likes`

Given `post=` in the URL, it will respond with `true` if the user likes the post, or `false` if the user doesn't.

## The other API things that don't require a session

### `type=signin`

Given `user` (the username) and `password` in the body, it will attempt to sign in and create a session, whose ID it will respond with. It will at times appropriately respond with `incorrect password`.

### `type=createuser`

Given `user` (the desired username) and `password` in the body...

1. Is the username empty or over 26 characters long? Or does it contain characters other than the lowercase letters and space? Maybe it starts and ends with a space, or has a double space somewhere? If so, it errors with `dumb username`.

2. Does the password contain a space? If not, it errors with `dumb password`.

3. Does a user with the desired username exist? If so, it errors with `user exists`.

4. Otherwise, it creates the user and a session for the user, whose ID it will respond with.

### `type=user`

Unless the given user in the URL as `user=` doesn't exist (in which case it'll error with `user doesn't exist`), it will respond with the given user's bio, profile picture, and join date in JSON format.

### `type=post`

Unless the given post in the URL as `post=` doesn't exist (in which case it'll error with `post doesn't exist`), it will respond with the given post's content, author, likers, post date, and parent if there is one in JSON format.

### `type=pfps`

Given a list of usernames in the URL as `users=` separated by full stops, it'll return an object mapping the given usernames to their corresponding profile pictures.

### `type=recent-posts`

Given `limit=` and optionally `from=` in the URL, it will list the `limit` most recent posts starting from `from`. If `limit` isn't a number, or it's less than 1 or greater than 100, it will error with `limit not a number`, `limit too small`, or `limit too big` accordingly.

### `type=user-posts`

Given `user=` in the URL, it will respond with the user's posts.

### `type=user-likes`

Given `user=` in the URL, it will respond with the user's liked posts.
