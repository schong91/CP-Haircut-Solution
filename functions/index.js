const functions = require("firebase-functions");

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.updUser = functions.firestore
.document()
.onUpdate((chg, ctx) => {
    const userId = ctx.params.userId;

    const newPassword = chg.after.data.user.personal_details.password;
    const newPhoneNumber = chg.after.user.personal_details.phone_number;

    admin.auth().updateUser(userId, {
        password: 'newPassword'
        
    })
    .then((userRecord) => {
        console.log(userRecord);
    })
    .catch((error) => {
        console.log(error)
    })
})