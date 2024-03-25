function displayCardsDynamically() {
    let cardTemplate = document.getElementById("reviewCardTemplate"); // Retrieve the HTML element with the ID "hikeCardTemplate" and store it in the cardTemplate variable. 
    db.collection("spots").get()
        .then(allReviews=> {
            allReviews.forEach(doc => {
                var name = doc.data().name;
                var img = doc.data().imgs[0];
                var category = doc.data().category;
                var city = doc.data().city;
                var priceRange = doc.data().price;
                var verified = doc.data().verified;
                var docID = doc.id;
                let newcard = cardTemplate.content.cloneNode(true);
                newcard.querySelector('.card-title').innerHTML = name;
                //TODO: Probably have to change to make image work
                if (img) {
                    newcard.querySelector('.card-image').src = img;
                }
                if (priceRange > 0) {
                    var price = "  ·  " + "$".repeat(doc.data().price);
                } else {
                    var price = "";
                }
                newcard.querySelector('.card-cat-price').innerHTML = category + price;
                newcard.querySelector('.card-city').innerHTML = city;
                if (verified) {
                    newcard.querySelector('.verified-entrance')
                        .insertAdjacentHTML("beforeend", '<img src="images/google-maps.png" class="card-verified" data-toggle="tooltip" data-placement="right" title="Spot verified on Google Maps"/>');
                }
                newcard.querySelector('a').href = "spot.html?docID="+docID;
                document.getElementById('reviews-holder').appendChild(newcard);
            });
        });
}

displayCardsDynamically();

