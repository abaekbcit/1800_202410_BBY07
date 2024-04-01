function displayAllReviews() {
    console.log("called");
    db.collection("reviews").get()
        .then(allReviews=> {
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
        .then(allReviews=> {
            allReviews.forEach(doc => {
                fillTemplates(doc);
            });
        });
}

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
    //TODO: Probably have to change to make image work
    newcard.querySelector('.card-image').innerHTML = img;
    newcard.querySelector('.card-spot').innerHTML = spot;
    newcard.querySelector('.card-city').innerHTML = city;
    newcard.querySelector('a').href = "review.html?docID="+docID;

    if (text.length > 20) {
        text = text.substring(0, 50) + "...";
    }
    newcard.querySelector('.card-text').innerHTML = text;

    document.getElementById('reviews-holder').appendChild(newcard);
}