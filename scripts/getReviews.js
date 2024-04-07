function displayAllReviews() {
    console.log("called");
    db.collection("reviews").get()
        .then(allReviews => {
            allReviews.forEach(doc => {
                fillTemplates(doc);
            });
        });
}

function displayMyReviews() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            const userID = user.uid;
            //select those reviews where the key "authorID" is equal to current user's userID
            db.collection("reviews").where("authorID", "==", userID).get()
                .then(myReviews => {
                    myReviews.forEach(doc => {
                        fillTemplates(doc);
                    });
                });
        }
    });
}

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
                                        <h2>Oops! looks like you have no favourited reviews</h2>
                                        <br/>
                                        <h4>Go to the <a href="review_list.html">reviews</a> page to read some!</h4>
                                    </div>`;
                        document.getElementById('reviews-holder').innerHTML =  html;
                    } else {
                        let html = `<div class="my-5">
                                        <h3>${userName}'s favourite reviews</h3>
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

function fillTemplates(doc) {
    let cardTemplate = document.getElementById("reviewCardTemplate");
    var title = doc.data().title;
    var img = doc.data().img;
    console.log(img);
    var spot = doc.data().spot;
    var text = doc.data().text;
    var city = doc.data().city;
    var docID = doc.id;
    let newcard = cardTemplate.content.cloneNode(true);

    newcard.querySelector('.card-title').innerHTML = title;
    //TODO: Probably have to change to make image work
    if (img) {
        newcard.querySelector('.card-image').src = img;
    }
    newcard.querySelector('.card-spot').innerHTML = spot;
    newcard.querySelector('.card-city').innerHTML = city;
    newcard.querySelector('a').href = "review.html?docID=" + docID;

    if (text.length > 20) {
        text = text.substring(0, 50) + "...";
    }
    newcard.querySelector('.card-text').innerHTML = text;

    document.getElementById('reviews-holder').appendChild(newcard);
}