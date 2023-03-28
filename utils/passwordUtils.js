const bcrypt = require('bcrypt');

// Generates hash and salt based on user's password
function genPassword(password) {

    var salt = bcrypt.genSaltSync(10);
    var genHash = bcrypt.hashSync(password, salt);

    return {
        salt: salt,
        hash: genHash
    };
}

// Checks for valid password
function validatePassword(password, hash, salt) {
 
    var hashVerify = bcrypt.hashSync(password, salt);

    if (hashVerify === hash) return true;
    else return false;
}

module.exports.validatePassword = validatePassword;
module.exports.genPassword = genPassword;