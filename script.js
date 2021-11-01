const video = document.getElementById('webcam');
const liveView = document.getElementById('live-view');
const recogniseSection = document.getElementById('recognise');
const enableWebcamButton = document.getElementById('webcam-button');
const closeWebcamButton = document.getElementById('close-webcam-button');
//Złapanie wszystkich elemenetów, które mają klasę classify-on-click
const imageContainers = document.getElementsByClassName('classify-on-click');
let model = undefined;


// Przed uzyciem COCO-SSD, musimy poczekać, aby COCO-SSD zakończyła swoje ładowanie
// Modele ML potrafią zajmować dużo miejsce, co może wymagać dłuższej chwili na załadowanie się
cocoSsd.load().then((loadedModel) => {
    model = loadedModel;
    // Jeżli zninknie przezroczystość, oznaczać to będzie że model został załadowany na stronę
    // Usuwamy klasę odpowiedzialną na nałożenie przezroczystości
    recogniseSection.classList.remove('photo-and-cam');
});

// Funckja informaująca użytkownika o tym że model AI jeszcze nie został załadowany 
const loadedModel = () => {
    if(!model) {
        console.log("Poczekaj na załadowanie modelu przed kliknięciem!");
        return;
    }
}

// Utworzenie ramek na zidentyfikowane obiekty oraz pokazanie pewności rozpoznania obiektu dla zdjęć
const photoIdentify = (predictions) => {
    for(let i = 0; i < predictions.length; i++) {
        // Stworzenie paragrafu, gdzie będzie pokazany wynik prognozy 
        const p = document.createElement('p');
        p.innerText = `${predictions[i].class} - z 
        ${Math.round(parseFloat(predictions[i].score) * 100)} % pewności.`

        // Umieszczenie ramki ograniczającej wysokości zajmowania tekstu
        // oraz umieszczenie jej nad divem pokazującym zidentyfikowany obiket
        p.style = 'left: ' + predictions[i].bbox[0] + 'px;' + 
        'top: ' + predictions[i].bbox[1] + 'px; ' + 
        'width: ' + (predictions[i].bbox[2] - 10) + 'px;';

        //utworzenie div-a w kótrym będzie znajdować zidentyfikowany obikt
        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style = 'left: ' + predictions[i].bbox[0] + 'px;' +
        'top: ' + predictions[i].bbox[1] + 'px;' +
        'width: ' + predictions[i].bbox[2] + 'px;' +
        'height: ' + predictions[i].bbox[3] + 'px;';

        event.target.parentNode.appendChild(highlighter);
        event.target.parentNode.appendChild(p);

    }
}

// Utworzenie ramek na zidentyfikowane obiekty oraz pokazanie pewności rozpoznania obiektu dla kamerki
const webcamIdentify = (predictions) => {
    for(let i = 0; i < predictions.length; i++) {
        // Stworzenie paragrafu, gdzie będzie pokazany wynik prognozy 
        const p = document.createElement('p');
        p.innerText = `${predictions[i].class} - z 
        ${Math.round(parseFloat(predictions[i].score) * 100)} % pewności.`

        // Umieszczenie ramki ograniczającej wysokości zajmowania tekstu
        // oraz umieszczenie jej nad divem pokazującym zidentyfikowany obiket
        p.style = 'left: ' + predictions[i].bbox[0] + 'px;' + 
        'top: ' + predictions[i].bbox[1] + 'px; ' + 
        'width: ' + (predictions[i].bbox[2] - 10) + 'px;';

        //utworzenie div-a w kótrym będzie znajdować zidentyfikowany obikt
        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style = 'left: ' + predictions[i].bbox[0] + 'px;' +
        'top: ' + predictions[i].bbox[1] + 'px;' +
        'width: ' + predictions[i].bbox[2] + 'px;' +
        'height: ' + predictions[i].bbox[3] + 'px;';

        liveView.appendChild(highlighter);
        liveView.appendChild(p);
        
        //Przechowuje w pamięci narysowane obiekty aby mogły podążać za obiektem  
        children.push(highlighter);
        children.push(p);
    }
}

