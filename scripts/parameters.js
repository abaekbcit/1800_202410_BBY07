const slider = document.getElementById('input-parameters');
        const sliderValueSpan = document.getElementById('sliderValue');

        slider.addEventListener('input', () => {
            sliderValueSpan.textContent = slider.value;
        });

        function saveSliderValue() {
            const sliderValue = slider.value;
        }