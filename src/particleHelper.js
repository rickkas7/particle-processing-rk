const Particle = require('particle-api-js');

let particleHelper = {
    settingsKey: 'particleSettings',
    tokenDuration: 4 * 3600, // in seconds, default = 4 hours
    foregroundColor: '#e0e0e0',
    top: 5,
    left: 5,
    labels: {
        username: 'Username',
        password: 'Password',
        mfaToken: 'MFA Token',
        loginButton: 'Login',
        logoutButton: 'Logout',
        loggedInAs: 'Logged in as',
    },
    lineExtra: 8,
};

// https://p5js.org/reference/
particleHelper.particle = new Particle();


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
    particleHelper.logoutButton = createButton(particleHelper.labels.logoutButton);
    particleHelper.logoutButton.position(particleHelper.left, particleHelper.top);
    particleHelper.logoutButton.mousePressed(particleHelper.logoutHandler);

    const ascent = textAscent() / displayDensity();

    fill(particleHelper.foregroundColor);
    text(particleHelper.labels.loggedInAs + ' ' + particleHelper.settings.username, particleHelper.left + 70, particleHelper.top + ascent);

};

particleHelper.showMfa = function () {
    const ascent = textAscent() / displayDensity();
    const lineHeight = (textAscent() + textDescent()) / displayDensity() + particleHelper.lineExtra;

    const labelWidth = textWidth(particleHelper.labels.mfaToken) + 5;

    let top = particleHelper.top;

    fill(particleHelper.foregroundColor);
    text(particleHelper.labels.mfaToken, particleHelper.left, top + ascent);

        
    particleHelper.mfaInput = createInput('');
    particleHelper.mfaInput.position(particleHelper.left + labelWidth, top);
    particleHelper.mfaInput.size(100);
    top += lineHeight;

    particleHelper.loginButton = createButton(particleHelper.labels.loginButton);
    particleHelper.loginButton.position(particleHelper.left, top);
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
    if (particleHelper.settings && typeof particleHelper.settings == 'object') {
        // console.log('particleHelper.settings', particleHelper.settings);

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

    if (!particleHelper.settings) {
        particleHelper.settings = {};
    }


    if (!particleHelper.settings.username) {

        const ascent = textAscent() / displayDensity();
        const lineHeight = (textAscent() + textDescent()) / displayDensity() + particleHelper.lineExtra;


        const labelWidth = Math.max(
            textWidth(particleHelper.labels.username), 
            textWidth(particleHelper.labels.password)) + 5;

        let top = particleHelper.top;

        fill(particleHelper.foregroundColor);
        text(particleHelper.labels.username, particleHelper.left, top + ascent);

        particleHelper.userInput = createInput('');
        particleHelper.userInput.position(particleHelper.left + labelWidth, top);
        particleHelper.userInput.size(150);
        // particleHelper.userInput.input(myInputEvent);
        top += lineHeight;

        text(particleHelper.labels.password, particleHelper.left, top + ascent);
        particleHelper.passInput = createInput('', 'password');
        particleHelper.passInput.position(particleHelper.left + labelWidth, top);
        particleHelper.passInput.size(150);
        top += lineHeight;

        particleHelper.loginButton = createButton(particleHelper.labels.loginButton);
        particleHelper.loginButton.position(particleHelper.left, top);
        particleHelper.loginButton.mousePressed(particleHelper.loginHandler);
    }
};

particleHelper.callFunction = async function({deviceId, name, argument, callback = null}) {
    if (!deviceId) {
        deviceId = particleHelper.deviceId;
    }
    if (!argument) {
        argument = '';
    }

    const res = await particleHelper.particle.callFunction({
        deviceId,
        name,
        argument,
        auth: particleHelper.settings.access_token,
    });

    // console.log('callFunction', res);

    /*
    { 
        "body": {
            "id": "<device_id>",
            "name": "<device_name>",
            "connected": true,
            "return_value": 0
        },
        "statusCode": 200
    */
    
    if (callback && res.statusCode == 200) {
        callback(res.body.return_value);
    }
    

    return res;
}

particleHelper.getVariable = async function({deviceId, name, callback = null}) {
    if (!deviceId) {
        deviceId = particleHelper.deviceId;
    }

    const res = await particleHelper.particle.getVariable({
        deviceId,
        name,
        auth: particleHelper.settings.access_token,
    });

    // console.log('getVariable', res);
    
    if (callback && res.statusCode == 200) {
        callback(res.body.result);
    }
    

    return res;
}

particleHelper.publishEvent = async function({name, data = ''}) {
    const res = await particleHelper.particle.publishEvent({
        name,
        data,
        auth: particleHelper.settings.access_token,
    });

    console.log('publishEvent', res);   
}

particleHelper.selectDevice = async function(options = {}) {
    if (typeof options.left == 'undefined') {
        options.left = particleHelper.left + 5;
    }
    if (typeof options.top == 'undefined') {
        options.top = particleHelper.top + 30;
    }

    let left = options.left;

    if (options.label) {
        fill(particleHelper.foregroundColor);

        text(options.label, left, options.top + textAscent() / displayDensity());
        left += textWidth(options.label) + 5;
    }

    const sel = createSelect();

    const deviceList = await particleHelper.particle.listDevices({auth: particleHelper.settings.access_token});

    if (deviceList.body.length > 0) {
        particleHelper.deviceId = deviceList.body[0].id;
    }

    sel.position(left, options.top);
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
