//Create a promise that resolves to the current user
let currentUserPromise = new Promise((resolve, reject) => {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            currentUser = db.collection("users").doc(user.uid); //global
            resolve(currentUser);
        } else {
            reject("No user is signed in");
        }
    });
});

//Fills out template card with details after reading review document from DB.
function displayReviewInfo() {
    let params = new URL(window.location.href); //get URL of search bar
    let ID = params.searchParams.get("docID"); //get value for key "id"

    db.collection("reviews")
        .doc(ID)
        .get()
        .then(doc => {
            var title = doc.data().title;
            var spot = doc.data().spot;
            var text = doc.data().text;
            var city = doc.data().city;
            var addr = doc.data().addr;
            var author = doc.data().author;
            var date = doc.data().date;
            var rating = doc.data().spotRating;
            var img = doc.data().img;

            document.title = title;
            document.getElementById("review-title").innerHTML = title;

            let reviewSpot = document.getElementById("review-spot");
            reviewSpot.innerHTML = spot;
            reviewSpot.href = "/pages/spot_pages/spot.html?docID=" + doc.data().spotID;;
            document.getElementById("review-author").innerHTML = author;

            let reviewImg = document.getElementById("review-img");
            if (img) {
                reviewImg.src = img;
            }

            document.getElementById("review-content").innerHTML = text;
            document.getElementById("review-addr").innerHTML = addr + ", " + city;
            document.getElementById("review-date").innerHTML = date;
            document.getElementById("review-rating").innerHTML = "Rating: " + rating + "/5";
        });
}
displayReviewInfo();

//Renders star icon based on whether or not review is in the favorites array in user's document.
//filled-in = is in favorites, outline = not
function checkFavorite() {
    currentUserPromise.then(currentUser => {
        let params = new URL(window.location.href); //get URL of search bar
        let reviewID = params.searchParams.get("docID"); //get value for key "id"
        let star = document.getElementById('star1');

        currentUser.get().then(doc => {
            let favorites = doc.data().favorites;
            if (favorites.includes(reviewID)) {
                star.textContent = 'star'; //set the star button to filled
            } else {
                star.textContent = 'star_outline';
            }
        });

    })

}

checkFavorite();


//Updates favorites array document in the logged in user's document based on the state of the favorite button.
//Also toggles the appearance of the button on click.
function favoriteReview() {
    let params = new URL(window.location.href); //get URL of search bar
    let reviewID = params.searchParams.get("docID"); //get value for key "id"
    let star = document.getElementById('star1');

    if (star.textContent === 'star_outline') {
        star.textContent = 'star';//set the star button to filled
        //add the reviewID to user's favorites array
        currentUser.update({
            favorites: firebase.firestore.FieldValue.arrayUnion(reviewID)
        });

    } else {
        star.textContent = 'star_outline';//set the star button to be unfilled
        //Remove the review ID from favorite array
        currentUser.update({
            favorites: firebase.firestore.FieldValue.arrayRemove(reviewID)
        });

    };
};

//Renders delete button if the author of the review is the same as the logged in user.
//Conversely, renders favorite button if the author of the review is not the same as the logged in user.
function displayDeleteAndFavoriteButton() {
    currentUserPromise.then(currentUser => {
        let params = new URL(window.location.href); //get URL of search bar
        let user = firebase.auth().currentUser;
        let reviewID = params.searchParams.get("docID"); //get value for key "id"

        db.collection("reviews").doc(reviewID).get().then(doc => {
            let authorID = doc.get('authorID');
            if (user.uid !== authorID) { //if the current user is not the author of the review
                let deleteButton = document.getElementById('delete-button');
                deleteButton.style.visibility = 'hidden'; //hide the delete button


            } else { //if the current user is the author of the review
                let favoriteButton = document.getElementById('star1');
                favoriteButton.style.visibility = 'hidden'; //hide the favorite button
            }
        });

    });

}

displayDeleteAndFavoriteButton();


//-----------------Delete Review-----------------//

let deleteButton = document.getElementById('delete-button');

//Confirmation modal to double-check if user wants to delete their review.
function toggleParamModal(param) {
    let modalToToggle = param + '-param-modal';
    var modal = new bootstrap.Modal(document.getElementById(modalToToggle));
    modal.toggle();
}

let off = "btn btn-light dropdown-toggle col";
let on = "btn btn-dark dropdown-toggle col";

function toggleparamButton(button, state) {
    button.className = state;
}

deleteButton.addEventListener('click', () => {
    toggleParamModal('delete');
});

document.getElementById('delete-param-yes').addEventListener('click', () => {
    deleteReview();
});

//Deletes the review from the reviews collection in the DB. The image stored in firebase storage is also deleted.
//Will only delete if logged in user is the author of the review.
function deleteReview() {
    let params = new URL(window.location.href); //get URL of search bar
    let reviewID = params.searchParams.get("docID"); //get value for key "id"
    let user = firebase.auth().currentUser;

    if (user) {
        db.collection("reviews").doc(reviewID).get().then(doc => {
            let authorID = doc.get('authorID');
            if (user.uid === authorID) {
                db.collection("reviews").doc(reviewID).delete().then(() => {
                    window.location.href = "/pages/review_pages/my_written_reviews.html";
                });
                var storageRef = storage.ref("images/" + reviewID + ".jpg");
                storageRef.delete().then(() => {
                });

            } else {
                console.log("You are not the author of this review");
            }
        });
    }
}

