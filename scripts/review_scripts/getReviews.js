//Displays all reviews
function displayAllReviews() {
    db.collection("reviews").get()
        .then(allReviews => {
            allReviews.forEach(doc => {
                fillTemplates(doc);
            });
        });
}

//Queries DB for only review documents written by logged in user. Those documents are then sent to 
//fillTemplates() to display the docs.
function displayMyReviews() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            const userID = user.uid;
            //select those reviews where the key "authorID" is equal to current user's userID
            db.collection("reviews").where("authorID", "==", userID).get()
                .then(myReviews => {
                    let empty = true;
                    myReviews.forEach(doc => {
                        empty = false;
                        fillTemplates(doc);
                    });
                    if (empty) {
                        let html = `<div class="my-5">
                                        <h2>Oops! looks like you haven't written any reviews yet</h2>
                                        <br/>
                                        <h4>Go to some spots on the <a href="/pages/main.html">home</a> page to write some!</h4>
                                    </div>`;
                        document.getElementById('reviews-holder').innerHTML = html;
                    } else {
                        let html = `<div class="my-5">
                                        <h3>Reviews written by ${user.displayName}</h3>
                                    </div>`;
                        document.getElementById('reviews-container').insertAdjacentHTML("afterbegin", html);
                    }
                });
        }
    });
}

//Queries the DB for reviews that are written for a particular spot. Sends the resulting 
// documents to be displayed by fillTemplates()
function displayReviewsBySpot() {
    let params = new URL(window.location.href);
    let spotID = params.searchParams.get("docID");

    db.collection("reviews").where("spotID", "==", spotID).get()
        .then(allReviews => {
            allReviews.forEach(doc => {
                fillTemplates(doc);
            });
        });
}

//Queries DB for only reviews that are favorited by the logged in user. Sends the resulting
//documents to be displayed by fillTemplates(). If no user has no written review, displays a
//generic message indicating so.
function displayMyFavoriteReviews() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            const userID = user.uid;
            const userName = user.displayName
            //select the current user doc
            db.collection("users").doc(userID).get()
                .then(user => {
                    let favorites = user.data().favorites;
                    if (favorites == null || favorites.length === 0) {
                        let html = `<div class="my-5">
                                        <h2>Oops! looks like you have no favorited reviews</h2>
                                        <br/>
                                        <h4>Go to the <a href="/pages/review_pages/all_reviews.html">reviews</a> page to read some!</h4>
                                    </div>`;
                        document.getElementById('reviews-holder').innerHTML = html;
                    } else {
                        let html = `<div class="my-5">
                                        <h3>${userName}'s favorite reviews</h3>
                                    </div>`;
                        document.getElementById('reviews-container').insertAdjacentHTML("afterbegin", html);
                        favorites.forEach(reviewID => {
                            //for each review id stored in the favorite array, get the review doc
                            db.collection("reviews").doc(reviewID).get()
                                .then(doc => {
                                    fillTemplates(doc);
                                });
                        });
                    }
                });
        }
    });
}

//Fills review card templates with data from doc
function fillTemplates(doc) {
    let cardTemplate = document.getElementById("reviewCardTemplate");
    var title = doc.data().title;
    var img = doc.data().img;
    var spot = doc.data().spot;
    var text = doc.data().text;
    var city = doc.data().city;
    var docID = doc.id;
    let newcard = cardTemplate.content.cloneNode(true);

    newcard.querySelector('.card-title').innerHTML = title;
    if (img) {
        newcard.querySelector('.card-image').src = img;
    }
    newcard.querySelector('.card-spot').innerHTML = spot;
    newcard.querySelector('.card-city').innerHTML = city;
    newcard.querySelector('a').href = "/pages/review_pages/review.html?docID=" + docID;

    if (text.length > 20) {
        text = text.substring(0, 50) + "...";
    }
    newcard.querySelector('.card-text').innerHTML = text;

    document.getElementById('reviews-holder').appendChild(newcard);
}