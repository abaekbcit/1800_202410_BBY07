var currentUser;

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        currentUser = db.collection("users").doc(user.uid); //global
        console.log(currentUser);
    }
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
            console.log(img);

            document.title = title;
            document.getElementById("review-title").innerHTML = title;
            
            let reviewSpot = document.getElementById("review-spot");
            reviewSpot.innerHTML = spot;
            reviewSpot.href = "spot.html?docID=" + doc.data().spotID;;

            let authorReview = document.getElementById("review-author");
            authorReview.innerHTML = author;

            let reviewImg = document.getElementById("review-img");
            reviewImg.src = img;    
            // document.getElementById("review-author").innerHTML = author;

            document.getElementById("review-content").innerHTML = text;
            document.getElementById("review-addr").innerHTML = addr + ", " + city;


            
            document.getElementById("review-date").innerHTML = date;
            document.getElementById("review-rating").innerHTML = rating;



        });
}
displayReviewInfo();







function favoriteReview() {
    let params = new URL(window.location.href); //get URL of search bar
    let reviewID = params.searchParams.get("docID"); //get value for key "id"
    let star = document.getElementById('star1');

    if (star.textContent === 'star_outline') {
        console.log("Clicked");
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

        console.log("Removed");
    };
};


                // console.log(currentUser.favorites);


                // db.collection("users").doc(user.uid).get().then(doc => {
                //     let docFav = doc.get('favorites')
                //     if (docFav) {
                //         var favorites = docFav.concat(reviewID);
                //     } else {
                //         var favorites = [reviewID]
                //     }
                //     db.collection("users").doc(user.uid).update({
                //         "favorites": favorites
                //     });
                //     console.log(favorites)
                // });

