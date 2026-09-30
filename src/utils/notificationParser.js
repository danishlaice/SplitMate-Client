/**
 * Notification Parser Utility
 * Extracts merchant/payee name, amount, date, and time from payment & UPI notification texts.
 */

export function parsePaymentNotification(text = "", title = "") {
  if (!text && !title) return null;

  const fullText = `${title ? title + " " : ""}${text}`.trim();

  // Common payment indicator check
  const paymentKeywords = [
    "paid",
    "payment",
    "debited",
    "sent",
    "transfer",
    "successful",
    "transferred",
    "txn",
    "upi",
  ];
  const hasPaymentKeyword = paymentKeywords.some((kw) =>
    fullText.toLowerCase().includes(kw)
  );

  if (!hasPaymentKeyword) {
    return null;
  }

  // 1. Extract Amount
  // Matches: ₹180, ₹ 180.50, Rs. 180, Rs 180, INR 180, paid 180
  let amount = null;
  const amountRegex =
    /(?:(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)|(?:paid|debited|sent)\s*(?:(?:₹|rs\.?|inr)\s*)?([\d,]+(?:\.\d{1,2})?))/i;
  const amountMatch = fullText.match(amountRegex);

  if (amountMatch) {
    const rawVal = amountMatch[1] || amountMatch[2];
    if (rawVal) {
      const cleanVal = parseFloat(rawVal.replace(/,/g, ""));
      if (!isNaN(cleanVal) && cleanVal > 0) {
        amount = cleanVal;
      }
    }
  }

  if (!amount) return null;

  // 2. Extract Merchant / Payee
  let merchant = null;
  // Patterns like: "paid to ABC Store", "sent to John", "at Starbucks", "transfer to XYZ"
  const merchantPatterns = [
    /(?:paid\s+to|sent\s+to|transfer\s+to|debited\s+for|paying)\s+([A-Za-z0-9\s&'.,-]+?)(?:\s+(?:on|ref|upi|via|using|from|at|dated|\.|\n|$))/i,
    /(?:at)\s+([A-Za-z0-9\s&'.,-]+?)(?:\s+(?:on|ref|upi|via|using|from|\.|\n|$))/i,
    /(?:to)\s+([A-Za-z0-9\s&'.,-]+?)(?:\s+(?:on|ref|upi|via|using|from|\.|\n|$))/i,
  ];

  for (const pattern of merchantPatterns) {
    const match = fullText.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      // Filter out non-merchant noise words
      if (
        candidate &&
        !/^(account|a\/c|bank|vpa|card|successful|success)$/i.test(candidate) &&
        candidate.length >= 2 &&
        candidate.length <= 50
      ) {
        merchant = candidate;
        break;
      }
    }
  }

  // 3. Extract Date and Time (or default to current)
  const now = new Date();

  // Try extracting time like "02:35 PM" or "14:35"
  let timeStr = formatTime12Hour(now);
  const timeMatch = fullText.match(/(\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?)/i);
  if (timeMatch && timeMatch[1]) {
    timeStr = normalizeTime(timeMatch[1].trim());
  }

  // Date formatting: YYYY-MM-DD for form input, plus display formatting
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateFormatted = `${year}-${month}-${day}`;

  // 4. Generate deterministic transaction identifier for de-duplication
  const sanitizedMerchant = (merchant || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const transactionId = `tx_${amount}_${sanitizedMerchant}_${dateFormatted}_${timeStr.replace(/[^a-z0-9]/gi, "")}`;

  return {
    isPayment: true,
    amount,
    merchant: merchant || "Merchant",
    date: dateFormatted,
    time: timeStr,
    displayDate: formatDisplayDate(now),
    transactionId,
    rawText: fullText,
  };
}

export function formatTime12Hour(date = new Date()) {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const formattedHours = String(hours).padStart(2, "0");
  return `${formattedHours}:${minutes} ${ampm}`;
}

export function normalizeTime(rawTime = "") {
  if (!rawTime) return formatTime12Hour();
  const clean = rawTime.toUpperCase().trim();
  if (clean.includes("AM") || clean.includes("PM")) {
    return clean;
  }
  // If 24-hr format like "14:35"
  const parts = clean.split(":");
  if (parts.length >= 2) {
    let hrs = parseInt(parts[0], 10);
    const mins = parts[1].slice(0, 2);
    if (!isNaN(hrs)) {
      const ampm = hrs >= 12 ? "PM" : "AM";
      hrs = hrs % 12 || 12;
      return `${String(hrs).padStart(2, "0")}:${mins} ${ampm}`;
    }
  }
  return clean;
}

export function formatDisplayDate(dateInput) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
}
