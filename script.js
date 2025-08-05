const video = document.getElementById('video');
const canvas = document.getElementById('stripCanvas');
const context = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const downloadLink = document.getElementById('downloadLink');
const countdownDisplay = document.getElementById('countdown');

// 📸 Square photo settings
const photoSize = 200;
const margin = 15;
const borderRadius = 40;
const footerHeight = 80;
const totalHeight = (photoSize * 4) + (margin * 5) + footerHeight;

canvas.width = photoSize + margin * 2;
canvas.height = totalHeight;

// 🎥 Access webcam
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    console.error("Camera access error:", err);
    alert("Please allow camera access.");
  });

// 🖼️ Start capturing strip
startBtn.addEventListener('click', async () => {
  countdownDisplay.textContent = '';
  downloadLink.style.display = 'none';

  // Clear canvas
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 4; i++) {
    await runCountdown(3);

    const x = margin;
    const y = margin + i * (photoSize + margin);

    drawRoundedImage(context, video, x, y, photoSize, photoSize, borderRadius);
  }

  // 🕓 Add timestamp
  const date = new Date();
  const timestamp = `Striply - ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  context.fillStyle = "#333";
  context.font = "14px monospace";
  context.textAlign = "center";
  context.fillText(timestamp, canvas.width / 2, canvas.height - 30);

  // Export image
  const imageURL = canvas.toDataURL('image/png');
  downloadLink.href = imageURL;
  downloadLink.style.display = 'inline-block';
});

// ⏳ Countdown logic
function runCountdown(seconds) {
  return new Promise((resolve) => {
    let current = seconds;
    countdownDisplay.textContent = current;

    const interval = setInterval(() => {
      current--;
      if (current > 0) {
        countdownDisplay.textContent = current;
      } else {
        clearInterval(interval);
        countdownDisplay.textContent = '📸';
        setTimeout(() => {
          countdownDisplay.textContent = '';
          resolve();
        }, 600);
      }
    }, 1000);
  });
}

// 🟪 Draw rounded image on canvas
function drawRoundedImage(ctx, img, x, y, width, height, radius) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, x, y, width, height);
  ctx.restore();
}
