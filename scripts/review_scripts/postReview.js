let reviewForm = document.getElementById('review-form');
reviewForm.addEventListener('submit', function (e) {
    e.preventDefault();
    let title = document.getElementById('input-rv-title').value;
    let spot = document.getElementById('input-rv-spot').value;
    let addr = document.getElementById('input-rv-addr').value;
    let city = document.getElementById('input-rv-city').value;
    let spotRating = document.getElementById('input-rv-spot-rating').value;
    let text = document.getElementById('input-rv-textarea').value;
    let img = "";
    addReview(title, spot, addr, city, spotRating, text, img);
});

let reviewID;

let params = new URL(window.location.href);
let spotID = params.searchParams.get("docID");

//Resets some fields in the review form
function resetReviewFields() {
    document.getElementById('input-rv-title').value = null;
    document.getElementById('input-rv-spot-rating').value = 0;
    document.getElementById('rv-rating-output').innerHTML = 0 / 5;
    document.getElementById('input-rv-textarea').value = null;
    document.getElementById('input-rv-img').value = "";
    document.getElementById('input-rv-img-goes-here').src = "";
}

document.getElementById('reset-review').addEventListener('click', () => {
    resetReviewFields();
});

//Returns the appropriate average rating and rating count. 
//If ratingsAvg don't exist yet, newAvg is simply the rating and newCount is 1.
//If ratingsAvg exist, we can multiply ratingsAvg with ratingsCount to get the sum. We then add rating to it 
//and divide by newCount, which will just be ratingsCount + 1. The we have our new average.
function getRating(ratingsAvg, ratingsCount, rating) {
    let newCount;
    let newAvg;
    if (ratingsAvg) {
        newCount = ratingsCount + 1;
        newAvg = (ratingsAvg * ratingsCount + rating) / newCount;
    } else {
        newCount = 1;
        newAvg = rating;
    }
    return ({newCount: newCount, newAvg: newAvg});
}

//Updates the spot document with spotID's ratingsAvg and ratingsCount with new calculated values.
function updateSpotRating(spotID, rating) {
    db.collection("spots").doc(spotID).get().then(doc => {
        let ratingsAvg = doc.get('ratingsAvg');
        let ratingsCount = doc.get('ratingsCount');
        let newRating = getRating(ratingsAvg, ratingsCount, rating);
        db.collection("spots").doc(spotID).update({
            "ratingsAvg": newRating.newAvg,
            "ratingsCount": newRating.newCount
        });
    });
}

//Adds a review with given parameters to the reviews collection in the DB.
function addReview(title, spot, addr, city, spotRating, text, img) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            const userID = user.uid;
            var reviewsDB = db.collection("reviews");
            reviewsDB.add({
                title: title,
                authorID: userID,
                author: user.displayName,
                date: new Date().toLocaleDateString(),
                spot: spot,
                spotID: spotID,
                spotRating: parseInt(spotRating),
                addr: addr,
                city: city,
                text: text,
                img: img,
            }).then(function (res) {
                reviewID = res.id;
                resetReviewFields();
                reviewPostedAlert();
                if (document.getElementById("input-rv-img-goes-here").src != "") {
                    uploadPic(reviewID);
                }
            });
            updateSpotRating(spotID, parseInt(spotRating));
        }
    });
}

let goHome = document.getElementById('rv-post-go-home');

//Modal for alerting review has been posted.
function reviewPostedAlert() {
    var modal = new bootstrap.Modal(document.getElementById('review-posted-modal'));
    modal.toggle();
}

goHome.addEventListener('click', function (e) {
    window.location.assign("/pages/review_pages/review.html?docID=" + reviewID);
});

//Reads fields from the spot document with id of spotID and fills in fields in the form.
function fillFields() {
    db.collection("spots").doc(spotID).get().then(spot => {
        document.getElementById('input-rv-spot').value = spot.data().name;
        document.getElementById('input-rv-addr').value = spot.data().addr;
        document.getElementById('input-rv-city').value = spot.data().city;
        document.getElementById('input-rv-zip').value = spot.data().zip;
    });
}

fillFields();

let backToReview = document.getElementById('back-to-review');
backToReview.addEventListener('click', function (e) {
    window.location.assign("/pages/spot_pages/spot.html?docID=" + spotID);
})

//--------Image upload functions taken from 1800 Tech Tips (202410)

var ImageFile;
//Image uploaded in the form is passed to a variable for later use (storing to firebase Storage).
function listenFileSelect() {
    // listen for file selection
    var fileInput = document.getElementById("input-rv-img"); // pointer #1
    const image = document.getElementById("input-rv-img-goes-here"); // pointer #2

    // When a change happens to the File Chooser Input
    fileInput.addEventListener('change', function (e) {
        ImageFile = e.target.files[0];   //Global variable
        var blob = URL.createObjectURL(ImageFile);
        image.src = blob; // Display this image
    })
}
listenFileSelect();

//Stores image in firebaseStorage with the review's ID as the name of the image file.
function uploadPic(postDocID) {
    var storageRef = storage.ref("images/" + postDocID + ".jpg");

    storageRef.put(ImageFile)   //global variable ImageFile

        // AFTER .put() is done
        .then(function () {
            storageRef.getDownloadURL()

                // AFTER .getDownloadURL is done
                .then(function (url) { // Get URL of the uploaded file

                    // Now that the image is on Storage, we can go back to the
                    // post document, and update it with an "image" field
                    // that contains the url of where the picture is stored.
                    db.collection("reviews").doc(postDocID).update({

                        "img": url // Save the URL into users collection
                    })
                })
        })
        .catch((error) => {
            console.log("error uploading to cloud storage");
        })
}