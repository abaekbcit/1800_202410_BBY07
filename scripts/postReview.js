let reviewForm = document.getElementById('review-form');
reviewForm.addEventListener('submit', function(e) {
    e.preventDefault();
    let title = document.getElementById('input-rv-title').value;
    let spot = document.getElementById('input-rv-spot').value;
    let spotRating = document.getElementById('input-rv-spot-rating').value;
    let text = document.getElementById('input-rv-textarea').value;
    let img = document.getElementById('input-rv-img').value;
    addReview(title, spot, spotRating, text, img);
});

let reviewID;

let params = new URL(window.location.href);
let spotID = params.searchParams.get("docID");

function addReview(title, spot, spotRating, text, img) {
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
                spotRating: spotRating,
                text: text,
                img: img,
                rating: 0
            }).then(function(res) {
                reviewID = res.id;
                reviewForm.reset();
                reviewPostedAlert();
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
