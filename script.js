document.addEventListener('DOMContentLoaded', () => {
    // Google Sheet URL (CSV Format)
    const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1QPeJW0LbygqAyXF2Nhsu5fkRosaPrwK-JgP9L00o7hs/export?format=csv';

    // Fetch Data
    fetch(SHEET_CSV_URL)
        .then(response => response.text())
        .then(csvText => {
            const rows = csvText.split('\n').map(row => row.split(','));

            // Debug: Log parsed rows
            console.log("Parsed Rows:", rows);

            let totalCollected = 0;
            let goalAmount = 0;
            let fixedExpenses = "0 $";

            // Parse Goal & Expenses from Row 2 (Index 1)
            // Column C (Index 2) is "objectif", Column D (Index 3) is "dépense fixes"
            if (rows[1]) {
                goalAmount = parseFloat(rows[1][2].replace(/[$\s]/g, '').replace(',', '.')) || 50000;
                fixedExpenses = rows[1][3] ? rows[1][3].trim() : "1 350 $";
            }

            // Calculate Total from Column B (Index 1) starting row 2
            for (let i = 1; i < rows.length; i++) {
                const amountStr = rows[i][1];
                if (amountStr) {
                    const amount = parseFloat(amountStr.replace(/[$\s]/g, '').replace(',', '.'));
                    if (!isNaN(amount)) {
                        totalCollected += amount;
                    }
                }
            }

            const remaining = Math.max(0, goalAmount - totalCollected);
            const percentage = Math.min(100, (totalCollected / goalAmount) * 100);

            // Update DOM
            document.getElementById('goal-amount').textContent = goalAmount.toLocaleString('fr-FR') + ' $';
            document.getElementById('remaining-amount').textContent = remaining.toLocaleString('fr-FR') + ' $';
            document.getElementById('expenses-amount').textContent = fixedExpenses + (fixedExpenses.includes('$') ? '' : ' $') + ' / mois';

            document.querySelector('.amount').textContent = '0'; // Reset for animation
            document.querySelector('.amount').setAttribute('data-target', totalCollected);
            document.querySelector('.goal-label').textContent = 'sur ' + goalAmount.toLocaleString('fr-FR') + ' $';

            // Re-trigger Animation
            const circle = document.querySelector('.progress-ring__circle');
            const radius = circle.r.baseVal.value;
            const circumference = radius * 2 * Math.PI;
            const offset = circumference - (percentage / 100) * circumference;

            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            circle.style.strokeDashoffset = circumference; // Start empty

            setTimeout(() => {
                circle.style.strokeDashoffset = offset;
            }, 500);

            animateValue(document.querySelector('.amount'), 0, totalCollected, 2000);

        })
        .catch(error => console.error('Error fetching data:', error));


    // Circular Progress Animation (Initial Placeholder removed, logic moved to fetch)
    const circle = document.querySelector('.progress-ring__circle');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;

    // Default State before load
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;


    // Generate QR Code
    // Generate QR Code
    new QRCode(document.getElementById("qrcode"), {
        text: "Don.acmrn@gmail.com",
        width: 64,
        height: 64,
        colorDark: "#0f172a",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
});

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentVal = Math.floor(easeOutQuart * (end - start) + start);
        obj.innerHTML = currentVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function copyEmail() {
    const emailText = document.getElementById('donation-email').innerText;
    const tooltip = document.getElementById('copy-tooltip');
    navigator.clipboard.writeText(emailText).then(() => {
        tooltip.classList.add('show');
        setTimeout(() => {
            tooltip.classList.remove('show');
        }, 2000);
    });
}

/* Quran Verses Popup Logic */
const verses = [
    {
        arabic: "(مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ فِي كُلِّ سُنبُلَةٍ مِّائَةُ حَبَّةٍ ۗ وَاللَّهُ يُضَاعِفُ لِمَن يَشَاءُ ۗ وَاللَّهُ وَاسِعٌ عَلِيمٌ)",
        french: "Ceux qui dépensent leurs biens dans le sentier d'Allah ressemblent à un grain d'où naissent sept épis, à cent grains l'épi. Car Allah multiplie la récompense à qui Il veut et la grâce d'Allah est immense, et Il est Omniscient.",
        ref: "Sourate Al-Baqarah, 2:261"
    },
    {
        arabic: "لَن تَنَالُوا الْبِرَّ حَتَّىٰ تُنفِقُوا مِمَّا تُحِبُّونَ ۚ وَمَا تُنفِقُوا مِن شَيْءٍ فَإِنَّ اللَّهَ بِهِ عَلِيمٌ",
        french: "Vous n'atteindrez la vraie piété que si vous faites largesses de ce que vous chérissez. Tout ce que vous faites comme dépense, Allah le sait parfaitement.",
        ref: "Sourate Al-Imran, 3:92"
    },
    {
        arabic: "الَّذِينَ يُنفِقُونَ أَمْوَالَهُم بِاللَّيْلِ وَالنَّهَارِ سِرًّا وَعَلَانِيَةً فَلَهُمْ أَجْرُهُمْ عِندَ رَبِّهِمْ وَلَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ",
        french: "Ceux qui, de nuit et de jour, en secret et ouvertement, dépensent leurs biens (dans les bonnes oeuvres), ont leur salaire auprès de leur Seigneur. Il n'y a aucune crainte à avoir pour eux, et ils ne seront point affligés.",
        ref: "Sourate Al-Baqarah, 2:274"
    },
    {
        arabic: "وَمَا أَنفَقْتُم مِّن شَيْءٍ فَهُوَ يُخْلِفُهُ ۖ وَهُوَ خَيْرُ الرَّازِقِينَ",
        french: "Et toute dépense que vous faites (dans le bien), Il la remplace, et c'est Lui le Meilleur des donateurs.",
        ref: "Sourate Saba, 34:39"
    }
];

function showOverlay() {
    const overlay = document.getElementById('quran-overlay');
    const arabicEl = document.getElementById('verse-arabic');
    const frenchEl = document.getElementById('verse-french');
    const refEl = document.getElementById('verse-ref');

    const verse = verses[Math.floor(Math.random() * verses.length)];

    arabicEl.innerText = verse.arabic;
    frenchEl.innerText = verse.french;
    refEl.innerText = verse.ref;

    overlay.classList.remove('hidden');

    // Auto hide after 30 seconds
    setTimeout(closeOverlay, 30000);
}

function closeOverlay() {
    const overlay = document.getElementById('quran-overlay');
    overlay.classList.add('hidden');
}

// Initial call to set interval (2 minutes)
setInterval(showOverlay, 120000);

// Uncomment to test popup immediately
// setTimeout(showOverlay, 3000);
