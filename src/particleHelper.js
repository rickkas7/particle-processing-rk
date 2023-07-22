const Particle = require('particle-api-js');

let particleHelper = {};

// https://p5js.org/reference/
particleHelper.particle = new Particle();

particleHelper.settingsKey = 'particleSettings';

particleHelper.tokenDuration = 4 * 3600; // in seconds, default = 4 hours

particleHelper.foregroundColor = '#e0e0e0';

particleHelper.top = 0;
particleHelper.left = 0;

particleHelper.logoutHandler = async function () {
    await particleHelper.particle.deleteCurrentAccessToken({
        auth: particleHelper.settings.access_token,
    });
    removeItem(particleHelper.settingsKey);

    removeElements();
    clear();
    particleHelper.setup();
};

particleHelper.showLogout = function () {
    particleHelper.logoutButton = createButton('Logout');
    particleHelper.logoutButton.position(particleHelper.left + 5, particleHelper.top + 5);
    particleHelper.logoutButton.mousePressed(particleHelper.logoutHandler);

    fill(particleHelper.foregroundColor);
    text('Logged in as ' + particleHelper.settings.username, particleHelper.left + 75, particleHelper.top + 20);

};

particleHelper.showMfa = function () {
    fill(particleHelper.foregroundColor);
    text('MFA Token', particleHelper.left + 5, particleHelper.top + 20);

    particleHelper.mfaInput = createInput('');
    particleHelper.mfaInput.position(particleHelper.left + 70, particleHelper.top + 5);
    particleHelper.mfaInput.size(100);

    particleHelper.loginButton = createButton('Login');
    particleHelper.loginButton.position(particleHelper.left + 5, particleHelper.top + 35);
    particleHelper.loginButton.mousePressed(particleHelper.loginHandler);
};



particleHelper.loginHandler = async function () {
    try {
        if (!particleHelper.settings) {
            particleHelper.settings = {};
        }
        particleHelper.settings.username = particleHelper.userInput.value();

        let res;
        if (!particleHelper.mfa_token) {
            res = await particleHelper.particle.login({
                username: particleHelper.settings.username,
                password: particleHelper.passInput.value(),
                tokenDuration: particleHelper.tokenDuration, // seconds
            });
        }
        else {
            res = await particleHelper.particle.sendOtp({
                mfaToken: particleHelper.mfa_token,
                otp: particleHelper.mfaInput.value(),
            });
            delete particleHelper.mfa_token;
        }

        particleHelper.settings.access_token = res.body.access_token;
        storeItem(particleHelper.settingsKey, particleHelper.settings);

        removeElements();
        clear();
        particleHelper.showLogout();

        if (typeof afterLoggedIn != 'undefined') {
            afterLoggedIn();
        }
    }
    catch (e) {
        if (e.statusCode == 403) {
            particleHelper.mfa_token = e.body.mfa_token;
            removeElements();
            clear();
            particleHelper.showMfa();
        }
        else {
            console.log('login exception', e);
        }
    }
};

// Call this from setup()
particleHelper.setup = async function () {
    particleHelper.settings = getItem(particleHelper.settingsKey);
    if (typeof particleHelper.settings == 'object') {
        console.log('particleHelper.settings', particleHelper.settings);

        try {
            particleHelper.userInfo = await particleHelper.particle.getUserInfo({
                auth: particleHelper.settings.access_token,
            });
            particleHelper.showLogout();
            if (typeof afterLoggedIn != 'undefined') {
                afterLoggedIn();
            }
        }
        catch (e) {
            console.log('exception validating saved token', e);
            removeItem(particleHelper.settingsKey);
            particleHelper.settings = {};
        }
    }

    if (!particleHelper.settings.username) {
        fill(particleHelper.foregroundColor);
        text('Username', particleHelper.left + 5, particleHelper.top + 20);

        particleHelper.userInput = createInput('');
        particleHelper.userInput.position(particleHelper.left + 70, particleHelper.top + 5);
        particleHelper.userInput.size(150);
        // particleHelper.userInput.input(myInputEvent);

        text('Password', 5, 50);
        particleHelper.passInput = createInput('', 'password');
        particleHelper.passInput.position(particleHelper.left + 70, particleHelper.top + 35);
        particleHelper.passInput.size(150);

        particleHelper.loginButton = createButton('Login');
        particleHelper.loginButton.position(particleHelper.left + 5, particleHelper.top + 65);
        particleHelper.loginButton.mousePressed(particleHelper.loginHandler);
    }
};

particleHelper.callFunction = async function({deviceId, name, argument}) {
    return await particleHelper.particle.callFunction({
        deviceId,
        name,
        argument,
        auth: particleHelper.settings.access_token,
    });
}

// getVariable

// publishEvent

particleHelper.selectDevice = async function(options = {}) {
    if (typeof options.left == 'undefined') {
        options.left = particleHelper.left + 5;
    }
    if (typeof options.top == 'undefined') {
        options.top = particleHelper.top + 30;
    }

    const sel = createSelect();

    const deviceList = await particleHelper.particle.listDevices({auth: particleHelper.settings.access_token});

    sel.position(options.left, options.top);
    for(const device of deviceList.body) {
        const name = device.name || device.id;

        if (device.online || options.includeOffline) {
            sel.option(name, device.id);
        }
        sel.changed(function() {
            const deviceId = sel.value();
            particleHelper.deviceId = deviceId;
            if (options.onChanged) {
                option.onChanged(deviceId);
            }
        });
    }
}

module.exports = particleHelper;
