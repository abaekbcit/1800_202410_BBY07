function displayReviewInfo() {
    let params = new URL(window.location.href); //get URL of search bar
    let ID = params.searchParams.get("docID"); //get value for key "id"

    // doublecheck: is your collection called "Reviews" or "reviews"?
    db.collection("spots")
        .doc(ID)
        .get()
        .then(doc => {
            document.title = ;
            var title = doc.data().title;
            var spot = doc.data().spot;
            var text = doc.data().text;
            var city = doc.data().city;
            var addr = doc.data().addr;
            var author = doc.data().author;
            var date = doc.data().date;
            var rating = doc.data().rating;

            // only populate title, and image
            document.getElementById("review-title").innerHTML = title;
            document.getElementById("review-spot").innerHTML = spot;
            document.getElementById("review-content").innerHTML = text;
            document.getElementById("review-addr").innerHTML = addr + "," + city;
            //TODO: need to displace user name instead of user ID
            document.getElementById("review-author").innerHTML = author;
            document.getElementById("review-date").innerHTML = date;
            document.getElementById("review-rating").innerHTML = rating;



        });
}
displayReviewInfo();







function favoriteReview() {
    let params = new URL(window.location.href); //get URL of search bar
    let reviewID = params.searchParams.get("docID"); //get value for key "id"
    let star = document.getElementById('star1');

    firebase.auth().onAuthStateChanged(function (user) {
        const userID = user.uid;

        console.log("Clicked");
        if (star.textContent === 'star_outline') {
            console.log("clicked");
            star.textContent = 'star';
            
            db.collection("users").doc(userID).add({
                favorites: reviewID,
            })


    } else {
            star.textContent = 'star_outline';
        }


    });








}