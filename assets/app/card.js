// assets/app/card.js - Zaktualizowana wersja z rozwijaniem dodatkowych danych

document.addEventListener('DOMContentLoaded', function() {
    // Aktualizacja czasu
    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('pl-PL', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        const dateString = now.toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        
        const timeElement = document.getElementById('time');
        if (timeElement) {
            timeElement.textContent = `Czas: ${timeString} ${dateString}`;
        }
    }
    
    updateTime();
    setInterval(updateTime, 1000);
    
    // Obsługa przycisku kopiuj
    const copyButtons = document.querySelectorAll('.main_button_filled');
    copyButtons.forEach(button => {
        if (button.textContent.includes('Kopiuj')) {
            button.addEventListener('click', function() {
                const seriesNumber = document.getElementById('seriesAndNumber');
                if (seriesNumber) {
                    navigator.clipboard.writeText(seriesNumber.textContent)
                        .then(() => {
                            const originalText = button.textContent;
                            button.textContent = 'Skopiowano!';
                            setTimeout(() => {
                                button.textContent = originalText;
                            }, 2000);
                        })
                        .catch(err => {
                            console.error('Błąd kopiowania:', err);
                        });
                }
            });
        }
    });
    
    // Inicjalizacja daty aktualizacji
    const lastUpdateValue = document.getElementById('lastUpdateValue');
    if (lastUpdateValue) {
        const now = new Date();
        lastUpdateValue.textContent = now.toLocaleDateString('pl-PL');
    }

    // Obsługa aktualizacji
    const updateButtons = document.querySelectorAll('.update');
    updateButtons.forEach(button => {
        button.addEventListener('click', function() {
            const originalText = button.textContent;
            button.textContent = 'Aktualizowanie...';
            button.disabled = true;
            
            setTimeout(() => {
                button.textContent = 'Zaktualizowano!';
                if (lastUpdateValue) {
                    const now = new Date();
                    lastUpdateValue.textContent = now.toLocaleDateString('pl-PL');
                }
                setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                }, 2000);
            }, 1500);
        });
    });
    
    // OBSŁUGA ROZWIJANIA DODATKOWYCH DANYCH
    const infoHolder = document.querySelector('.info_holder');
    if (infoHolder) {
        infoHolder.addEventListener('click', function() {
            // Przełącz klasę .unfolded
            this.classList.toggle('unfolded');
            
            // Aktualizuj strzałkę (CSS już to obsługuje przez klasę .unfolded)
            const arrow = this.querySelector('.action_arrow');
            if (arrow) {
                // CSS już obsługuje transform przez klasę .unfolded
                console.log('Rozwinięto/zwinięto dodatkowe dane');
            }
        });
        
        // Upewnij się, że początkowo jest zwinięte
        infoHolder.classList.remove('unfolded');
    }
});