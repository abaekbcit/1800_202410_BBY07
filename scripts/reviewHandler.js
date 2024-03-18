//TODO: Place class of favourite button and reviewID
//can get reviewID from the URL
let favButton = document.getElementsByClassName('');
let reviewID = '';
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
});

let rateUpButton = document.getElementsByClassName('review-up');
rateUpButton.addEventListener('click', function(e) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            db.collection("users").doc(user.uid).get().then(doc => {
                let docLiked = doc.get('liked');
                if (docLiked) {
                    var liked = docLiked.concat(reviewID);
                } else {
                    var liked = [reviewID];
                }
                db.collection("users").doc(user.uid).update({
                    "liked": liked
                });
            });
            if (!isLiked()) {
                db.collection("reviews").doc(reviewID).get().then(doc => {
                    let rating = doc.get('rating');
                    db.collection("reviews").doc(reviewID).set({
                        "rating": rating + 1
                    });
                });
            }
        }
    });
});

function isLiked() {
    let liked = false;
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            db.collection("users").doc(user.uid).get().then(doc => {
                let docLiked = doc.get('liked')
                if (docLiked) {
                    liked = docLiked.includes(reviewID);
                }
                return liked;
            });
        }
    });
}

function displayLiked() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            db.collection("users").doc(user.uid).get().then(doc => {
                if (isLiked()) {
                    //TODO: change button appearance instead of disabling.
                    document.getElementById('review-up').setAttribute("disabled", "");
                }
            });
        }
    });
}

displayLiked();