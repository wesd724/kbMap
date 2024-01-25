const glc = document.getElementById("glc");
const myloc = document.getElementById("myloc");
const cancel = document.getElementById("cancel");
const searchicon = document.getElementById("searchicon");
const accuracyloc = document.getElementById("accuracyloc");
const errorWindow = document.getElementById("errorModal");
const errorMessage = document.getElementsByClassName("errorMessage")[0];
const container = document.getElementById('kakao');
const Koptions = {
    center: new kakao.maps.LatLng(37.5740381, 126.9745863),
    level: 3
};
const Kmap = new kakao.maps.Map(container, Koptions);
const imageSrc = './image/marker.png';
const imageSize = new kakao.maps.Size(49, 55);
const imageOption = { offset: new kakao.maps.Point(24, 55) };
const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
const options = {
    enableHighAccuracy: false
};
const Sicon = document.getElementById("searchicon");
const view = document.getElementsByClassName("view")[0];
const k_search = document.getElementsByClassName("kakaosearch")[0];
const k_list = document.getElementById("kakaolist");
const Ksearch = document.getElementsByClassName("kakaosearch");
const Klist = document.getElementById("kakaolist");

let watch;
let rtl = []; //real time location
let mypos = [];
let count = 0;
let state;
let move = [];
let markers = [];


const errorMsg = (message) => {
    errorWindow.style.display = "block";
    errorMessage.textContent = message;
}

document.getElementById("modal_close_btn").onclick = () => {
    document.getElementById("modal").style.display = "none";
    document.getElementById("glc").style.display = "block";
    document.getElementById("searchicon").style.display = "block";
    document.getElementById("reload").style.display = "block";
}

document.getElementById("Emodal_close_btn").onclick = () => {
    if (errorWindow.style.display == "") {
        errorWindow.style.display = "block";
    } else if (errorWindow.style.display == "block") {
        errorWindow.style.display = "";
        errorMessage.textContent = "";
    }
}

glc.onclick = () => {
    if (navigator.geolocation) {
        myloc.style.display = "block";
        cancel.style.display = "block";
        accuracyloc.style.display = "block";
        watch = navigator.geolocation.watchPosition((pos) => {
            myloc.onclick = '';
            rtl.push({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            let markerPosition = new kakao.maps.LatLng(rtl[count].lat, rtl[count].lng);
            myloc.onclick = () => Kmap.panTo(markerPosition);
            mypos[count] = new kakao.maps.Marker({
                position: markerPosition,
                image: markerImage,
            });
            if (count > 0) mypos[count - 1].setMap(null);
            mypos[count].setMap(Kmap);
            count++;
        }, (error) => {
            switch (error.code) {
                case error.UNKNOWN_ERROR:
                    errorMsg(error.message)// 기타 알 수 없는 오류가 발생하였을 때
                    break;
                case error.PERMISSION_DENIED:
                    errorMsg(error.message) // 사용자가 위치정보 사용을 허용하지 않았을 때
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg(error.message) // 위치 정보 사용이 불가능할 때
                    break;
                case error.TIMEOUT:
                    errorMsg(error.message) // 위치 정보를 가져오려 시도했지만, 시간이 초과되었을 때
                    break;
            }
        }, options);
    } else {
        errorMsg("이 브라우저에서는 GPS를 지원되지 않습니다.");
    }
}

cancel.onclick = () => {
    myloc.style.display = "none";
    for (let i = 0; i < rtl.length; i++) {
        mypos[i].setMap(null);
    }
    options.enableHighAccuracy = false;
    navigator.geolocation.clearWatch(watch);
    accuracyloc.style.color = "black";
    myloc.onclick = null;
    count = 0;
    rtl = [];
    mypos = [];
    cancel.style.display = "none";
    accuracyloc.style.display = "none";
};

accuracyloc.onclick = () => {
    if (options.enableHighAccuracy == false) {
        options.enableHighAccuracy = true;
        accuracyloc.style.color = "red";
    } else if (options.enableHighAccuracy == true) {
        options.enableHighAccuracy = false;
        accuracyloc.style.color = "black";
    }
};

Ksearch[0].addEventListener("keydown", (ev) => {
    if (ev.keyCode == 13) {
        let places = new kakao.maps.services.Places();
        places.keywordSearch(Ksearch[0].value, (result, status) => {
            if (status === kakao.maps.services.Status.OK) {
                for (let i = 0; i < markers.length; i++) {
                    markers[i].setMap(null);
                }
                move = [];
                markers = [];
                //console.log(result, result.length);
                for (let i = 0; i < result.length; i++) {
                    move[i] = new kakao.maps.LatLng(result[i].y, result[i].x);

                    markers[i] = new kakao.maps.Marker({
                        position: move[i],
                    });
                    markers[i].setMap(Kmap);// 마커 표시
                    //markers.push(marker);
                }
                Kmap.setCenter(move[0]); // 중심
            } else if (status === kakao.maps.services.Status.ZERO_RESULT) {

                errorMsg('검색 결과가 없습니다.');
                return;
            } else if (status === kakao.maps.services.Status.ERROR) {

                errorMsg('[서버 응답 오류]');
                return;
            }

            let output = "<table>"
            for (let i = 0; i < result.length; i++) {
                output +=
                    "<tr>" +
                    "<td>" + result[i].address_name + ", " + result[i].place_name + "</td>" +
                    "</tr>"
            }
            Klist.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
            Klist.innerHTML = output;

            for (let j = 0; j < result.length; j++) {
                const Event = Klist.children[0].children[0].children[j].children[0];
                Event.onmousedown = () => {
                    Event.style.backgroundColor = "#4d80e4"
                };
                Event.onmouseup = () => {
                    Event.style.backgroundColor = "#46b3e6"
                    for (let i = 0; i < markers.length; i++) {
                        markers[i].setMap(null);
                    }
                    markers[j].setMap(Kmap);
                    Kmap.panTo(move[j]);
                }
                Event.onmouseover = () => {
                    Event.style.backgroundColor = "#46b3e6"
                }
                Event.onmouseout = () => {
                    Event.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
                }
            }
        });
    }
});

Sicon.onmousedown = () => {
    Sicon.style.color = "#676060";
}
Sicon.onmouseup = () => {
    Sicon.style.color = "#000";
    if (view.style.display == "") {
        view.style.display = "block";
    } else if (view.style.display == "block") {
        view.style.display = ""; // "" == none
        k_search.value = "";
        k_list.innerHTML = "";
        k_list.style.backgroundColor = null;
    };
}