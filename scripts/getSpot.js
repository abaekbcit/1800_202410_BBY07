function loadSpotCarousel(imgs) {
    imgs.forEach((img, i) => {
        if (i === 0) {
            var slide = `<div class="carousel-item active">
                            <img src=${img} class="d-block w-100 carousel-img" alt="...">
                        </div>`;
        } else {
            var slide = `<div class="carousel-item">
                            <img src=${img} class="d-block w-100 carousel-img" alt="...">
                        </div>`;
        }
        document.getElementById('spot-imgs-entrance').insertAdjacentHTML("beforeend", slide);
    });
}

function displayReviewInfo() {
    let params = new URL(window.location.href); //get URL of search bar
    let ID = params.searchParams.get("docID"); //get value for key "id"

    // doublecheck: is your collection called "Reviews" or "reviews"?
    db.collection("spots")
        .doc(ID)
        .get()
        .then(doc => {
            var name = doc.data().name;
            var category = doc.data().category;
            var priceRange = doc.data().price;
            var addr = doc.data().addr;
            var city = doc.data().city;
            var zip = doc.data().zip;
            var imgs = doc.data().imgs;
            var verified = doc.data().verified;

            document.title = name;
            document.getElementById("spot-name").innerHTML = name;
            document.getElementById("spot-category").innerHTML = category;
            if (priceRange > 0) {
                var price = "$".repeat(doc.data().price);
            } else {
                var price = "";
            }
            document.getElementById("spot-price").innerHTML = price;
            document.getElementById("spot-addr").innerHTML = addr + ", " + city + ", " + zip;
            if (imgs) {
                document.getElementById('spot-img').innerHTML = 
                `<div id="spotCarousel" class="carousel slide carousel-fade">
                    <div class="carousel-inner" id="spot-imgs-entrance">
                    </div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#spotCarousel" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Previous</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#spotCarousel" data-bs-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Next</span>
                    </button>
                </div>`; 
                loadSpotCarousel(imgs);
            }
            if (verified) {
                document.getElementById('spot-name')
                    .insertAdjacentHTML("beforeend", '<img src="images/google-maps.png" class="card-verified" data-toggle="tooltip" data-placement="right" title="Spot verified on Google Maps"/>');
            }
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