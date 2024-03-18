let reviewForm = document.getElementById('review-form');
reviewForm.addEventListener('submit', function(e) {
    e.preventDefault();
    //Province commented out for now, might limit to BC
    let title = document.getElementById('input-rv-title').value;
    let spot = document.getElementById('input-rv-spot').value;
    let addr = document.getElementById('input-rv-addr').value;
    let city = document.getElementById('input-rv-city').value;
    //let province = document.getElementById('input-rv-province').value;
    let zip = document.getElementById('input-rv-zip').value;
    let text = document.getElementById('input-rv-textarea').value;
    let img = document.getElementById('input-rv-img').value;
    //addReview(title, spot, addr, city, province, zip, text, img, data);
    addReview(title, spot, addr, city, zip, text, img);
})

function addReview(title, spot, addr, city, zip, text, img) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            const userID = user.uid;
            var reviewsDB = db.collection("reviews");
            reviewsDB.add({
                title: title,
                author: userID,
                date: new Date().toLocaleDateString(),
                spot: spot,
                addr: addr,
                city: city,
                zip: zip,
                text: text,
                img: img
            }).then(function(res) {
                reviewForm.reset();
                reviewPostedAlert();
            });
        }
    });
}

function reviewPostedAlert() {
    console.log("called");
    var modal = new bootstrap.Modal(document.getElementById('review-posted-modal')); 
    modal.toggle(); 
}

let goHome = document.getElementById('rv-post-go-home');
goHome.addEventListener('click', function(e) {
    window.location.assign("main.html");
})

