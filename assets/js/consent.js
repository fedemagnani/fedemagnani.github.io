function loadAnalytics() {
    // Create the GA script
    var gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-HKMV72T3J1';
    document.head.appendChild(gaScript);

    gaScript.onload = function () {
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', 'G-HKMV72T3J1');
    };
}

// <!-- enable me! -->
// // Check consent on page load
// document.addEventListener('DOMContentLoaded', function () {
//     const consent = localStorage.getItem('analytics_consent');
//     if (consent === 'true') {
//         loadAnalytics();
//     }
// });

// // Example consent button handler
// document.getElementById('accept-analytics').addEventListener('click', function () {
//     localStorage.setItem('analytics_consent', 'true');
//     loadAnalytics();
//     document.getElementById('cookie-banner').style.display = 'none';
// });

// document.getElementById('reject-analytics').addEventListener('click', function () {
//     localStorage.setItem('analytics_consent', 'false');
//     document.getElementById('cookie-banner').style.display = 'none';
// });


// rm
loadAnalytics();
