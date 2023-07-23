function setup() {
    createCanvas(windowWidth, windowHeight);
    background('#202020');

    // Add the particle-processing-rk.js to add the particleHelper global object
    particleHelper.setup();
}

// The afterLoggedIn function(), if present, is called after the user has logged in
function afterLoggedIn() {
    console.log('logged in!');

    // This adds a popup menu to select a Particle device from the logged in account.
    // The device must be online and breathing cyan at the time the sketch is run to
    // show up in the list. If you want offline devices as well, add:
    //   includeOffline: true
    particleHelper.selectDevice({
        label: 'Select device:',
    });

    // Clicking the Red Function button calls a Particle.function on the device which
    // will set the status LED to red, when running the function-publish demo source code.
    redButton = createButton('Red Function');
    redButton.position(5, 70);
    redButton.mousePressed(handleRedButton);

    // Clicking the Green Function button calls a Particle.function on the device which
    // will set the status LED to green, when running the function-publish demo source code.
    greenButton = createButton('Green Function');
    greenButton.position(125, 70);
    greenButton.mousePressed(handleGreenButton);

    // Clicking the Check functionCount button makes a Particle.variable request to the device
    // to see how many times a function has been called since the device last rebooted
    // and displays it in the box to the right of the button.
    checkFunctionCountButton = createButton('Check functionCount');
    checkFunctionCountButton.position(5, 100);
    checkFunctionCountButton.mousePressed(handleCheckFunctionCount);

    // This is where the count is displayed
    checkFunctionCountInput = createInput();
    checkFunctionCountInput.position(160, 100);
    checkFunctionCountInput.size(10);

    // Clicking the Blue Publish button makes an event publish. This is different than a
    // function. Functions go to a single device, but events go to all devices claimed to the
    // account the user is logged in as.
    blueButton = createButton('Blue Publish');
    blueButton.position(5, 130);
    blueButton.mousePressed(handleBlueButton);

}

// When the Red Function button is clicked, this code is called.
function handleRedButton() {
    // The argument is red,green,blue and the values are 0 - 255
    particleHelper.callFunction({
        name: 'setColor',
        argument: '255,0,0',
    });
}

// When the Green Function button is clicked, this code is called.
function handleGreenButton() {
    // The argument is red,green,blue and the values are 0 - 255
    particleHelper.callFunction({
        name: 'setColor',
        argument: '0,255,0',
    });
}

// When the Check functionCount button is clicked, this code is called.
function handleCheckFunctionCount() {
    // Because getting a variable is asynchronous, you need to pass a function to
    // call when the result is returned.
    particleHelper.getVariable({
        name: 'functionCount',
        callback: handleFunctionCountResult
    });
}

// This is the function that is called when the variable has been retrieved from
// the device.
function handleFunctionCountResult(res) {
    // Update the text box that has the value in it
    checkFunctionCountInput.value(res);
}

// When the Blue Publish button is clicked, this code is called.
function handleBlueButton() {
    particleHelper.publishEvent({
        name: 'setColor',
        data: '0,0,255',
    });
}

// Power user hints:
// - particleHelper.particle is the Particle API JS object, so you can make any API calld
// - particleHelper.settings.access_token is your access token that you need to pass to most Particle API JS
//   functions in the auth parameter.


function draw() {

}
