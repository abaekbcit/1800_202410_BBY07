//Loads image carousel with given array of images
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

let carouselHTML = `<div id="spotCarousel" class="carousel slide carousel-fade">
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

//Given info of fields, fills out appropriate parts of the page with the given parameters.
function fillSpotInfo(id, name, category, priceRange, addr, city, zip, imgs, verified, ratingsAvg) {
    document.title = name;
    document.getElementById("spot-name").innerHTML = name;
    document.getElementById("spot-category").innerHTML = category;
    if (priceRange > 0) {
        var price = "$".repeat(priceRange);
    } else {
        var price = "";
    }
    document.getElementById("spot-price").innerHTML = price;
    document.getElementById("spot-addr").innerHTML = addr + ", " + city + ", " + zip;
    if (imgs) {
        document.getElementById('spot-img').innerHTML = carouselHTML;
        loadSpotCarousel(imgs);
    }
    if (verified) {
        document.getElementById('spot-name')
            .insertAdjacentHTML("beforeend", '<img src="/images/google-maps.png" class="card-verified" data-toggle="tooltip" data-placement="right" title="Spot verified on Google Maps"/>');
    }
    if (ratingsAvg) {
        var avgRating = (ratingsAvg).toFixed(1);
    } else {
        var avgRating = "Unrated";
    }
    document.getElementById('spot-rating').innerHTML = avgRating;
    document.getElementById('spot-write-review').href = "/pages/review_pages/review_form.html?docID=" + id;
}

//Reads fields of spot from spots collection in the DB then calls fillSpotInfo() on the read fields.
function displaySpotInfo() {
    let params = new URL(window.location.href); //get URL of search bar
    let ID = params.searchParams.get("docID"); //get value for key "id"

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
            var ratingsAvg = doc.data().ratingsAvg;
            fillSpotInfo(doc.id, name, category, priceRange, addr, city, zip, imgs, verified, ratingsAvg);
        });
}

displaySpotInfo();