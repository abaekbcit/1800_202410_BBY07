let reviewForm = document.getElementById('review-form');
reviewForm.addEventListener('submit', function(e) {
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

function resetReviewFields() {
    document.getElementById('input-rv-title').value = null;
    document.getElementById('input-rv-spot-rating').value = 0;
    document.getElementById('rv-rating-output').innerHTML = 0/5;
    document.getElementById('input-rv-textarea').value = null;
    document.getElementById('input-rv-img').value = null;
    document.getElementById('input-rv-img-goes-here').src = "";
}

document.getElementById('reset-review').addEventListener('click', () => {
    resetReviewFields();
});

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
            }).then(function(res) {
                reviewID = res.id;
                resetReviewFields();
                reviewPostedAlert();
                if (document.getElementById("input-rv-img-goes-here").src != "") {
                    uploadPic(reviewID);
                }
            });
            db.collection("spots").doc(spotID).get().then(doc => {
                let ratingsAvg = doc.get('ratingsAvg');
                let ratingsCount = doc.get('ratingsCount');
                let newCount;
                let newAvg;
                if (ratingsAvg) {
                    newCount = ratingsCount + 1;
                    newAvg = (ratingsAvg * ratingsCount + parseInt(spotRating)) / newCount;
                } else {
                    newCount = 1;
                    newAvg = parseInt(spotRating);
                }
                db.collection("spots").doc(spotID).update({
                    "ratingsAvg": newAvg,
                    "ratingsCount": newCount
                });
            });
        }
    });
}

let goHome = document.getElementById('rv-post-go-home');

function reviewPostedAlert() {
    var modal = new bootstrap.Modal(document.getElementById('review-posted-modal')); 
    modal.toggle(); 
}

goHome.addEventListener('click', function(e) {
    window.location.assign("review.html?docID=" + reviewID);
});

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
backToReview.addEventListener('click', function(e) {
    window.location.assign("spot.html?docID=" + spotID);
})


var ImageFile;
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

function uploadPic(postDocID) {
    console.log("inside uploadPic " + postDocID);
    var storageRef = storage.ref("images/" + postDocID + ".jpg");

    storageRef.put(ImageFile)   //global variable ImageFile
       
                   // AFTER .put() is done
        .then(function () {
            console.log('2. Uploaded to Cloud Storage.');
            storageRef.getDownloadURL()

                 // AFTER .getDownloadURL is done
                .then(function (url) { // Get URL of the uploaded file
                    console.log("3. Got the download URL.");
                    
                    // Now that the image is on Storage, we can go back to the
                    // post document, and update it with an "image" field
                    // that contains the url of where the picture is stored.
                    db.collection("reviews").doc(postDocID).update({

                            "img": url // Save the URL into users collection
                        })
                         // AFTER .update is done
                        .then(function () {
                            console.log('4. Added pic URL to Firestore.');
                            // One last thing to do:
                            // save this postID into an array for the OWNER
                            // so we can show "my posts" in the future
                            // savePostIDforUser(postDocID);
                        })
                })
        })
        .catch((error) => {
             console.log("error uploading to cloud storage");
        })
}