// Kiedy zdjęcie zostało kliknięte mechanizm modułu rozpozna co znajduje się na zdjęciu i pokaże rezultat
const handleClick = (event) => {
    loadedModel();
    //argument predictions będzie pokazywać nam w ilu % jesteśmy pewnie co do zidentyfikowanej rzeczy
    model.detect(event.target).then( (predictions) => {
        photoIdentify(predictions);
    });
}

// W tej sekcji kodu zostanie napisanie łapanie zdjęć i klasyfikowanie elementów znajdujących się na nich
// Będzie to działać tak samo na zdjęcia od razu dodanych na stronę jak i ze zdjęciami załadowanymi z pliku
//Przeiterujmy przez wszystkie elementy posiadające klasę classify-on-click i dodajmy event kliknięcia
for(let i = 0; i < imageContainers.length; i++) {
    // .children[0] jest użyte z powodu tego że chcemy dodać element kliknęcia na dziecko diva któego klase złapaliśmy
    // a pierwszym dzieckiem każdego diva ze zdjęciem czy potem załądowania się zdjęcia jest img ze zdjęciem 
    // Na nim też zostaną pokazane identyfikację obrazka
    imageContainers[i].children[0].addEventListener('click', handleClick);
} 

// W tej sekcji kodu zostanie napisanie otwieranie kamerki i klasyfikowanie elementów znajdujących się na nej

// Sprawdzamy czy mamy dostęp do kamerki 
const hasGetUserCam = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// Poniżej bedziemy w tablicy zachowywać referencje wszystkich elementów podrzędnych jakie stworzymy
let children = [];



// Kiedy zdjęcie został kliknięty przycisk odpalenia kamerki modułu rozpoczyna identyfikowanie co się w kamerce i pokaże rezultat
const predictWebcam = () =>  {
    // Now let's start classifying the stream.
    model.detect(video).then(function (predictions) {
      // Remove any highlighting we did previous frame.
      for (let i = 0; i < children.length; i++) {
        liveView.removeChild(children[i]);
      }
      children.splice(0);
      //argument predictions będzie pokazywać nam w ilu % jesteśmy pewnie co do zidentyfikowanej rzeczy
      webcamIdentify(predictions);

      //Wywołaj tę funkcję ponownie, aby przewidywać, kiedy przeglądarka jest gotowa.
      window.requestAnimationFrame(predictWebcam);
    });
  }

// Dostęp do kamerki internetowej i klasyfikowanie i indetyfikowanie obiektów znajdujących się polu kamerki 
const enableCam = (event) => {
    loadedModel();
    const contraints = {
        video: true
    };

    //Aktywowanie działania kamerki
    navigator.mediaDevices.getUserMedia(contraints).then( (stream) => {
        video.srcObject = stream;
        video.addEventListener('loadeddata', predictWebcam);
        video.style.display = "block";
    })
}

const closeWebcam = () => {
    // Obiekt MediaStream wideo jest dostępny poprzez jego atrybut srcObject
    const mediaStream = video.srcObject;

    // Poprzez MediaStream możesz uzyskać MediaStreamTracks za pomocą getTracks():
    const webCam = mediaStream.getTracks();

    // Ścieżki są zwracane jako tablica, więc jeśli wiesz, że masz tylko jedną, możesz ją zatrzymać za pomocą:
    webCam[0].stop();

    webCam.forEach((webCam) => {
        webCam.stop()
        video.style.display = "none";
    });
}

// Jeśli kamera jest obługiwana dodajemy event na przycisk do odpalenia kamerki w naszej aplikacji
if(hasGetUserCam()) {
    enableWebcamButton.addEventListener('click', enableCam);
    closeWebcamButton.addEventListener('click', closeWebcam);
} else {
    alert("hasGetUserCam() nie obsługuje twojej przeglądarki.")
}


// Załadowanie zdjęcia z komputera
imgInp.onchange = (event) => {
    const [file] = imgInp.files
    if (file) {
      blah.src = URL.createObjectURL(file)
    }
  }

  
