export const loadCashfreeSDK = () => {
    return new Promise((resolve, reject) => {

        // ✅ Already loaded
        if (window.Cashfree) {
            resolve(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
        script.async = true;

        script.onload = () => {
            if (window.Cashfree) {
                resolve(true);
            } else {
                reject(new Error("Cashfree SDK loaded but not available"));
            }
        };

        script.onerror = () => {
            reject(new Error("Failed to load Cashfree SDK"));
        };

        document.body.appendChild(script);
    });
};