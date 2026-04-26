// config.js - Plik konfiguracyjny mObywatel
// Edytuj te dane poniżej ↓↓↓

const userData = {
    // === DANE OSOBOWE ===
    name: "JAKUB",
    surname: "SAWICKI",
    familyName: "SAWICKI",
    sex: "MĘŻCZYZNA",
    
    // === DANE URODZENIA ===
    birthday: "2007-08-21",
    pesel: "07282102957",
    birthPlace: "OLSZTYN",
    countryOfBirth: "POLSKA",
    
    // === DANE DOKUMENTU ===
    seriesAndNumber: "GHB 749563",
    givenDate: "2025-09-11",
    expiryDate: "2035-09-11",
    nationality: "POLSKIE",
    
    // === DANE RODZICÓW ===
    fathersName: "FRANCISZEK",
    fathersFamilyName: "SAWICKI",
    mothersName: "ARLETA",
    mothersFamilyName: "WIŚNIEWSKA",
    
    // === DANE ADRESOWE ===
    adress: "UL. OWOCOWA 15<br>10-047, OLSZTYN",
    homeDate: "2020-01-10",
    
    // === ZDJĘCIE ===
    // Możesz wstawić tutaj URL do zdjęcia lub base64
    // UWAGA: Linki z ImgBB typu https://ibb.co/rfQX5yX0 to strony przeglądarki. 
    // Musisz użyć "Kopiuj adres obrazu" (direct link), np. https://i.ibb.co/xxxx/image.jpg
    photoUrl: "https://i.ibb.co/bR6GNdGm/Subject.jpg"
};

// ==============================================
// NIE EDYTUJ PONIŻSZEGO KODU - TO JEST AUTOMATYCZNE
// ==============================================

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

function injectUserData() {
    console.log('Ładowanie danych z config.js...');
    
    // Podstawowe dane
    if (document.getElementById('name')) document.getElementById('name').textContent = userData.name;
    if (document.getElementById('surname')) document.getElementById('surname').textContent = userData.surname;
    if (document.getElementById('nationality')) document.getElementById('nationality').textContent = userData.nationality;
    if (document.getElementById('birthday')) document.getElementById('birthday').textContent = formatDate(userData.birthday);
    if (document.getElementById('pesel')) document.getElementById('pesel').textContent = userData.pesel;
    
    // Dane dokumentu
    if (document.getElementById('seriesAndNumber')) document.getElementById('seriesAndNumber').textContent = userData.seriesAndNumber;
    if (document.getElementById('expiryDate')) document.getElementById('expiryDate').textContent = formatDate(userData.expiryDate);
    if (document.getElementById('givenDate')) document.getElementById('givenDate').textContent = formatDate(userData.givenDate);
    if (document.getElementById('fathersName')) document.getElementById('fathersName').textContent = userData.fathersName;
    if (document.getElementById('mothersName')) document.getElementById('mothersName').textContent = userData.mothersName;
    
    // Dodatkowe dane
    if (document.getElementById('familyName')) document.getElementById('familyName').textContent = userData.familyName;
    if (document.getElementById('sex')) document.getElementById('sex').textContent = userData.sex;
    if (document.getElementById('fathersFamilyName')) document.getElementById('fathersFamilyName').textContent = userData.fathersFamilyName;
    if (document.getElementById('mothersFamilyName')) document.getElementById('mothersFamilyName').textContent = userData.mothersFamilyName;
    if (document.getElementById('birthPlace')) document.getElementById('birthPlace').textContent = userData.birthPlace;
    if (document.getElementById('countryOfBirth')) document.getElementById('countryOfBirth').textContent = userData.countryOfBirth;
    if (document.getElementById('adress')) document.getElementById('adress').innerHTML = userData.adress;
    
    // Data zameldowania
    if (document.querySelector('.home_date')) document.querySelector('.home_date').textContent = formatDate(userData.homeDate);
    
    // Zdjęcie
    if (userData.photoUrl) {
        const photoElement = document.querySelector('.id_own_image');
        if (photoElement) {
            photoElement.style.backgroundImage = `url(${userData.photoUrl})`;
        }
    }
    
    console.log('Dane mObywatel załadowane pomyślnie!');
}

// Automatyczne uruchomienie
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectUserData);
} else {
    injectUserData();
}
