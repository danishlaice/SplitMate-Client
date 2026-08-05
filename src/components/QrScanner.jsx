import { Html5Qrcode } from "html5-qrcode";
import { useEffect } from "react";

function QrScanner({ onScanSuccess }) {
  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");

    html5QrCode
      .start(
        { facingMode: "environment" }, // Back Camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScanSuccess(decodedText);

          html5QrCode
            .stop()
            .then(() => html5QrCode.clear())
            .catch(() => {});
        },
        () => {
          // Ignore scan errors
        }
      )
      .catch((err) => {
        console.error("Camera Error:", err);
      });

    return () => {
      html5QrCode
        .stop()
        .then(() => html5QrCode.clear())
        .catch(() => {});
    };
  }, [onScanSuccess]);

  return <div id="reader" className="w-full"></div>;
}

export default QrScanner;