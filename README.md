# particle-processing-rk

*Helper for using Particle IoT devices with OpenProcessing p5.js*

[OpenProcessing](https://openprocessing.org/) is often used for graphics programming, but you can also use it to interact with your [Particle](https://particle.io/) IoT devices over the cloud!

One problem with using the Particle API (via particle-api-js) is that you need a Particle access token. Pasting the access token into your source code is bad practice. Also, with OpenProcessing is that sketches are public, except for paid tiers, and that means anyone who views your sketch has full control of your Particle account. Not good!

The helper makes it easy to prompt for username, password, and if enabled, MFA token. It then obtains a time-limited access token (good for 4 hours maximum), and stores it in browser local storage. If you refresh your sketch during the token life, you don't need to log in again, making the process seamless.

If you're done before the time limit, it also places a Logout button at the top of the page which invalidates your access token and removes it from browser local storage. This is useful if you are using a shared computer, to make sure the next user won't have access to your account.

The library provides convenient helpers for selecting a device from the logged in user's Particle account, and doing Particle primitive functions such as Particle.function, Particle,variable, and Particle.publish so you can interact with your Particle device over the cloud easily.

It also provides access to the full particle-api-js in case you want to use more advanced features.

This library assumes you are using OpenProcessing in [p5js](https://p5js.org/reference/) mode.

## Function Publish Demo

This is a demo of using login, device selector, function, publish, and variable features.

- Flash your Particle device with the code in firmware/function-publish.cpp.
- Create a new sketch from the source in sketches/function-publish.js.
- Add the particle-processing-rk library to your sketch.
- Run it!

## Helper API

Adding the `particle-processing-rk.js` library in your Sketch automatically adds a new global object, `particleHelper`.

Call `particleHelper.setup()` from your `setup()`. This will prompt for login, if necessary.

Instead of setting up UI elements in `setup()` you should move them to `afterLoggedIn()`. This is because during setup the helper may UI elements for logging in, then remove them using the ps5js function `removeElements()`. Thus if you add non-canvas elements from `setup()` they could disappear after the user logs in.

If the `afterLoggedIn()` function is present in your sketch, it will be called so you can do other things.

```js
function setup() {
    createCanvas(windowWidth, windowHeight);
    background('#202020');

    // Add the particle-processing-rk.js to add the particleHelper global object
    particleHelper.setup();
}

// The afterLoggedIn function(), if present, is called after the user has logged in
function afterLoggedIn() {
    console.log('logged in!');
}
```

You can customize behavior by updating properties in the `particleHelper` object before calling `particleHelper.setup()`.

Some values you may want to update:

- `tokenDuration` is the lifetime for new access tokens in seconds. The default is 4 * 3600 (4 hours).

- `foregroundColor` is the color to use for text. The default is `#e0e0e0`. If you are using a white background you will probably want to change this.

- `top` and `left` specify the location of login controls. By default, this is the top left of the window (5, 5) but you can position the controls elsewhere if desired.


## Release Notes

### 0.0.1 (2023-07012)

- Initial version
