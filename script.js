const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

const weddingDatePerm = new Date("2026-07-31T11:00:00+05:00");

function pad(value) {
  return String(value).padStart(2, "0");
}

function setCountdownValues(days, hours, minutes, seconds) {
  daysEl.textContent = pad(days);
  hoursEl.textContent = pad(hours);
  minutesEl.textContent = pad(minutes);
  secondsEl.textContent = pad(seconds);
}

function updateCountdown() {
  const nowUtcMs = Date.now();
  const targetUtcMs = weddingDatePerm.getTime();
  const diffMs = targetUtcMs - nowUtcMs;

  if (diffMs <= 0) {
    setCountdownValues(0, 0, 0, 0);
    return;
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  setCountdownValues(days, hours, minutes, seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);

const revealSections = document.querySelectorAll(".reveal-section");

if (revealSections.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.2 }
  );

  revealSections.forEach((section) => observer.observe(section));
}

// ОТПРАВКА ФОРМЫ БЕЗ ПЕРЕЗАГРУЗКИ СТРАНИЦЫ
const weddingForm = document.querySelector('form');
const rsvpContainer = document.querySelector('.rsvp-panel');

if (weddingForm && rsvpContainer) {
  weddingForm.addEventListener('submit', async function(event) {
    event.preventDefault(); // Это главное! Блокирует открытие окна Formspree
    
    // Находим кнопку и меняем текст, чтобы гость видел, что процесс пошел
    const submitBtn = weddingForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Отправка...';
    submitBtn.disabled = true;

    // Собираем данные из полей анкеты
    const formData = new FormData(weddingForm);
    
    try {
      // Отправляем данные на Formspree в фоновом режиме
      const response = await fetch(weddingForm.action, {
        method: weddingForm.method,
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        // Если всё ушло, плавно заменяем анкету на красивое спасибо
        rsvpContainer.innerHTML = `
          <div class="text-center py-8 animate-fade-in">
            <h4 class="heading-font text-2xl md:text-5xl text-[#7b866f]">СПАСИБО!</h4>
            <p class="mt-4 text-lg md:text-[2.2rem] decorative-script leading-relaxed text-stone-700">
              Ваша анкета успешно доставлена.<br>
              Олег и Екатерина очень ждут вас!
            </p>
          </div>
        `;
      } else {
        throw new Error('Ошибка при отправке');
      }
    } catch (error) {
      // Если что-то сломалось (например, у гостя пропал интернет)
      alert('Произошла ошибка. Пожалуйста, попробуйте еще раз.');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}