document.getElementById('spot-params-dist').addEventListener("change", onParamsChanged);
document.getElementById('spot-params-verified').addEventListener('change', onParamsChanged);
document.getElementById('spot-params-rating').addEventListener('change', onParamsChanged);
document.getElementById('spot-params-price').addEventListener('change', onParamsChanged);

function onParamsChanged() {
    let distance = document.getElementById('spot-params-dist').value;
    let verifiedStr = document.getElementById('spot-params-verified').value;
    let verified;
    if (verifiedStr === "true") {
        verified = true;
    } else if (verifiedStr === "false") {
        verified = false;
    }
    let price = document.getElementById('spot-params-price').value;
    let rating = document.getElementById('spot-params-rating').value;
    let sortBy;
    console.log("changed");
    getSpotsByParams(distance, verified, price, rating, sortBy);
}