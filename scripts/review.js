//Create a promise that resolves to the current user
let currentUserPromise = new Promise((resolve, reject) => {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            currentUser = db.collection("users").doc(user.uid); //global
            console.log(currentUser);
            resolve(currentUser);
        } else {
            reject("No user is signed in");
        }
    });
});

function displayReviewInfo() {
    let params = new URL(window.location.href); //get URL of search bar
    let ID = params.searchParams.get("docID"); //get value for key "id"


    // doublecheck: is your collection called "Reviews" or "reviews"?
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
            var rating = doc.data().rating;
            var img = doc.data().img;

            document.title = title;
            document.getElementById("review-title").innerHTML = title;

            let reviewSpot = document.getElementById("review-spot");
            reviewSpot.innerHTML = spot;
            reviewSpot.href = "spot.html?docID=" + doc.data().spotID;;

            let authorReview = document.getElementById("review-author");
            authorReview.innerHTML = author;

            let reviewImg = document.getElementById("review-img");
            if (img) {
                reviewImg.src = img;
            }
            // document.getElementById("review-author").innerHTML = author;

            document.getElementById("review-content").innerHTML = text;
            document.getElementById("review-addr").innerHTML = addr + ", " + city;



            document.getElementById("review-date").innerHTML = date;
            document.getElementById("review-rating").innerHTML = rating;



        });
}
displayReviewInfo();

//Check if the review is in the user's favorites
function checkFavorite() {
    currentUserPromise.then(currentUser => {
        let params = new URL(window.location.href); //get URL of search bar
        let reviewID = params.searchParams.get("docID"); //get value for key "id"
        let star = document.getElementById('star1');

        currentUser.get().then(doc => {
            let favorites = doc.data().favorites;
            console.log(favorites);
            if (favorites.includes(reviewID)) {
                star.textContent = 'star'; //set the star button to filled
            } else {
                star.textContent = 'star_outline';
            }
        });

    })

}

checkFavorite();


//-------------Favorite Review-----------------//
function favoriteReview() {
    let params = new URL(window.location.href); //get URL of search bar
    let reviewID = params.searchParams.get("docID"); //get value for key "id"
    let star = document.getElementById('star1');

    if (star.textContent === 'star_outline') {
        console.log("Clicked");
        star.textContent = 'star';//set the star button to filled
        console.log(currentUser);
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

        console.log("Removed");
    };
};

function displayDeleteAndFavoriteButton() {

    currentUserPromise.then(currentUser => {
        let params = new URL(window.location.href); //get URL of search bar
        let user = firebase.auth().currentUser;
        let reviewID = params.searchParams.get("docID"); //get value for key "id"
        console.log(reviewID);
        console.log(user.uid);

        db.collection("reviews").doc(reviewID).get().then(doc => {
            let authorID = doc.get('authorID');
            console.log(authorID);
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



function deleteReview() {
    let params = new URL(window.location.href); //get URL of search bar
    let reviewID = params.searchParams.get("docID"); //get value for key "id"
    let user = firebase.auth().currentUser;
    console.log(user);

    if (user) {
        db.collection("reviews").doc(reviewID).get().then(doc => {
            let authorID = doc.get('authorID');
            if (user.uid === authorID) {
                db.collection("reviews").doc(reviewID).delete().then(() => {
                    console.log("Review deleted");
                    window.location.href = "my_review_list.html";
                });

            } else {
                console.log("You are not the author of this review");
            }
        });
    }

}

