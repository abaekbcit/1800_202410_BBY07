//TODO: Place class of favourite button and reviewID
//favourite button can be given an id of the review's id
let favButton = document.getElementsByClassName('');
let reviewID = favButton.id;
favButton.addEventListener('click', function(e) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            db.collection("users").doc(user.uid).get().then(doc => {
                let docFav = doc.get('favourited')
                if (docFav) {
                    var favourites = docFav.concat(reviewID);
                } else {
                    var favourites = [reviewID]
                }
                db.collection("users").doc(user.uid).update({
                    "favourited": favourites
                });
            });
        }
    });
})