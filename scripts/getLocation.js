const http = new XMLHttpRequest();
let result = document.querySelector("#result")

// document.querySelector("#share").addEventListener
// ("click", () =>{
//     findMyCoordinates()
// })

function findMyCoordinates() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition
            ((position) => {
                console.log(position.coords.latitude, position.coords.longitude)

                updateUserLocation(position.coords) 



                // const bdcAPI = `https://api.bigdatacloud.net/data/reverse-geocode-client?
                // latitude=${position.coords.latitude}&
                // longitude=${position.coords.longitude}`
                // console.log(bdcAPI);

                // getAPI(bdcAPI);
            },
                (err) => {
                    alert(err.message)
                })
    } else {
        alert("Geolocation is not supported by your browser")
    }
}
function updateUserLocation(coords) {
    let lat = coords.latitude;
    let lng = coords.longitude;
    let position = { lat: lat, lng: lng };

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            db.collection("users").doc(user.uid).update({
                "position": position
            });
        }
    });
}
// function getAPI(bdcAPI){
//     http.open("GET", bdcAPI)
//     http.send()
//     http.onreadystatechange = function(){
//         if(this.readyState == 4 && this.status == 200){
//             result.innerHTML = this.responseText;
//             const results = JSON.parse(this.responseText)
//             console.log(results.locality)
//         }
//     }
// }

findMyCoordinates();