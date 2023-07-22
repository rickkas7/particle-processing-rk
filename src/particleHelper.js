const Particle = require('particle-api-js');

let particleHelper = {};

// https://p5js.org/reference/
particleHelper.particle = new Particle();

particleHelper.settingsKey = 'particleSettings';

particleHelper.tokenDuration = 4 * 3600; // in seconds, default = 4 hours

particleHelper.foregroundColor = '#e0e0e0';

particleHelper.logoutHandler = async function () {
    await particleHelper.particle.deleteCurrentAccessToken({
        auth: particleHelper.settings.access_token,
    });
    removeItem(particleHelper.settingsKey);

    removeElements();
    clear();
    particleHelper.startup();
};

particleHelper.showLogout = function () {
    particleHelper.logoutButton = createButton('Logout');
    particleHelper.logoutButton.position(5, 5);
    particleHelper.logoutButton.mousePressed(particleHelper.logoutHandler);

    fill(particleHelper.foregroundColor);
    text('Logged in as ' + particleHelper.settings.username, 75, 20);

};

particleHelper.showMfa = function () {
    fill(particleHelper.foregroundColor);
    text('MFA Token', 5, 20);

    particleHelper.mfaInput = createInput('');
    particleHelper.mfaInput.position(70, 5);
    particleHelper.mfaInput.size(100);

    particleHelper.loginButton = createButton('Login');
    particleHelper.loginButton.position(5, 35);
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

        console.log('res', res);
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

particleHelper.startup = async function () {
    particleHelper.settings = getItem(particleHelper.settingsKey);
    if (typeof particleHelper.settings == 'object') {
        // console.log('particleHelper.settings', particleHelper.settings);

        try {
            particle.userInfo = await particleHelper.particle.getUserInfo({
                auth: particleHelper.settings.access_token,
            });
            particleHelper.showLogout();
            if (typeof afterLoggedIn != 'undefined') {
                afterLoggedIn();
            }
        }
        catch (e) {
            removeItem(particleHelper.settingsKey);
            particleHelper.settings = {};
        }
    }

    if (!particleHelper.settings.username) {
        fill(particleHelper.foregroundColor);
        text('Username', 5, 20);

        particleHelper.userInput = createInput('');
        particleHelper.userInput.position(70, 5);
        particleHelper.userInput.size(100);
        // particleHelper.userInput.input(myInputEvent);

        text('Password', 5, 50);
        particleHelper.passInput = createInput('', 'password');
        particleHelper.passInput.position(70, 35);
        particleHelper.passInput.size(100);

        particleHelper.loginButton = createButton('Login');
        particleHelper.loginButton.position(5, 65);
        particleHelper.loginButton.mousePressed(particleHelper.loginHandler);
    }
};

export default particleHelper;
